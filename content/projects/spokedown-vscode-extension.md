---
title: "Spokedown: a VS Code Extension that Reads Markdown Aloud"
date: "2026-11-18"
description: "A VS Code extension that reads Markdown aloud with a fully local neural voice and highlights each word in the editor as it is spoken. It understands tables, code, diagrams and LaTeX."
tech: ["TypeScript", "VS Code API", "ONNX Runtime", "Kokoro TTS", "remark", "pnpm monorepo"]
github: "https://github.com/Sheiphan/spokedown"
---

# Spokedown

## Overview

Spokedown reads Markdown aloud in VS Code with a natural, fully local voice and highlights each word **in the editor itself** as it is spoken. A read-along preview does the same on the rendered page. It is built for technical docs and coding-agent files (`README.md`, `CLAUDE.md`, `AGENTS.md`, `SKILL.md`, plans).

Everything runs on your machine, with no account, no API key and no telemetry. It works on macOS, Windows and Linux, and it's [on the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SheiphanJoseph.spokedown).

## It reads structure, not syntax

| Markdown | Spoken as |
|---|---|
| `$\sqrt{d_k}$` | "the square root of d sub k" |
| a table | "Table, three columns: Symbol, Meaning, Value, four rows." then row by row with column labels |
| a Python code block | "Python code block, three lines." |
| a Mermaid diagram | "Diagram: flowchart with six steps." |
| `` [`attention.py:42`](…) `` | "attention dot P Y, line forty-two" |

Headings get pauses, long equations are summarized, and a pronunciation dictionary fixes names like `kubectl` or `nginx` in one click.

## How it works

The project is a pnpm monorepo with three parts:

- **`packages/core`** turns Markdown into a speech script in which every word maps back to its exact source range. It uses remark with GFM, math and frontmatter support, and MathJax with speech-rule-engine for LaTeX.
- **`packages/engine`** holds the text-to-speech backends: [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) through ONNX Runtime by default, plus macOS system voices and any OpenAI-compatible speech server. It also does word-timing alignment and keeps an on-disk audio cache, with synthesis jobs that can be shared and cancelled.
- **`extensions/vscode`** holds the playback session, the editor decorations, the status bar and the read-along preview webview.

Some details that took real engineering:

- **Exact word timings** come from the per-phoneme durations in the timestamped Kokoro export. When the phonemizer merges or splits words, a small dynamic-programming alignment by phoneme length keeps every word exact.
- **Precise pause and seek.** Playback restarts from an exact sample offset of the in-memory audio, so the highlight clock never drifts.
- **Its own preview.** Other extensions can't drive VS Code's built-in Markdown preview, so Spokedown renders the same parse tree in a webview, with source offsets on every text span, and highlights words with the CSS Custom Highlight API.
- **Fast on a laptop:** about 4–8× faster than real time on Apple Silicon, with a few sentences synthesized ahead of playback.
