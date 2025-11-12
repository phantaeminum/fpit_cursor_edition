from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from routers import auth, user, transactions, budget, category, ai, alerts, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Budgeting Assistant API",
    description="Backend API for the AI-Powered Budgeting Assistant",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(transactions.router)
app.include_router(budget.router)
app.include_router(category.router)
app.include_router(ai.router)
app.include_router(alerts.router)
app.include_router(reports.router)


@app.get("/")
async def root():
    return {
        "message": "AI-Powered Budgeting Assistant API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

