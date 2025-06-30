from typing import Annotated
from fastapi import FastAPI, HTTPException, Query, Depends, status
from .database.models import User, Item
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables, SessionDep
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt
import jwt
import os
from dotenv import load_dotenv
from fastapi import Request, Response

# Charger les variables d'environnement (.env)
load_dotenv()

app = FastAPI()

# Middleware : headers de sécurité (CSP, X-Frame, etc.)
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# CORS pour permettre au front de communiquer
origins = [
    "http://localhost",
    "http://localhost:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Système d'auth par token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")



@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
async def root():
    return {"message": "Hello World"}

# ROUTE INSCRIPTION (POST) – Hachage du mot de passe
@app.post("/api/v1/users/create")
async def create_user(user: User, session: SessionDep):
    user_dict = user.dict()
    # Hachage du mot de passe (bcrypt)
    if not user_dict.get("password"):
        raise HTTPException(status_code=400, detail="Password required")
    hashed_pw = bcrypt.hashpw(user_dict["password"].encode("utf-8"), bcrypt.gensalt())
    user_dict["password"] = hashed_pw.decode("utf-8")
    # On crée un nouvel utilisateur
    db_user = User(**user_dict)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {"email": db_user.email, "id": db_user.id}

# ROUTE LOGIN – Génération du token JWT
@app.post("/api/v1/auth/login")
async def auth_login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    # Recherche l'utilisateur dans la base
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # Vérification du mot de passe (haché)
    if not bcrypt.checkpw(form_data.password.encode("utf-8"), user.password.encode("utf-8")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # Génération du JWT (exp: 1h)
    payload = {"sub": user.email}
    secret_key = os.getenv("SECRET_KEY", "changeme!")
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

# ROUTE SECURISEE (exemple)
@app.get("/api/v1/users/me")
async def read_user_me(token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep):
    try:
        secret_key = os.getenv("SECRET_KEY", "changeme!")
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        email = payload.get("sub")
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"email": user.email, "firstname": user.firstname}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ROUTE SUPPRESSION SECURISEE
@app.delete("/api/v1/users/delete")
async def delete_user(token: Annotated[str, Depends(oauth2_scheme)], session: SessionDep):
    try:
        secret_key = os.getenv("SECRET_KEY", "changeme!")
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        email = payload.get("sub")
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        session.delete(user)
        session.commit()
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ITEMS CRUD (existant, inchangé)
@app.post("/api/v1/items/create")
async def create_item(item: Item, session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]):
    session.add(item)
    session.commit()
    session.refresh(item)
    return item

@app.put("/api/v1/items/{item_id}")
async def update_item(item_id: int, item: Item, token: Annotated[str, Depends(oauth2_scheme)]):
    return {"item_id": item_id, **item.dict()}

@app.get("/api/v1/items")
def read_items(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Item]:
    items = session.exec(select(Item).offset(offset).limit(limit)).all()
    return items

@app.get("/api/v1/items/{item_id}")
def read_item(item_id: int, session: SessionDep) -> Item:
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@app.delete("/api/v1/items/{item_id}")
def delete_item(item_id: int, session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]):
    item = session.get(Item, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(item)
    session.commit()
    return {"ok": True}
