---
title: "Building Production AI Applications with LangChain & LangGraph"
date: "2025-10-08"
summary: "Practical insights from building production-ready agentic AI systems using LangChain and LangGraph, based on real-world experience."
tags: ["LangChain", "LangGraph", "Agentic AI", "Multi-Agent Systems", "Production ML"]
---

# Building Production AI Applications with LangChain & LangGraph

After building multiple production AI systems using LangChain and LangGraph - from knowledge bots serving 100+ concurrent users to autonomous research agents - I've learned what it takes to move from prototype to production. Here are the practical insights that matter.

## What is LangChain?

LangChain is a framework that simplifies the development of applications using LLMs by providing:
- **Chains**: Sequences of calls to LLMs or other utilities
- **Agents**: LLMs that make decisions about which actions to take
- **Memory**: Persistent state between chain/agent calls
- **Retrievers**: Interfaces for fetching relevant documents

## Getting Started: A Simple Chain

Let's start with a basic example:

```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain

# Define the prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant."),
    ("user", "{input}")
])

# Create the chain
llm = ChatOpenAI(model="gpt-4", temperature=0.7)
chain = LLMChain(llm=llm, prompt=prompt)

# Run it
result = chain.run(input="Explain quantum computing in simple terms")
```

Simple, but powerful!

## Building a RAG System

Retrieval-Augmented Generation (RAG) is one of the most practical patterns for building AI applications. Here's how to implement it:

### Step 1: Load and Process Documents

```python
from langchain.document_loaders import DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load documents
loader = DirectoryLoader('./docs', glob="**/*.md")
documents = loader.load()

# Split into chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)
```

### Step 2: Create Vector Store

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import Chroma

embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)
```

### Step 3: Build the RAG Chain

```python
from langchain.chains import RetrievalQA

qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4"),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
    return_source_documents=True
)

# Query the system
result = qa_chain("What are the key features of the product?")
print(result['result'])
print(result['source_documents'])
```

## Working with Agents

Agents can use tools to accomplish tasks. Here's an example:

```python
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType

# Define tools
tools = [
    Tool(
        name="Calculator",
        func=calculator.run,
        description="Useful for math calculations"
    ),
    Tool(
        name="Search",
        func=search.run,
        description="Useful for searching information"
    )
]

# Create agent
agent = initialize_agent(
    tools=tools,
    llm=ChatOpenAI(temperature=0),
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# Run agent
agent.run("What is the population of Tokyo multiplied by 2?")
```

## Best Practices I've Learned

### 1. Prompt Engineering Matters

Spend time crafting good prompts. Small changes can have big impacts:

```python
# Bad prompt
"Answer the question: {question}"

# Better prompt
"""Answer the following question based on the context provided.
If you don't know the answer, say "I don't know" rather than making something up.

Context: {context}
Question: {question}
Answer:"""
```

### 2. Handle Errors Gracefully

LLMs can fail in unexpected ways:

```python
from langchain.callbacks import get_openai_callback

try:
    with get_openai_callback() as cb:
        result = chain.run(input=user_input)
        print(f"Tokens used: {cb.total_tokens}")
except Exception as e:
    logger.error(f"Chain failed: {e}")
    result = "I'm sorry, I encountered an error. Please try again."
```

### 3. Monitor Token Usage

Tokens = money. Track usage carefully:

```python
def run_with_monitoring(chain, input_text):
    with get_openai_callback() as cb:
        result = chain.run(input=input_text)
        
        metrics = {
            'tokens': cb.total_tokens,
            'cost': cb.total_cost,
            'time': time.time() - start_time
        }
        
        log_metrics(metrics)
        return result
```

### 4. Use Caching

Avoid redundant API calls:

```python
from langchain.cache import InMemoryCache
import langchain

langchain.llm_cache = InMemoryCache()
```

### 5. Test with Different Models

Don't assume GPT-4 is always necessary:

- **GPT-4**: Complex reasoning, high accuracy
- **GPT-3.5-Turbo**: Fast, cost-effective for simple tasks
- **Claude**: Long context windows
- **Open-source models**: Privacy, cost control

## Common Pitfalls

### 1. Context Window Limits
Don't exceed the model's context window. Use summarization or retrieval to manage long documents.

### 2. Hallucinations
LLMs make things up. Always validate critical information and cite sources.

### 3. Latency
Chain multiple LLM calls carefully. Each call adds latency.

### 4. Cost Management
Monitor and set limits. A runaway agent can get expensive quickly.

## Production Considerations

When deploying LangChain applications:

1. **Use async operations** for better performance
2. **Implement rate limiting** to control costs
3. **Add comprehensive logging** for debugging
4. **Version your prompts** like code
5. **Monitor model performance** over time

## Example: Production-Ready Chain

```python
import asyncio
from langchain.callbacks import AsyncCallbackHandler

class MetricsCallback(AsyncCallbackHandler):
    async def on_llm_start(self, serialized, prompts, **kwargs):
        self.start_time = time.time()
    
    async def on_llm_end(self, response, **kwargs):
        duration = time.time() - self.start_time
        log_metrics({'duration': duration, 'tokens': response.llm_output['token_usage']})

async def run_chain_async(chain, input_text):
    callback = MetricsCallback()
    result = await chain.arun(input=input_text, callbacks=[callback])
    return result
```

## Conclusion

LangChain makes building LLM applications significantly easier, but it's not magic. You still need to:
- Understand your use case
- Design good prompts
- Handle errors gracefully
- Monitor performance and costs
- Test thoroughly

The framework is evolving rapidly, so stay updated with the documentation and community discussions.

## Resources

- [LangChain Documentation](https://python.langchain.com/)
- [LangChain Cookbook](https://github.com/langchain-ai/langchain/tree/master/cookbook)
- [LangSmith for debugging](https://smith.langchain.com/)

Happy building! 🚀
