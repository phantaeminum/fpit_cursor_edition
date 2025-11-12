from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import Base


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(50), nullable=False)
    icon = Column(String(50))
    color = Column(String(7))  # Hex color code
    is_default = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="categories")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="category")

