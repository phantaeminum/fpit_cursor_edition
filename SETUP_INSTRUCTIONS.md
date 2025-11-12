# Complete Setup Instructions

## 🚀 Running the Application

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 12+
- Git

### Step 1: Database Setup

1. Start PostgreSQL service
2. Create database:
```sql
CREATE DATABASE budget_app;
```

### Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example and fill in values)
# Required variables:
# - DATABASE_URL=postgresql://user:password@localhost:5432/budget_app
# - JWT_SECRET=your-secret-key
# - FRONTEND_URL=http://localhost:3000

# Run migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Start server
uvicorn main:app --reload
```

Backend runs on: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Step 3: Frontend Setup

```bash
# Open NEW terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Set: REACT_APP_API_URL=http://localhost:8000

# Start development server
npm start
```

Frontend runs on: `http://localhost:3000`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/budget_app
JWT_SECRET=generate-with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
AI_PROVIDER=openai
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
SENDGRID_API_KEY=your-key-here
EMAIL_FROM=noreply@budgetapp.com
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🔧 Common Commands

### Backend
```bash
# Run server
uvicorn main:app --reload

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Frontend
```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🐛 Troubleshooting

### Database Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### Port Conflicts
- Backend default: 8000
- Frontend default: 3000
- Change ports if needed

### CORS Errors
- Verify FRONTEND_URL in backend .env
- Check both servers are running

### Module Not Found
- Backend: Reinstall with `pip install -r requirements.txt`
- Frontend: Delete node_modules and reinstall

## 📚 Additional Resources

- Full documentation: [README.md](README.md)
- Quick start: [QUICK_START.md](QUICK_START.md)
- API documentation: http://localhost:8000/docs



