# Quick Start Guide

This guide will help you get the AI-Powered Budgeting Assistant up and running in minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Python 3.10+ installed
- ✅ Node.js 16+ and npm installed
- ✅ PostgreSQL installed and running
- ✅ Git installed

## Step-by-Step Setup

### 1. Database Setup (5 minutes)

1. Open PostgreSQL and create a new database:
```sql
CREATE DATABASE budget_app;
```

2. Note your PostgreSQL connection details:
   - Username (usually `postgres`)
   - Password
   - Host (usually `localhost`)
   - Port (usually `5432`)

### 2. Backend Setup (10 minutes)

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python -m venv venv
```

3. **Activate virtual environment:**

   **Windows (PowerShell):**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

   **Windows (Command Prompt):**
   ```cmd
   venv\Scripts\activate.bat
   ```

   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Create `.env` file:**
   - Copy `.env.example` to `.env`
   - Edit `.env` and fill in:
     ```env
     DATABASE_URL=postgresql://your_username:your_password@localhost:5432/budget_app
     JWT_SECRET=your-secret-key-here
     OPENAI_API_KEY=your-openai-api-key-here  # Optional but recommended
     FRONTEND_URL=http://localhost:3000
     ```

   **Generate JWT_SECRET:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

6. **Run database migrations:**
```bash
# First time setup - create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

7. **Start the backend server:**
```bash
uvicorn main:app --reload
```

✅ Backend should now be running at `http://localhost:8000`
✅ API docs available at `http://localhost:8000/docs`

### 3. Frontend Setup (5 minutes)

1. **Open a NEW terminal window** and navigate to frontend:
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
   - Copy `.env.example` to `.env`
   - Ensure it contains:
     ```env
     REACT_APP_API_URL=http://localhost:8000
     ```

4. **Start the frontend:**
```bash
npm start
```

✅ Frontend should now be running at `http://localhost:3000`

### 4. First Use

1. Open your browser and go to `http://localhost:3000`
2. Click "Get Started" on the welcome screen
3. Complete the onboarding process:
   - Step 1: Create your account
   - Step 2: Set up your financial profile
4. Start adding transactions and setting budgets!

## Troubleshooting

### Backend won't start
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Make sure virtual environment is activated
- Check if port 8000 is available

### Frontend won't start
- Check if Node.js version is 16+
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Verify `REACT_APP_API_URL` in `.env` matches backend URL

### Database connection errors
- Ensure PostgreSQL service is running
- Check database credentials in `.env`
- Verify database `budget_app` exists

### CORS errors
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check that both servers are running

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API documentation at `http://localhost:8000/docs`
- Check out the features in the dashboard

## Need Help?

- Check the main README.md for detailed information
- Review API documentation at `/docs` endpoint
- Check console logs for error messages

---

**Happy Budgeting! 💰**



