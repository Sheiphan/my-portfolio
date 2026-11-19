---
title: "Building MCP Servers That Survive Production: 12 Design Decisions"
date: "2026-11-19"
summary: "What it takes to move a Model Context Protocol server from demo to multi-tenant production: stateless transport, verified identity, fail-closed access checks, composite tools, safe writes, agent-friendly contracts, MCP Apps and testing the public surface."
tags: ["MCP", "Model Context Protocol", "MCP Apps", "LLM Agents", "Backend Engineering", "Security"]
---

# Building MCP Servers That Survive Production

A demo MCP server is twenty lines: decorate a function, return some JSON, done. A production one has to answer harder questions. Who is calling? Which tenant's data may they see? What happens when an agent invents an argument, a replica dies mid-session, or a tool can delete things? And how do you design tools so that an LLM actually uses them well?

I've spent much of this year building MCP servers that put real, multi-tenant data in front of LLM agents, running on Kubernetes behind a central MCP gateway. This post is the set of design decisions I'd make again. None of it depends on a particular product, so you can apply it to any MCP server.

## MCP in 90 seconds

The [Model Context Protocol](https://modelcontextprotocol.io) is a standard way for an AI application (the *host*, such as Claude, an IDE or your own agent) to discover and call capabilities on a *server*. The pieces that matter here:

| Primitive | What it is |
|---|---|
| **Tools** | Functions the model can call, each with a JSON Schema for its inputs |
| **Resources** | Read-only content addressed by URI, such as files, records or HTML views |
| **Prompts** | Reusable prompt templates the server offers to the user |
| **Annotations** | Hints about a tool's behavior, such as `readOnlyHint`, `destructiveHint` and `idempotentHint` |
| **Elicitation** | The server asks the user a structured question in the middle of a call |
| **Streamable HTTP** | The remote transport: JSON-RPC over HTTP, optionally streamed |
| **MCP Apps** | An extension: a tool points at an HTML view that the host renders in a sandboxed iframe |

## A common production shape

```
LLM host ──► MCP gateway ──► your MCP server ──► internal services and databases
             │                 │                    ▲
             authenticates     verifies the         short-lived service credential,
             the user,         gateway, checks      scoped to the caller's tenant
             aggregates many   flags and access,
             MCP servers       then runs the tool
```

A central gateway is the right shape for an organization with many MCP servers. It owns user login, puts every team's tools behind one endpoint, and forwards the caller's identity to each server. But "the gateway handles auth" is not a security model for the server behind it, which brings us to the decisions.

## 1. Use stateless Streamable HTTP from day one

The first production bug most teams hit has nothing to do with AI. Run two replicas, and a session opened on pod A is unknown to pod B, so tool calls fail at random with `404 Session not found`.

Streamable HTTP can keep per-session state in memory, which ties a client to one process. Unless you really need server-side session state, turn it off and keep any state you need in the request or in a shared store:

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP(name="my-server", stateless_http=True)
```

Then **test it the way it fails**: start two independent server instances in one test, send `initialize` to the first and `tools/list` to the second, and assert that it works.

## 2. Verify the caller; treat identity headers as claims

A gateway typically forwards the user and tenant as headers. Anything that can reach your pod can send headers too, so the server should do two separate things:

1. **Verify the gateway.** Require the gateway's own signed token on every request, and check its signature, expiry and a required scope. Look public keys up by the token's issuer, and re-scan your key directory on a cache miss so key rotation needs no restart. No token or a bad one gets `401`.
2. **Put identity in request-scoped context.** A middleware copies the tenant and user into context variables, so tools can read the caller's identity without passing it through every function.

```python
import contextvars

request_tenant = contextvars.ContextVar("request_tenant", default="")
request_user = contextvars.ContextVar("request_user", default="")
```

A verified token proves the request came *through the gateway*, but the tenant is still the gateway's claim. That is why every tool call should also be authorized on its own (decision 3).

Watch for one subtle case: **discovery**. When a gateway registers your server, it may call `initialize` and `tools/list` with a service identity that has no tenant. Allow those requests with a verified token, but make every tool refuse to run without a tenant.

Finally, make development shortcuts impossible to ship. If your image supports an "auth bypass" mode for local runs, refuse to start with it inside a cluster, and never combine a default tenant with tenant-less requests. Together they quietly pin anonymous traffic to one customer's data.

## 3. Put every tool call through the same gates, and fail closed

Wrap every tool in one decorator that runs the same steps in the same order:

1. Start a trace span for the tool.
2. Check the **feature flag** for this user and tenant, for gradual rollout and a kill switch.
3. Ask your **authorization service** whether this user holds this tool's privilege on this tenant.
4. Only then run the handler.

```python
def guarded_tool(name, *, flags, authz):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            with tool_span(name):
                user, tenant = request_user.get(), request_tenant.get()
                if not user or not tenant:
                    raise ToolError("Access could not be verified.")
                try:
                    enabled = await flags.is_enabled(user, tenant)
                    allowed = await authz.is_allowed(user, tenant, privilege_for(name))
                except Exception:
                    raise ToolError("Access could not be verified.") from None
                if not enabled or not allowed:
                    raise ToolError("You do not have access to this data.")
                return await fn(*args, **kwargs)
        return wrapper
    return decorator
```

The important word is **closed**. If the flag service is down, the answer is "no", not "probably fine". If the access check times out, the answer is "no". Keep the error messages generic and log the real reason.

**Row-level scope.** Often a user may see only part of a tenant, such as some teams, projects or regions. For those tools, the gate shouldn't return a yes/no. It should resolve the caller's *scope* (everything, a list of subsets, or a refusal), store it in context, and the handler passes that scope to the back end as a filter. Say so in the response too. An agent that doesn't know its answer is partial will present it as the whole truth.

## 4. Service credentials: short-lived, cached, and not secrets

To call your internal services, the server needs its own credential. Two choices make this boring, in a good way:

- **Prefer workload identity to stored secrets.** Let the platform prove who the server is, for example a Kubernetes service account or a cloud workload identity, so there is no client secret to leak or rotate.
- **Cache one token per process.** Keep the token behind a lock and refresh it shortly before it expires, so a burst of tool calls never turns into a burst of token requests.

```python
with token_lock:
    if cached_token and time.time() < token_expires_at - 60:
        return cached_token
    cached_token, token_expires_at = fetch_new_token()
    return cached_token
```

## 5. Design composite tools around tasks, not endpoints

The most common MCP design mistake is wrapping a REST API one endpoint per tool: `get_account`, `list_tickets`, `get_ticket`, `list_invoices`, `get_invoice`. It looks complete, but it hands the *model* the job of orchestration: which calls to make, in what order, how to join the results, how to page. Every extra call is another chance to pick the wrong tool or pass the wrong id, and it costs latency and context tokens.

A **composite tool** does that orchestration on the server, in ordinary deterministic code, and answers the question the user actually asked:

```python
@mcp.tool(annotations=ToolAnnotations(readOnlyHint=True))
async def summarize_account(account: str, recent_days: int = 30) -> dict:
    """One-call overview of a customer account: profile, open tickets and
    recent invoices. Accepts the account name or id. Use this before the
    detailed tools."""
    account_id = await resolve_account(account)   # name -> id, done here, not by the model
    profile, tickets, invoices = await gather_partial(
        crm.get_profile(account_id),
        support.list_open_tickets(account_id, limit=10),
        billing.list_invoices(account_id, days=recent_days, limit=10),
    )
    return {
        "profile": profile.value,
        "open_tickets": tickets.value,
        "recent_invoices": invoices.value,
        "warnings": profile.warnings + tickets.warnings + invoices.warnings,
    }
```

What makes a composite tool good:

- **Name it after the job.** `summarize_account`, `compare_periods` and `explain_change` describe outcomes. The model matches them to user questions far more reliably than a list of resource verbs.
- **Resolve the boring things inside.** Name-to-id lookups, pagination, joins, unit conversions and time-zone handling belong in code, not in the model's reasoning.
- **Fan out in parallel, with timeouts.** Independent sub-calls run concurrently, and each one has its own deadline.
- **Degrade, don't fail.** If one sub-call fails, return the parts that worked, mark the missing part, and explain it in `warnings`. A summary without invoices is still useful. A single error for the whole thing usually isn't.
- **Bound the output.** Return top-N items, totals and a cursor for "more", not ten thousand rows. The context window is a budget.
- **Authorize every sub-call as the caller.** A composite tool must never become a way to see something that the individual tools would refuse. Pass the caller's identity and scope to every call it makes.
- **Keep reads and writes apart.** A read tool must never write as a side effect. A composite *write* should be "plan, then apply": one call returns the full plan, and a second, explicit call executes it (decision 6).
- **Keep a few primitives as escape hatches.** Composite tools cover the common questions, and a small set of precise primitives covers the rest. Fewer, clearer tools beat fifty overlapping ones, because models choose worse among many similar options.

Measure the result. Run a set of real user questions against your server and track how many tool calls each one takes and how often the answer is right. Good composite tools cut both the calls and the mistakes.

## 6. If a tool writes: preview, approve, limit, audit

Agents are good at calling tools, and that is exactly the risk with tools that change things. Give destructive tools (update, delete) a deliberate path:

1. **Preview first.** The first call is a dry run: it returns the current state and the proposed change, and writes nothing.
2. **Ask a human through elicitation.** Executing needs an explicit `dry_run=false` *and* an elicitation response that approves the change and gives a reason for the audit log. A declined, cancelled or malformed answer, or a client without elicitation support, fails closed.
3. **Re-check before writing.** Fetch the resource again right after approval. If it changed while the human was deciding, the consent no longer applies and a new preview is needed.
4. **Rate-limit per tenant.** A sliding-window limit on mutations stops a looping agent from making a hundred changes in a minute.
5. **Audit everything.** Record previews, approvals, denials, throttles, attempts and outcomes as structured audit records, without payloads or credentials.
6. **Annotate honestly.** Set `readOnlyHint`, `destructiveHint` and `idempotentHint` accurately, so hosts can warn users and gateways can apply policy.

Know the limits of each layer. An in-memory rate limiter is per replica, so a strict cluster-wide quota needs shared state such as Redis. And if a gateway doesn't relay elicitation to the client, approved writes simply aren't possible through it. Failing closed there is the right result.

## 7. Design tool contracts for agents, not humans

Most tool bugs aren't crashes. They're agents confidently reporting the wrong thing. The fixes come down to one idea: **make the tool's input and output impossible to misread.**

**Reject unknown arguments.** Many frameworks ignore extra keys by default. An agent invents a `region` filter, it's silently dropped, and the agent reports unfiltered data as filtered. Forbid extra properties so a wrong argument is an error the agent can see and fix:

```python
class QueryArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")   # emits "additionalProperties": false

    start: str = Field(description='Inclusive start, "YYYY-MM-DD", e.g. "2026-01-15".')
    end: str = Field(description='Exclusive end, "YYYY-MM-DD".')
    group_by: list[Literal["team", "project", "region"]] = []
```

**Write descriptions like API docs, with examples.** Spell out formats, whether bounds are inclusive or exclusive, how filters combine, and what happens on a mismatch.

**Turn "nothing matched" into guidance.** Correct case-only mismatches automatically. When a filter matches nothing, return the values that *do* exist in a `warnings` field, so the agent retries correctly instead of reporting zero.

**Make the answer explain itself.** Return an envelope with the data, `applied_filters` (what was actually queried) and `warnings` (fallbacks, corrections, partial scope). Write warnings in plain language, because they often reach the end user.

**Pick defaults that match your product.** If a tool's default numbers are the same ones your UI shows, the agent's answers agree with what the user sees on screen, and that builds more trust than any prompt.

**Errors are errors.** Raise failures as tool errors (`isError: true`). Never return them as strings, which look like *successes* to the client and to your logs. Pass a 4xx reason from the back end through, because the agent can fix its request. Don't pass a 5xx body through, because it can describe your internals.

## 8. MCP Apps: interactive views, purely additive

MCP Apps lets a tool point at an HTML view that a supporting host renders inline in the conversation: charts, sortable tables, filters that re-run the query. It's a big step up from a wall of JSON.

The wiring is small. The tool's `_meta` points at a `ui://` resource, and the server serves that resource as `text/html;profile=mcp-app`:

```python
VIEW_URI = "ui://my-server/explorer.html"

@mcp.tool(meta={"ui": {"resourceUri": VIEW_URI, "visibility": ["model", "app"]}})
async def explore_data(...): ...

@mcp.resource(VIEW_URI, mime_type="text/html;profile=mcp-app",
              meta={"ui": {"csp": {"connectDomains": [], "resourceDomains": []}}})
def explorer_view() -> str:
    return load_view("explorer.html")
```

Decisions worth copying:

- **Make it purely additive.** Hosts without the extension ignore `_meta` and get the same JSON as before.
- **`visibility: ["model", "app"]`** is what lets the rendered view call its own tool, for example a Refresh button. Without `"app"`, the host must reject the view's `tools/call`.
- **No network, no build step.** A self-contained HTML file with inline CSS, JS and simple SVG charts can declare *empty* CSP domain lists and run under the host's deny-by-default sandbox. Everything the view needs comes back through the host as tool calls on the user's own authenticated session.
- **One view, many tools.** `resourceUri` is only a pointer, so several tools can share a view, and the view decides what to render from the tool that opened it.
- **Turn it off cleanly.** When views are disabled, remove `_meta.ui` from the tools *and* stop serving the resources. A tool that points at a missing view renders blank instead of falling back to text.
- **Expect renamed tools.** An aggregating gateway may expose `explore_data` as `team__explore_data`, so a view that calls itself by its original name fails. Resolve the invoked name from the host context.

## 9. Observability that doesn't leak customer data

- **One span per tool call**, tagged with the tool name and tenant. Turn off automatic exception recording: an exception message can contain customer data, so record only the exception type and the outcome.
- **JSON logs with a request id** on every line, plus one access-log line per request.
- **Metrics and smoke checks** on `/health` and `/readyz`.
- **Readiness that means ready.** `/readyz` should fail until dependencies such as the feature-flag client are loaded, so traffic doesn't arrive while every call would fail closed.

## 10. Keep the event loop free, and the URL honest

Most Python MCP servers are async, but plenty of client libraries aren't. Send every blocking call through one helper with a timeout:

```python
async def run_blocking(label, func, *args, timeout=None, **kwargs):
    try:
        return await asyncio.wait_for(asyncio.to_thread(func, *args, **kwargs), timeout=timeout)
    except asyncio.TimeoutError as exc:
        raise TimeoutError(f"{label} timed out after {timeout}s") from exc
```

And check any value that goes into an outbound URL, such as a tenant from a header or an id from a tool argument, for path separators and control characters. An LLM-supplied argument is user input, and it deserves the same suspicion as any other.

## 11. Test the public surface, not just the functions

Unit tests check functions. Clients see something else: tool names, schemas, enums, annotations, `_meta` and resources. Test in three layers:

1. **Unit tests**, including the two-replica test and every fail-closed path.
2. **Contract tests on every pull request.** Boot the real server, with auth bypassed and back ends pointed at a dead port so nothing hangs, and speak real MCP over HTTP. Assert the tool inventory, the schemas (`additionalProperties: false` everywhere), the view metadata, that every `ui://` resource resolves, and input validation. Renaming a tool, widening an enum or dropping `_meta.ui` is invisible to unit tests and caught here.
3. **Regression tests against staging through the real gateway**, because what's deployed and registered is what users get.

One gotcha: gateways often cache `tools/list` and store a copy of your schemas at registration. A new argument can pass every test and still be rejected until the gateway's stored schema is refreshed. Put "re-register" on your release checklist.

Run a dependency audit in CI too, and fix advisories like bugs, in small, separate changes.

## 12. Write for the next engineer, and the next agent

Keep an `AGENTS.md` and short task guides ("adding a tool", "views", "access checks", "running the regression suite") in the repository. Coding agents and new engineers both read them. An MCP server is an interface for AI, and it is increasingly maintained *with* AI. Your design decisions only survive if they're written down where the next contributor will find them.

## The checklist

- [ ] Stateless Streamable HTTP, and a test with two instances
- [ ] Verify the gateway's token; treat identity headers as claims
- [ ] Discovery without a tenant is allowed; tool calls without one are refused
- [ ] Dev shortcuts refuse to start in a cluster
- [ ] One wrapper for every tool: span, flag, access, handler, failing closed
- [ ] Row-level scope resolved per call and disclosed in the answer
- [ ] Workload identity and a cached, early-refreshed service token
- [ ] Composite tools named after tasks, with partial results, bounded output and per-call authorization
- [ ] Writes: preview, elicitation approval with a reason, re-check, rate limit, audit, honest annotations
- [ ] Extra arguments rejected; descriptions with formats and examples
- [ ] "No match" returns valid values; fallbacks stated in plain language
- [ ] Failures raised as tool errors; only 4xx reasons passed through
- [ ] MCP Apps: additive, sandbox-friendly, removable by flag
- [ ] Traces without exception messages; readiness that means ready
- [ ] Contract tests over real MCP on every PR, plus staging through the gateway

None of this is exotic. It's ordinary backend engineering (authentication, authorization, API design, observability, contract testing) applied to a new kind of client. The difference is that this client is an LLM: tireless, literal and very confident. Your server has to be the part of the system that is never confidently wrong.
