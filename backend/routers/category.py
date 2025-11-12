from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_
from database import get_db
from models.category import Category
from routers.auth import get_current_user
from models.user import User
from schemas.category import CategoryCreate, CategoryResponse
from typing import List

router = APIRouter(prefix="/api/budget/category", tags=["categories"])


@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all categories for current user."""
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    return categories


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a custom category."""
    # Check if category name already exists for user
    existing = db.query(Category).filter(
        and_(
            Category.user_id == current_user.id,
            Category.name == category_data.name
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    category = Category(
        user_id=current_user.id,
        name=category_data.name,
        icon=category_data.icon,
        color=category_data.color,
        is_default=False
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a custom category (cannot delete default categories)."""
    category = db.query(Category).filter(
        and_(
            Category.id == category_id,
            Category.user_id == current_user.id
        )
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    if category.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default category"
        )
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}

