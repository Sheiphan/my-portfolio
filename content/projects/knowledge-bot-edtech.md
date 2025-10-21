---
title: "Advanced Agentic RAG Knowledge Bot for Ed-Tech"
date: "2024-12-10"
description: "Built an end-to-end agentic RAG pipeline with locally hosted LLMs, deployed on AWS with robust multi-user support and CI/CD automation."
tech: ["LangChain", "LangGraph", "RAG", "ColBERT", "React", "Django", "FastAPI", "Docker", "AWS", "GitHub Actions"]
image: "/images/projects/placeholder.png"
github: "https://github.com/yourusername/knowledge-bot"
---

# Advanced Agentic RAG Knowledge Bot for Ed-Tech

## Overview

Led the development of a sophisticated Knowledge Bot for an Ed-Tech platform at Creative Synergies Group. The system uses advanced Retrieval-Augmented Generation (RAG) with agentic capabilities, locally hosted LLMs, and is deployed on AWS to serve multiple concurrent users.

## Key Features

- **Agentic RAG Pipeline**: Autonomous agents that plan queries, retrieve information, and synthesize answers
- **Local LLM Hosting**: Self-hosted models (Gemma2, Mistral) for data privacy and cost control
- **Advanced Retrieval**: ColBERT and ColPali for state-of-the-art document retrieval
- **Multi-User Support**: Scalable architecture handling 100+ concurrent users
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **Dockerized Deployment**: Containerized services for consistent environments

## Architecture

### Agentic RAG System

Implemented multi-agent system using LangGraph:

```python
from langgraph.graph import StateGraph, END

# Define agent workflow
workflow = StateGraph(AgentState)

workflow.add_node("planner", planning_agent)
workflow.add_node("retriever", retrieval_agent)
workflow.add_node("synthesizer", synthesis_agent)
workflow.add_node("validator", validation_agent)

workflow.add_edge("planner", "retriever")
workflow.add_edge("retriever", "synthesizer")
workflow.add_edge("synthesizer", "validator")
workflow.add_conditional_edges(
    "validator",
    should_continue,
    {
        "continue": "retriever",
        "end": END
    }
)
```

### Advanced Retrieval with ColBERT

Implemented ColBERT for fine-grained document retrieval:

```python
from colbert import Searcher

searcher = Searcher(index="knowledge_base")
results = searcher.search(query, k=10)

# Late interaction scoring for precise matching
for passage_id, rank, score in results:
    relevant_docs.append(get_document(passage_id))
```

### Local LLM Deployment

Hosted open-source models locally using vLLM for efficient inference:

```python
from vllm import LLM, SamplingParams

llm = LLM(
    model="google/gemma-2-9b-it",
    tensor_parallel_size=2,
    gpu_memory_utilization=0.9
)

sampling_params = SamplingParams(
    temperature=0.7,
    top_p=0.95,
    max_tokens=1024
)
```

## Tech Stack

### Backend

- **FastAPI**: High-performance API server
- **Django**: Admin interface and user management
- **LangChain/LangGraph**: Agent orchestration
- **ColBERT**: Advanced retrieval
- **ChromaDB**: Vector database
- **Redis**: Caching and session management

### Frontend

- **React.js**: Modern, responsive UI
- **WebSocket**: Real-time streaming responses
- **TailwindCSS**: Styling

### Infrastructure

- **AWS EC2**: Application hosting
- **AWS S3**: Document storage
- **AWS RDS**: PostgreSQL database
- **Docker**: Containerization
- **GitHub Actions**: CI/CD pipeline

## Key Implementations

### Function Calling for Tool Use

Integrated function calling for dynamic tool usage:

```python
tools = [
    {
        "name": "search_documents",
        "description": "Search the knowledge base for relevant information",
        "parameters": {
            "query": "string",
            "filters": "object"
        }
    },
    {
        "name": "calculate",
        "description": "Perform mathematical calculations",
        "parameters": {
            "expression": "string"
        }
    }
]

response = agent.run(
    query=user_question,
    tools=tools
)
```

### Multi-User Session Management

Implemented robust session handling for concurrent users:

```python
from redis import Redis
from uuid import uuid4

redis_client = Redis(host='localhost', port=6379)

def create_session(user_id):
    session_id = str(uuid4())
    redis_client.setex(
        f"session:{session_id}",
        3600,  # 1 hour expiry
        json.dumps({"user_id": user_id, "history": []})
    )
    return session_id
```

### CI/CD Pipeline

Automated deployment with GitHub Actions:

```yaml
name: Deploy Knowledge Bot

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: pytest tests/
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker image
        run: docker build -t knowledge-bot .
      - name: Push to registry
        run: docker push knowledge-bot:latest
      - name: Deploy to AWS
        run: ./deploy.sh
```

## Performance Optimizations

- **Caching**: Redis-based caching for frequent queries (40% latency reduction)
- **Batch Processing**: Request batching for LLM inference
- **Connection Pooling**: Database connection pooling for efficiency
- **Async Operations**: Asynchronous processing for I/O operations

## Results

- **Response Time**: Average response time < 2 seconds
- **Accuracy**: 92% answer accuracy on evaluation set
- **Scalability**: Successfully handles 100+ concurrent users
- **Uptime**: 99.5% uptime over 6 months
- **Cost Savings**: 80% cost reduction vs. API-based solutions

## Challenges & Solutions

**Challenge**: Maintaining low latency with local LLM inference

**Solution**: Implemented vLLM for efficient batched inference and request queuing, achieving 3x speedup.

**Challenge**: Ensuring answer quality and relevance

**Solution**: Built multi-stage validation with retrieval scoring, answer verification, and user feedback loop.

**Challenge**: Scaling to multiple concurrent users

**Solution**: Implemented load balancing, connection pooling, and horizontal scaling with Docker Swarm.

## Security & Privacy

- End-to-end encryption for user data
- Role-based access control (RBAC)
- Data anonymization for analytics
- Regular security audits
- GDPR compliance measures

## Impact

- Reduced student support ticket volume by 45%
- Improved student satisfaction scores by 30%
- Enabled 24/7 instant support availability
- Freed up human tutors for complex queries

## Technologies Used

- LangChain & LangGraph
- ColBERT & ColPali
- Gemma2, Mistral (local LLMs)
- React.js, Django, FastAPI
- Docker, GitHub Actions
- AWS (EC2, S3, RDS)
- ChromaDB, Redis
- OpenCV for document processing

## Future Enhancements

- Multi-modal support (images, videos)
- Personalized learning recommendations
- Integration with learning management systems
- Advanced analytics dashboard
- Mobile app development
