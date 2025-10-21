---
title: "MLOps Best Practices: From Development to Production"
date: "2025-08-15"
summary: "Practical MLOps strategies for deploying and maintaining ML systems at scale, based on real production experience."
tags: ["MLOps", "AWS", "Docker", "CI/CD", "Production ML"]
---

# MLOps Best Practices: From Development to Production

After deploying multiple ML systems to production - from fine-tuned LLMs to real-time recommendation engines - I've learned that getting a model to work is just the beginning. Here's what it takes to build ML systems that actually survive in production.

## The MLOps Reality

**Development**: "My model achieves 95% accuracy!"

**Production**: 
- How do you deploy it?
- How do you monitor performance?
- What happens when data drift occurs?
- How do you roll back bad deployments?
- How do you scale to handle load?
- How do you manage costs?

## Core MLOps Principles

### 1. Version Everything

Not just code - everything:

```python
# Model versioning
model_version = {
    "model_id": "qwen-1.5-4b-finetuned",
    "version": "v2.3.1",
    "training_data_version": "v1.2.0",
    "code_commit": "abc123",
    "hyperparameters": {...},
    "metrics": {...},
    "timestamp": "2025-08-15T10:30:00Z"
}
```

**What to version**:
- Model weights and architecture
- Training data (use DVC)
- Training code and configs
- Preprocessing pipelines
- Evaluation metrics
- Environment dependencies

### 2. Automate Everything

Manual processes don't scale:

```yaml
# .github/workflows/ml-pipeline.yml
name: ML Pipeline

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run unit tests
        run: pytest tests/
      
      - name: Run model tests
        run: python test_model.py
        
  train:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Train model
        run: python train.py
        
      - name: Evaluate model
        run: python evaluate.py
        
      - name: Register model
        if: metrics.accuracy > 0.90
        run: python register_model.py
        
  deploy:
    needs: train
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: ./deploy_staging.sh
        
      - name: Run integration tests
        run: pytest tests/integration/
        
      - name: Deploy to production
        if: success()
        run: ./deploy_production.sh
```

## Infrastructure as Code

### AWS Sagemaker Deployment

```python
from sagemaker.pytorch import PyTorchModel
from sagemaker.predictor import Predictor

# Define model
model = PyTorchModel(
    model_data=f"s3://my-bucket/models/{model_version}/model.tar.gz",
    role=sagemaker_role,
    framework_version="2.0",
    py_version="py310",
    entry_point="inference.py",
    source_dir="./src"
)

# Deploy with auto-scaling
predictor = model.deploy(
    instance_type="ml.g4dn.xlarge",
    initial_instance_count=2,
    endpoint_name=f"model-{model_version}",
    auto_scaling_config={
        "min_capacity": 2,
        "max_capacity": 10,
        "target_value": 70.0,  # Target CPU utilization
        "scale_in_cooldown": 300,
        "scale_out_cooldown": 60
    }
)
```

### Docker for Reproducibility

```dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy model and code
COPY models/ /app/models/
COPY src/ /app/src/

WORKDIR /app

# Run inference server
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Monitoring & Observability

### Model Performance Monitoring

```python
import mlflow
from prometheus_client import Counter, Histogram

# Metrics
prediction_counter = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency_seconds', 'Prediction latency')
prediction_confidence = Histogram('prediction_confidence', 'Prediction confidence')

class MonitoredModel:
    def __init__(self, model):
        self.model = model
        
    @prediction_latency.time()
    def predict(self, input_data):
        prediction_counter.inc()
        
        # Make prediction
        result = self.model.predict(input_data)
        
        # Log metrics
        prediction_confidence.observe(result.confidence)
        
        # Log to MLflow
        mlflow.log_metrics({
            "confidence": result.confidence,
            "latency": result.latency
        })
        
        # Check for anomalies
        if result.confidence < 0.5:
            self.alert_low_confidence(input_data, result)
            
        return result
```

### Data Drift Detection

```python
from evidently import ColumnMapping
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

def detect_drift(reference_data, current_data):
    report = Report(metrics=[DataDriftPreset()])
    
    report.run(
        reference_data=reference_data,
        current_data=current_data
    )
    
    drift_detected = report.as_dict()['metrics'][0]['result']['dataset_drift']
    
    if drift_detected:
        alert_drift_detected(report)
        trigger_retraining()
        
    return report
```

## Deployment Strategies

### Blue-Green Deployment

```python
class BlueGreenDeployment:
    def __init__(self):
        self.blue_endpoint = "model-v1"
        self.green_endpoint = "model-v2"
        self.router = LoadBalancer()
        
    def deploy_new_version(self, new_model):
        # Deploy to green (inactive) environment
        self.deploy_to_green(new_model)
        
        # Run smoke tests
        if not self.smoke_test(self.green_endpoint):
            self.rollback()
            return False
            
        # Gradually shift traffic
        for percentage in [10, 25, 50, 100]:
            self.router.set_traffic_split({
                self.blue_endpoint: 100 - percentage,
                self.green_endpoint: percentage
            })
            
            # Monitor metrics
            time.sleep(300)  # 5 minutes
            if not self.check_metrics(self.green_endpoint):
                self.rollback()
                return False
                
        # Swap blue and green
        self.blue_endpoint, self.green_endpoint = \
            self.green_endpoint, self.blue_endpoint
            
        return True
```

### Canary Deployment

```python
def canary_deployment(new_model, canary_percentage=10):
    # Deploy canary
    canary_endpoint = deploy_model(new_model, "canary")
    
    # Route small percentage to canary
    router.set_traffic_split({
        "production": 100 - canary_percentage,
        "canary": canary_percentage
    })
    
    # Monitor for 1 hour
    metrics = monitor_endpoints(duration=3600)
    
    # Compare metrics
    if metrics["canary"].error_rate > metrics["production"].error_rate * 1.1:
        # Canary performing worse, rollback
        router.set_traffic_split({"production": 100})
        delete_endpoint("canary")
        return False
        
    # Canary successful, promote to production
    promote_to_production(canary_endpoint)
    return True
```

## Cost Optimization

### Right-Sizing Instances

```python
def optimize_instance_type(workload_profile):
    # Analyze workload
    avg_requests_per_second = workload_profile["rps"]
    avg_latency_requirement = workload_profile["latency_p95"]
    model_size = workload_profile["model_size_gb"]
    
    # Select instance type
    if model_size < 4 and avg_requests_per_second < 10:
        return "ml.t3.medium"  # CPU, cheap
    elif model_size < 8 and avg_latency_requirement < 100:
        return "ml.g4dn.xlarge"  # GPU, balanced
    else:
        return "ml.g5.2xlarge"  # Powerful GPU
```

### Spot Instances for Training

```python
from sagemaker.estimator import Estimator

estimator = Estimator(
    image_uri=training_image,
    role=role,
    instance_count=4,
    instance_type="ml.p3.8xlarge",
    use_spot_instances=True,  # Use spot instances
    max_wait=7200,  # Wait up to 2 hours for spot
    max_run=3600,   # Training should complete in 1 hour
    checkpoint_s3_uri="s3://my-bucket/checkpoints/"  # For spot interruptions
)
```

## Testing ML Systems

### Model Testing

```python
import pytest

def test_model_accuracy():
    model = load_model("production")
    test_data = load_test_data()
    
    predictions = model.predict(test_data.X)
    accuracy = calculate_accuracy(predictions, test_data.y)
    
    assert accuracy > 0.90, f"Model accuracy {accuracy} below threshold"

def test_model_latency():
    model = load_model("production")
    sample = generate_sample_input()
    
    start = time.time()
    model.predict(sample)
    latency = time.time() - start
    
    assert latency < 0.1, f"Latency {latency}s exceeds 100ms threshold"

def test_model_robustness():
    model = load_model("production")
    
    # Test edge cases
    edge_cases = [
        empty_input(),
        malformed_input(),
        extreme_values(),
        unicode_characters()
    ]
    
    for case in edge_cases:
        try:
            result = model.predict(case)
            assert result is not None
        except Exception as e:
            pytest.fail(f"Model failed on edge case: {e}")
```

### Integration Testing

```python
def test_end_to_end_pipeline():
    # Test full pipeline
    raw_data = load_raw_data()
    
    # Preprocessing
    processed = preprocess(raw_data)
    assert processed.shape[0] > 0
    
    # Feature engineering
    features = engineer_features(processed)
    assert not features.isnull().any().any()
    
    # Prediction
    predictions = model.predict(features)
    assert len(predictions) == len(features)
    
    # Post-processing
    results = postprocess(predictions)
    assert all(0 <= r <= 1 for r in results)
```

## Real-World Lessons

### 1. Start with Simple Infrastructure

Don't over-engineer. Start with:
- Single model endpoint
- Basic monitoring
- Manual deployment

Add complexity as needed.

### 2. Monitor Business Metrics, Not Just Technical Metrics

Technical metrics (latency, accuracy) matter, but business metrics matter more:
- User satisfaction
- Task completion rate
- Revenue impact
- Cost per prediction

### 3. Plan for Failure

Everything will fail eventually:
- Models will degrade
- APIs will go down
- Data will drift
- Costs will spike

Have fallbacks and alerts ready.

### 4. Document Everything

Future you (and your team) will thank you:
- Model cards with performance characteristics
- Deployment runbooks
- Incident response procedures
- Architecture diagrams

## Tools I Use

### Essential MLOps Stack

- **Experiment Tracking**: MLflow, Weights & Biases
- **Model Registry**: MLflow, AWS Sagemaker
- **Data Versioning**: DVC
- **Monitoring**: Prometheus, Grafana, Evidently
- **Deployment**: AWS Sagemaker, Docker, Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI
- **Infrastructure**: Terraform, CloudFormation

## Conclusion

MLOps isn't about using the fanciest tools - it's about building reliable, maintainable ML systems. Focus on:

1. **Reproducibility**: Version everything
2. **Automation**: Automate testing and deployment
3. **Monitoring**: Watch your models in production
4. **Reliability**: Plan for failure
5. **Cost**: Optimize for efficiency

Start simple, measure everything, and iterate based on real production needs.

---

*Building ML systems in production? I'd love to hear about your challenges and solutions. Reach out!*
