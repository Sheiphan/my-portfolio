---
title: "Fine-Tuned Qwen 1.5 4B Model on Proprietary Data"
date: "2025-01-20"
description: "Developed and deployed a fine-tuned Qwen 1.5 4B model using PyTorch FSDP/DDP, preference alignment, and quantization techniques for production use."
tech: ["PyTorch", "FSDP", "DDP", "HuggingFace", "Quantization", "AWS Sagemaker", "MLOps"]
image: "/images/projects/placeholder.png"
---

# Fine-Tuned Qwen 1.5 4B Model on Proprietary Data

## Overview

At Creative Synergies Group, I led the development of a custom fine-tuned Qwen 1.5 4B language model trained on proprietary company data. This project involved advanced distributed training techniques, preference alignment, and production deployment on AWS infrastructure.

## Project Scope

The goal was to create a specialized language model that understands company-specific terminology, processes, and knowledge while maintaining strong general language capabilities.

## Technical Implementation

### Distributed Training with PyTorch FSDP

Implemented Fully Sharded Data Parallel (FSDP) training to efficiently train the 4B parameter model:

```python
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp.wrap import transformer_auto_wrap_policy

model = FSDP(
    base_model,
    auto_wrap_policy=transformer_auto_wrap_policy,
    mixed_precision=mixed_precision_policy,
    sharding_strategy=ShardingStrategy.FULL_SHARD,
)
```

### Preference Alignment

Applied RLHF (Reinforcement Learning from Human Feedback) techniques to align model outputs with company preferences:
- Collected human preference data on model outputs
- Trained reward model to predict human preferences
- Fine-tuned using PPO (Proximal Policy Optimization)

### Quantization for Efficient Inference

Implemented 4-bit quantization using bitsandbytes to reduce model size and inference latency:

```python
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4"
)
```

## Data Pipeline

- **Data Collection**: Aggregated proprietary documents, conversations, and knowledge bases
- **Preprocessing**: Cleaned, tokenized, and formatted data for training
- **Quality Control**: Implemented automated checks for data quality and bias
- **Versioning**: Used DVC for data version control and reproducibility

## Training Infrastructure

### AWS Sagemaker Integration

Deployed training jobs on AWS Sagemaker with:
- Multi-GPU instances (p4d.24xlarge)
- Distributed training across multiple nodes
- Automatic checkpointing and model versioning
- Integration with S3 for data and model storage

### Monitoring & Logging

- Real-time training metrics with Weights & Biases
- Custom dashboards for loss curves, learning rates, and validation metrics
- Automated alerts for training anomalies

## Deployment

### Production Inference

Deployed the quantized model on AWS Sagemaker endpoints:
- Auto-scaling based on request volume
- A/B testing framework for model versions
- Latency optimization (< 200ms p95)
- Cost optimization through spot instances

### API Integration

Built FastAPI service for model inference:
- RESTful API with authentication
- Request batching for efficiency
- Caching layer for common queries
- Rate limiting and monitoring

## Results

- **Performance**: Achieved 15% improvement in task-specific metrics over base model
- **Efficiency**: 4x faster inference through quantization
- **Cost**: Reduced inference costs by 60% compared to API-based solutions
- **Adoption**: Successfully integrated into 3 production applications

## Challenges Overcome

**Challenge**: Memory constraints during training of 4B parameter model

**Solution**: Implemented gradient checkpointing and FSDP to distribute model across multiple GPUs efficiently.

**Challenge**: Maintaining model quality after quantization

**Solution**: Used QLoRA (Quantized Low-Rank Adaptation) to fine-tune quantized model, recovering most of the performance.

**Challenge**: Ensuring model safety and alignment

**Solution**: Implemented comprehensive evaluation suite including bias detection, toxicity filtering, and output validation.

## Technologies Used

- PyTorch with FSDP and DDP
- HuggingFace Transformers & PEFT
- AWS Sagemaker for training and deployment
- Weights & Biases for experiment tracking
- DVC for data versioning
- FastAPI for serving
- Docker & Kubernetes for orchestration

## Key Learnings

- Distributed training strategies for large models
- Importance of data quality in fine-tuning
- Trade-offs between model size, speed, and quality
- Production MLOps best practices
- Cost optimization in cloud ML infrastructure

## Future Work

- Continuous learning pipeline for model updates
- Multi-task fine-tuning for broader capabilities
- Integration with RAG for enhanced knowledge access
- Federated learning for privacy-preserving updates
