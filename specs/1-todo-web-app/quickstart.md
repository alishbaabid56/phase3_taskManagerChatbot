# Quickstart Guide: Todo Web Application

## Prerequisites

- Node.js 18+ for frontend development
- Python 3.11+ for backend development
- PostgreSQL (or Neon Serverless PostgreSQL account)
- Better Auth account setup
- Git for version control

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Set up backend environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up frontend environment:
   ```bash
   cd frontend
   npm install
   ```

## Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend (.env)**:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/todoapp
BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
BETTER_AUTH_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Database Setup

1. Set up Neon Serverless PostgreSQL database
2. Run database migrations:
   ```bash
   cd backend
   python -m src.database.migrate
   ```

## Running the Application

### Backend (FastAPI)
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend
- Deploy to any Python-compatible hosting (Heroku, Railway, etc.)
- Ensure environment variables are set in production
- Set up production database connection

### Frontend
- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or similar hosting
- Configure environment variables for production API endpoints