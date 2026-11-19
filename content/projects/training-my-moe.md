---
title: "Training My MoE: a Mixture-of-Experts LLM from Scratch"
date: "2026-11-15"
description: "A Qwen/DeepSeek-V2-style Mixture-of-Experts decoder written from scratch in PyTorch, then modernized, ablated, trained on an H100 and explained with interactive visualizations."
tech: ["PyTorch", "Mixture of Experts", "GQA / MLA", "RoPE", "Muon", "pytest", "D3"]
github: "https://github.com/Sheiphan/training-my-moe"
---

# Training My MoE

## Overview

A Mixture-of-Experts, decoder-only transformer in the style of Qwen and DeepSeek-V2, written from scratch in PyTorch. Nothing wraps a model library. Every part is implemented in the repo and covered by tests: RMSNorm, RoPE / ALiBi / NoPE positions, GQA and MLA attention, SwiGLU / GEGLU / GELU experts, the MoE router and its load balancers, the training loop, the tokenizers (character level and a from-scratch byte-level BPE) and the sampling code.

The other half of the project is explaining it, with one rule throughout: **no made-up numbers**. Every figure in the docs and visualizations is read from a real training log or captured from a real forward pass through a real trained checkpoint.

## What's in it

- **The model and training stack** (`qwenmoe/`): one `ModelConfig` for every knob, a KV cache, multi-token prediction, AdamW and Muon optimizers, WSD schedules, bf16, scaling-law helpers and named presets, from a two-minute `SMOKE_TEST` to `SCALE_300M`, trained on an H100.
- **A modernization pass**, built spec-first with 18 tasks, bringing it up to 2024–2026 practice: sigmoid routing and router z-loss, batched expert dispatch, QK-norm, principled init, document-boundary masking and multi-seed, parameter-matched ablations. Every knob defaults to the old behavior, and the tests check that a config written before the spec still trains bit-identically.
- **Measured results, reported honestly.** `BASELINE_V2` (QK-norm, sigmoid routing, width-aware init) beats `BASELINE` by 0.072 validation loss, three times the measured seed-noise band, for 384 extra parameters. Fine-grained DeepSeekMoE-style experts measured *worse* at this scale, and the journal says why.
- **A 14-run ablation study**: compute-matched training runs that each change exactly one architectural axis, plus a multi-seed showdown of the three recommended presets.
- **533 tests** (531 pass, 2 skip).

## Explaining the model

- **Interactive pages** that open straight from disk with no server and no build step: a paper-style architecture figure, an animated walk through one forward pass with every tensor drawn to scale and a live configurator, a step-by-step "token journey" through 7 real trained architectures with real activations, attention weights and routing decisions, and an ablation explorer.
- **A 44-entry engineering journal**, one entry per implementation step, with the terms defined, the formulas derived with worked numbers, and links to the source papers.
- **Nine runnable notebooks** that tour the codebase, plus by-hand math derivations, each checked by a script.
