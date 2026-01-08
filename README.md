# Todo Web Application

A secure, multi-user todo application with Next.js frontend, FastAPI backend, and Neon PostgreSQL database. The application provides user authentication with JWT tokens, task CRUD operations, and responsive UI following the architecture defined in the specification. All API endpoints enforce JWT authentication and user data isolation.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, read, update, delete, and mark tasks as complete
- **Multi-User Isolation**: Each user can only access their own tasks
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure API**: All endpoints require JWT authentication
- **Modern Tech Stack**: Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL

## Tech Stack

- **Frontend**: Next.js 16+, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: Better Auth with JWT
- **ORM**: SQLModel

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (or Neon Serverless PostgreSQL account)

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/todoapp
   BETTER_AUTH_SECRET=your-super-secret-jwt-key-here
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. Initialize the database:
   ```bash
   python -m src.database.setup
   ```

5. Start the backend server:
   ```bash
   cd src
   python -m uvicorn main:app --reload --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API is automatically documented with Swagger UI. Once the backend is running, visit:
- API Documentation: http://localhost:8000/docs
- API Redoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── src/
│   ├── models/          # Database models (User, Task)
│   ├── services/        # Business logic (auth, user, task services)
│   ├── api/             # API routes (auth, user, task endpoints)
│   ├── database/        # Database connection and setup
│   └── main.py          # Main FastAPI application
└── requirements.txt     # Python dependencies

frontend/
├── app/                 # Next.js 16+ app directory
│   ├── auth/            # Authentication pages (login, register)
│   ├── dashboard/       # Dashboard page
│   ├── tasks/           # Task detail page
│   └── profile/         # User profile page
├── src/
│   ├── components/      # React components
│   ├── services/        # API client and utilities
│   └── styles/          # Global styles
└── package.json         # Node.js dependencies
```

## Security Features

- JWT authentication on all API endpoints
- User data isolation - users can only access their own tasks
- Password hashing using bcrypt
- Input validation on all endpoints
- SQL injection protection via SQLModel

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

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: JWT secret key
- `BETTER_AUTH_URL`: Frontend URL for auth redirects

### Frontend (.env.local)
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Frontend URL
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User
- `GET /api/users/me` - Get current user profile

### Tasks
- `GET /api/{user_id}/tasks` - Get user's tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{task_id}` - Get a specific task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Mark task as complete/incomplete

## Development

### Adding New Features

1. Update the specification in `specs/overview.md`
2. Update the plan in `specs/1-todo-web-app/plan.md` if needed
3. Update tasks in `specs/1-todo-web-app/tasks.md` if needed
4. Implement the feature following the existing patterns

### Code Style

- Python: Follow PEP 8 guidelines
- TypeScript/JavaScript: Use ESLint and Prettier (configured in the project)
- CSS: Use Tailwind utility classes where possible

## Deployment

### Backend
- Deploy to any Python-compatible hosting (Heroku, Railway, etc.)
- Ensure environment variables are set in production
- Set up production database connection

### Frontend
- Build for production: `npm run build`
- Deploy to Vercel, Netlify, or similar hosting
- Configure environment variables for production API endpoints

## Troubleshooting

### Common Issues

1. **Database Connection Issues**: Ensure your PostgreSQL server is running and credentials are correct in `.env`
2. **JWT Authentication Issues**: Verify that `BETTER_AUTH_SECRET` is the same in both frontend and backend
3. **CORS Issues**: Check that your frontend URL is properly configured in the backend CORS settings

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- API powered by [FastAPI](https://fastapi.tiangolo.com/)
- Database ORM: [SQLModel](https://sqlmodel.tiangolo.com/)
- Authentication: [Better Auth](https://www.better-auth.com/)