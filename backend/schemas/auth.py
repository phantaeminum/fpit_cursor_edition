from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from utils.validators import validate_password, validate_email, validate_phone


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)
    
    @validator("password")
    def validate_password_strength(cls, v):
        is_valid, error = validate_password(v)
        if not is_valid:
            raise ValueError(error)
        return v
    
    @validator("phone")
    def validate_phone_format(cls, v):
        if v and not validate_phone(v):
            raise ValueError("Invalid phone number format")
        return v


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    
    @validator("new_password")
    def validate_password_strength(cls, v):
        is_valid, error = validate_password(v)
        if not is_valid:
            raise ValueError(error)
        return v

