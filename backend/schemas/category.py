from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    icon: Optional[str]
    color: Optional[str]
    is_default: bool
    
    class Config:
        from_attributes = True

