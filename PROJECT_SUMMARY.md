# Futrix AI - Career Twin Platform

## Project Overview

Futrix AI Career Twin is an intelligent career analysis platform that leverages artificial intelligence to analyze resumes, extract skills, match candidates with suitable tech roles, and provide personalized career development recommendations.

## Live Deployment

- **Application URL**: https://futrixai.netlify.app
- **API Endpoint**: https://futrix-node-api.onrender.com
- **AI Service**: https://futrix-python-ai.onrender.com
- **Repository**: https://github.com/kirtan597/Futrix-Ai

## Technical Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Zustand
- **Visualization**: Recharts, Motion
- **Deployment**: Netlify

### Backend Services
1. **Node.js API Server**
   - Framework: Express 5
   - Authentication: JWT + Google OAuth 2.0
   - Database: MongoDB Atlas
   - Deployment: Render

2. **Python AI Engine**
   - Framework: FastAPI
   - NLP Processing: spaCy, NLTK
   - Skill Extraction: Custom algorithm
   - Deployment: Render

### Database
- **MongoDB Atlas** (Cloud)
- Collections: Users, Analyses
- Features: Secure authentication, session management

## Key Features

### 1. Authentication System
- Google OAuth 2.0 integration
- Email magic link authentication
- JWT-based session management with refresh tokens
- Secure token rotation and invalidation

### 2. Resume Analysis
- PDF and text input support
- AI-powered skill extraction (160+ tech skills)
- Experience level detection
- Comprehensive resume parsing

### 3. Career Intelligence
- Role matching across 7 tech positions
- Match percentage calculation
- Salary range estimation
- Skills gap analysis
- Personalized career path recommendations

### 4. Data Visualization
- Interactive score ring with animations
- Skills radar chart (6 categories)
- Role match cards with detailed breakdowns
- Career progression timeline
- Skills heatmap

### 5. Security & Performance
- Rate limiting (5 uploads/hour, 10 logins/15min)
- CORS protection
- Input validation
- Secure environment variable management

## Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Vite, MUI, Recharts |
| Backend API | Node.js, Express, JWT, Google OAuth |
| AI Engine | Python, FastAPI, spaCy, NLTK |
| Database | MongoDB Atlas |
| Deployment | Netlify, Render |
| Version Control | Git, GitHub |

## Project Metrics

- **Total Code**: ~15,000+ lines
- **Languages**: TypeScript, JavaScript, Python, HTML/CSS
- **Services**: 3 (Frontend, API, AI)
- **Test Coverage**: 52 comprehensive integration tests
- **API Endpoints**: 8 secured RESTful endpoints

## Development Highlights

1. **Full-Stack Integration**: Seamless communication between React frontend, Node.js API, and Python AI service
2. **Modern Architecture**: Microservices-based design with clear separation of concerns
3. **Production-Ready**: Comprehensive error handling, logging, and monitoring
4. **Scalable Design**: Cloud-native deployment with auto-scaling capabilities
5. **Security First**: Industry-standard authentication, rate limiting, and data protection

## Deployment Configuration

### Environment Variables
- JWT secrets for secure token generation
- MongoDB connection string
- Google OAuth credentials
- Cross-origin resource sharing (CORS) settings
- API service URLs

### CI/CD
- Automatic deployment via GitHub integration
- Render auto-deploy on main branch push
- Netlify continuous deployment

## Testing & Quality Assurance

- 52 production integration tests
- Health check endpoints for all services
- Authentication flow validation
- API endpoint verification
- CORS and security testing
- Rate limiting validation

## Performance Characteristics

- **First Load**: < 2 seconds
- **API Response**: < 1 second (active), ~30s (cold start)
- **AI Analysis**: 3-5 seconds per resume
- **Database Queries**: < 100ms average

## Future Enhancement Opportunities

- LinkedIn profile integration
- Real-time job search API integration
- Interview preparation module
- Resume builder/editor
- Mobile application (React Native)
- Advanced analytics dashboard

## Conclusion

Futrix AI Career Twin demonstrates proficiency in modern full-stack development, cloud deployment, AI/ML integration, and production-grade application architecture. The platform successfully combines cutting-edge technologies to deliver a practical solution for career development and job matching.

---

**Project Status**: Production Ready  
**Version**: 2.0.1  
**Deployment Date**: August 2026  
**Development Team**: Kirtan Patel
