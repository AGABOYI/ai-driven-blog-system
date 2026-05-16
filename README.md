# AI-Driven Blog System

A production-oriented AI-powered content generation platform built with React, Node.js, PostgreSQL, Docker, and AWS cloud infrastructure.

This project demonstrates full-stack engineering, AI systems integration, cloud deployment, CI/CD automation, container orchestration, distributed system reliability patterns, and production-focused backend architecture.

Unlike simple CRUD-style portfolio projects, this system was intentionally engineered to simulate a real-world production application lifecycle:

* AI-generated content pipelines
* resilient backend architecture
* automated cloud deployment
* containerized microservice-style workflows
* asynchronous background scheduling
* fault-tolerant AI handling
* real-time frontend updates
* production-ready infrastructure orchestration

---

# Live Project Access

At the time of writing this README, the project is deployed and publicly accessible on AWS EC2:

```text
http://16.16.67.98:3000/
```

Because the infrastructure currently runs on AWS free-tier/trial resources, the public deployment may become unavailable in the future once the AWS trial period expires.

However, the entire project is fully reproducible locally using Docker Compose, and all deployment/infrastructure steps are documented below.

---

# System Architecture Overview

The platform is composed of multiple containerized services communicating together inside a production-style Docker environment.

```text
┌──────────────────────────────────────────┐
│                Frontend                  │
│            React + Vite App              │
│      Real-time article rendering         │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│                 Backend                  │
│         Node.js + Express API            │
│                                          │
│  - AI article generation pipeline        │
│  - Scheduler system                      │
│  - WebSocket server                      │
│  - Retry/fallback handling               │
│  - PostgreSQL integration                │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│               PostgreSQL                 │
│         Persistent article storage       │
└──────────────────────────────────────────┘

Deployment Infrastructure:
AWS EC2 + Amazon ECR + Docker Compose + GitHub Actions CI/CD
```

---

# Core Engineering Features

## AI-Powered Content Generation Pipeline

The backend integrates with the OpenRouter API to automatically generate long-form blog articles using free LLM models.

### AI workflow includes:

* structured JSON prompting
* response parsing and validation
* malformed response protection
* fallback article generation
* asynchronous retry scheduling
* automatic regeneration handling

The system was specifically engineered around the instability and inconsistency commonly found in free AI providers.

---

## Reliability & Fault Tolerance

The platform was intentionally designed with production reliability patterns to ensure the application remains operational even when external AI services fail.

### Implemented resilience mechanisms:

* fallback article insertion
* retry scheduling for unavailable AI models
* backend health-check endpoints
* startup dependency synchronization
* database readiness waiting scripts
* automatic container recovery
* persistent PostgreSQL storage volumes

This prevents the application from breaking during AI outages, malformed responses, or temporary provider failures.

---

## Real-Time Frontend Updates

The backend exposes a WebSocket server that broadcasts newly generated articles to connected frontend clients in real time.

Users receive newly generated AI articles instantly without refreshing the page.

This simulates modern event-driven application behavior.

---

# Cloud Infrastructure & Deployment

## AWS Infrastructure

The application is fully deployed on AWS using a production-style containerized deployment workflow.

### Services Used

* AWS EC2
* Amazon ECR
* IAM User
* IAM Role
* GitHub Actions
* Docker Compose

---

## Infrastructure Responsibilities

### EC2

Hosts the production Dockerized application stack:

* frontend container
* backend API container
* PostgreSQL database container

---

### Amazon ECR

Stores private Docker images for frontend and backend services.

Acts as the centralized container registry used during deployment.

---

### IAM User

Used by the GitHub Actions CI/CD pipeline to securely authenticate with AWS and push Docker images to Amazon ECR.

---

### IAM Role

Attached directly to the EC2 instance to securely pull private ECR images without storing long-term AWS credentials on the server.

This follows modern AWS security best practices.

---

### GitHub Actions

Automates the full CI/CD workflow:

1. Build Docker images
2. Push images to Amazon ECR
3. Connect to EC2 through SSH
4. Pull latest images
5. Redeploy containers automatically

This simulates real-world production deployment pipelines used in modern engineering teams.

---

### Docker Compose

Orchestrates the multi-container production environment including:

* frontend service
* backend API service
* PostgreSQL service
* internal container networking
* environment variable injection
* persistent database volumes
* automated startup ordering

---

# Containerization Strategy

The platform is fully containerized using Docker.

Each service runs in an isolated environment:

* frontend container
* backend container
* PostgreSQL container

This ensures deployment consistency across local development and production infrastructure.

---

# CI/CD Pipeline

A fully automated deployment pipeline was implemented using GitHub Actions.

## Deployment Workflow

On every push to the `main` branch:

1. GitHub Actions builds Docker images
2. Images are pushed to Amazon ECR
3. GitHub Actions connects to EC2 via SSH
4. EC2 pulls latest container images
5. Docker Compose redeploys services automatically

This creates a continuous deployment workflow similar to production-grade engineering environments.

---

# Advanced Engineering Challenges Solved

## Service Startup Synchronization

The backend depends on PostgreSQL availability during startup.

Custom wait scripts were implemented to guarantee proper startup ordering and eliminate race conditions between containers.

---

## AI Failure Recovery

Free LLM APIs are inherently unstable and may return:

* malformed JSON
* incomplete responses
* rate-limit failures
* temporary outages

The backend includes:

* validation layers
* retry scheduling
* safe fallback generation
* automatic recovery handling

to guarantee application stability even during AI provider failures.

---

## Environment Isolation

Environment-specific configuration was implemented for:

* local development
* Docker environments
* production deployment
* frontend/backend API routing

using `.env` management and container injection strategies.

---

# Tech Stack

## Frontend

* React
* Vite
* JavaScript
* WebSockets
* Docker

---

## Backend

* Node.js
* Express.js
* PostgreSQL
* WebSocket Server
* Cron Scheduler
* Docker

---

## Database

* PostgreSQL 15
* Persistent Docker Volumes

---

## AI Integration

* OpenRouter API
* Free LLM integration
* Structured prompt engineering
* JSON response validation

---

## DevOps & Cloud

* Docker
* Docker Compose
* AWS EC2
* Amazon ECR
* IAM Role
* IAM User
* GitHub Actions CI/CD

---

# Local Development Setup

## Clone Repository

```bash
git clone https://github.com/<your-username>/ai-driven-blog-system.git
cd ai-driven-blog-system
```

---

## Configure Environment Variables

Create a `.env` file at the project root:

```env
HERO_OPENROUTER_API_KEY=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_HOST=
```

---

## Run Full Stack Locally

```bash
docker-compose --env-file .env up --build
```

---

## Local URLs

### Frontend

```text
http://localhost:3000
```

### Backend

```text
http://localhost:8080
```

---

# API Endpoints

## Get All Articles

```http
GET /articles
```

---

## Health Check

```http
GET /health
```

---

# Runtime Execution Flow

## Initial Startup Sequence

### 1. PostgreSQL container initializes

Persistent database volumes are mounted.

---

### 2. Backend waits for database readiness

Custom synchronization scripts ensure PostgreSQL is fully operational before backend startup.

---

### 3. Database bootstrap process executes

If the articles table does not exist:

* backend generates initial AI articles
* validates generated responses
* stores articles inside PostgreSQL

---

### 4. Frontend waits for backend health

Frontend startup scripts verify backend availability before loading application data.

---

### 5. Real-time systems activate

The WebSocket server begins listening for newly generated articles.

---

### 6. Scheduled AI generation activates

The backend scheduler automatically generates new AI-written articles every 24 hours.

Generated articles are:

* validated
* stored in PostgreSQL
* broadcast to connected frontend clients in real time

---

# Engineering Areas Demonstrated

This project intentionally demonstrates practical engineering experience across:

* full-stack application development
* backend architecture
* distributed systems thinking
* AI systems integration
* Docker orchestration
* CI/CD automation
* cloud infrastructure deployment
* production debugging
* fault tolerance engineering
* asynchronous scheduling systems
* AWS infrastructure workflows

---

# License

MIT License
