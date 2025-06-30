from typing import Annotated, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select



class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str 
    description: str 
    image_url: str
    price: float