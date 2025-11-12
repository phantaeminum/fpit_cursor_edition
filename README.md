# AI-Powered Budgeting Assistant

A complete full-stack application with Python backend and modern responsive frontend that helps users create and stick to budgets through AI-powered insights and adaptive recommendations.

## 🚀 Features

- **User Authentication & Onboarding**: Beautiful multi-step onboarding flow with JWT-based authentication
- **Dashboard**: Clean overview with budget status, AI insights, and quick actions
- **Transaction Management**: Add, edit, delete transactions with filtering and search
- **AI Budget Analysis**: Get personalized budget recommendations based on spending patterns
- **Proactive Alerts**: Real-time notifications for budget warnings and overspending
- **Budget Customization**: Interactive budget editor with drag-to-adjust sliders
- **Reports & Analytics**: Interactive charts showing spending trends and category breakdowns
- **Life Events**: Log major life changes and get AI-adjusted budget recommendations
- **Settings & Profile**: Manage profile, preferences, and account settings

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with refresh tokens
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude API
- **Email Service**: SendGrid or SMTP
- **Migrations**: Alembic

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS + Framer Motion for animations
- **State Management**: Zustand
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** and npm ([Download](https://nodejs.org/))
- **PostgreSQL 12+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fpti_new_assign
```

### 2. Backend Setup

#### Step 1: Create Virtual Environment

```bash
cd backend
python -m venv venv
```

#### Step 2: Activate Virtual Environment

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

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Set Up PostgreSQL Database

1. Create a new PostgreSQL database:
```sql
CREATE DATABASE budget_app;
```

2. Note your database credentials (username, password, host, port)

#### Step 5: Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your configuration:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/budget_app
JWT_SECRET=your-secret-key-here-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
# ... other variables
```

**Important**: 
- Generate a secure JWT_SECRET (you can use: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Or use Anthropic API key from [Anthropic Console](https://console.anthropic.com/)

#### Step 6: Run Database Migrations

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

#### Step 7: Start the Backend Server

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
copy .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

2. Edit `.env` and ensure the API URL is correct:
```env
REACT_APP_API_URL=http://localhost:8000
```

#### Step 4: Start the Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🎯 Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or: source venv/bin/activate  # macOS/Linux
uvicorn main:app --reload
```

2. **Start Frontend** (Terminal 2):
```bash
cd frontend
npm start
```

3. **Open Browser**: Navigate to `http://localhost:3000`

### Production Build

#### Backend

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend
npm run build
# Serve the build folder using a static file server
# For example, using serve:
npm install -g serve
serve -s build
```

## 📁 Project Structure

```
fpti_new_assign/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── models/               # SQLAlchemy models
│   ├── routers/              # API route handlers
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic
│   ├── utils/                # Helper functions
│   ├── config.py             # Configuration
│   ├── database.py           # Database connection
│   ├── main.py               # FastAPI app
│   └── requirements.txt      # Python dependencies
│
├── frontend/
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Helper functions
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind configuration
│
└── README.md                 # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/financial-profile` - Get financial profile
- `PUT /api/user/financial-profile` - Update financial profile

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/{id}` - Get specific transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Budget
- `GET /api/budget` - Get current budget
- `PUT /api/budget` - Update budget limits
- `GET /api/budget/status` - Get budget status

### AI
- `POST /api/ai/analyze` - Trigger AI analysis
- `POST /api/ai/recommend-budget` - Get AI budget recommendations
- `GET /api/ai/insights` - Get latest AI insights

### Alerts
- `GET /api/alerts` - Get all alerts
- `PUT /api/alerts/{id}/read` - Mark alert as read

### Reports
- `GET /api/reports/spending-trends` - Get spending trends
- `GET /api/reports/category-breakdown` - Get category breakdown

**Full API Documentation**: Visit `http://localhost:8000/docs` when the backend is running.

## 🧪 Testing

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

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database credentials

**Migration Errors:**
- Make sure all models are imported in `alembic/env.py`
- Try: `alembic downgrade -1` then `alembic upgrade head`

**Module Not Found:**
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**API Connection Error:**
- Check `REACT_APP_API_URL` in `.env` file
- Ensure backend is running on the correct port
- Check CORS settings in backend `main.py`

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version (requires 16+)

## 📝 Environment Variables Reference

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No* |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI features | No* |
| `AI_PROVIDER` | AI provider: "openai" or "anthropic" | No |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

*At least one AI API key is recommended for full functionality

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | Yes |

## 🚀 Deployment

### Backend Deployment

1. Set environment variables on your hosting platform
2. Run migrations: `alembic upgrade head`
3. Start server: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Recommended Platforms:**
- AWS Elastic Beanstalk
- Google Cloud Run
- Heroku
- Railway
- DigitalOcean App Platform

### Frontend Deployment

1. Build the app: `npm run build`
2. Deploy the `build` folder to static hosting

**Recommended Platforms:**
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Happy Budgeting! 💰**


