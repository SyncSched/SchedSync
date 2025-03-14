# SchedSync 🚀

SchedSync is an AI-powered personal secretary that helps manage your daily tasks, schedule, and life effortlessly. It uses cutting-edge Gen-AI to create personalized schedules that adapt to your lifestyle, work patterns, and preferences.

![SchedSync Banner](public/assets/banner.png)

⚠️ **PROPRIETARY SOFTWARE NOTICE**: This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited.

## 🎯 Problem Statement

In today's fast-paced world, managing time effectively while balancing work, personal life, and well-being has become increasingly challenging. Traditional scheduling tools:
- Lack personalization
- Require manual input and management
- Don't adapt to changing routines
- Miss the human touch in schedule creation

## 💡 Solution

SchedSync addresses these challenges by offering:
- **Smart Scheduling**: AI-powered schedule generation based on your preferences
- **Personalized Routines**: Adapts to your sleeping patterns and work hours
- **Multi-channel Notifications**: Supports Email, WhatsApp, Telegram, and Call notifications
- **Task Management**: Intelligent task prioritization and organization
- **Context-Aware Planning**: Considers your profession, hobbies, and lifestyle

## 🛠️ Tech Stack

### Frontend
- Next.js 15.1.6
- React 19.0.0
- TypeScript
- Tailwind CSS
- Framer Motion
- Hero Icons

### Backend
- Node.js
- Prisma ORM
- PostgreSQL
- Google Gen AI
- LangChain

### AI & RAG Implementation
- Pinecone Vector Database
- OpenAI Embeddings (text-embedding-3-small)
- Google Gemini 1.5 Flash
- Custom RAG Pipeline
- LangChain for RAG orchestration

### Authentication
- Google OAuth
- JWT

### Deployment Infrastructure

#### Frontend (AWS Amplify)
- **AWS Amplify**
  - Next.js hosting and deployment
  - Built-in CI/CD pipeline
  - Automatic branch deployments
  - Environment variable management
  - Preview deployments for PRs

#### Backend (AWS Serverless)
- **AWS Lambda**
  - Container-based deployment
  - Node.js 22 runtime
  - Auto-scaling configuration
  - Concurrent execution limits
  - Memory optimization: 1024MB

- **Amazon API Gateway**
  - REST API endpoints
  - Custom domain mapping
  - Request throttling
  - API key authentication
  - CORS configuration

- **Amazon ECR**
  - Docker image repository
  - Automated image cleanup
  - Image versioning
  - Vulnerability scanning

#### Database & Storage
- Railway PostgreSQL (Primary Database)
- Pinecone Cloud (Vector Store)
- Amazon S3 (File Storage)

#### CI/CD Pipeline
- GitHub Actions for automated deployments
- Docker containerization
- ECR push automation
- Lambda function updates
- Database migrations

### Infrastructure Diagram
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   GitHub    │────>│GitHub Actions│────>│ Amazon ECR  │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────>│  API Gateway │────>│AWS Lambda   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                │
                                         ┌──────┴──────┐
                                         │  Database   │
                                         └─────────────┘
```

### Deployment Features

#### AWS Lambda Benefits
- **Serverless Architecture**: No server management required
- **Auto-scaling**: Handles varying workloads automatically
- **Cost-effective**: Pay only for actual compute time
- **High Availability**: Multiple availability zone deployment
- **Container Support**: Custom runtime via Docker

#### API Gateway Features
- **Security**: JWT validation & API key management
- **Throttling**: Rate limiting for API protection
- **Monitoring**: CloudWatch integration
- **Caching**: Response caching for better performance
- **Custom Domain**: SSL/TLS certificate management

#### CI/CD Workflow
1. Code push to main branch
2. GitHub Actions trigger
3. Docker image build
4. Previous ECR image cleanup
5. New image push to ECR
6. Lambda function update
7. Database migration execution

## 📊 Project Scale

- **Frontend**: 50+ Components
- **Backend**: 30+ API Endpoints
- **Database**: 6 Core Models
- **AI Integration**: 
  - Custom LangChain RAG implementation
  - Vector store with 1M+ embeddings
  - Advanced context retrieval system
- **Lines of Code**: 20,000+

## 🌟 Key Features

1. **Intelligent Schedule Generation**
   - AI-powered daily schedule creation using RAG
   - Context-aware scheduling based on historical data
   - Smart retrieval of relevant past schedules
   - Work-life balance optimization
   - Adaptive time management

2. **Multi-Channel Notifications**
   - Email notifications
   - WhatsApp integration
   - Telegram alerts
   - Phone call reminders

3. **Personalization**
   - Professional schedule integration
   - Hobby incorporation
   - Sleep pattern recognition
   - Work hours optimization

4. **Task Management**
   - Duration-based scheduling
   - Priority handling
   - Dynamic task adjustment

## 🔒 Security Features

- JWT Authentication
- Google OAuth Integration
- Environment Variable Protection
- API Route Protection
- Database Encryption

## 📈 Future Roadmap

- [ ] Calendar Integration (Google, Outlook)
- [ ] Mobile Application
- [ ] Advanced Analytics Dashboard

## ⚖️ Legal Notice

Copyright © 2024 SchedSync. All rights reserved.

This software and its documentation are protected by copyright law and international treaties. Unauthorized reproduction or distribution of this software, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law.

## 🔗 Official Links

- [Live Demo](https://schedsync.com)
- [API Documentation](https://api.schedsync.com/docs)

## 👥 Development Team

- Frontend Development Team
- Backend Development Team
- UI/UX Design Team
- AI Engineering Team
- DevOps Engineering Team

---
© 2024 SchedSync. All Rights Reserved.

## 🧠 AI Architecture

### RAG Implementation
- **Vector Store**: Pinecone for efficient similarity search
- **Embedding Model**: OpenAI's text-embedding-3-small
- **Context Retrieval**: Custom retrieval pipeline for schedule optimization
- **Generation**: Google Gemini 1.5 Flash for schedule creation
- **Document Processing**: Custom document chunking and embedding

### AI Features
- Historical schedule pattern recognition
- Contextual schedule optimization
- Intelligent task prioritization
- Adaptive learning from user preferences
- Smart conflict resolution
