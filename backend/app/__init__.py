from typing import Annotated
from fastapi import FastAPI, HTTPException, Query, Depends, status
from .database.models import User, Item
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables, SessionDep
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import datetime
import bcrypt
import jwt
import os
from dotenv import load_dotenv
from fastapi import Request, Response
from fastapi import Form
from app.database import get_session



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
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost",
    "http://127.0.0.1"
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
async def create_user(
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    session = Depends(get_session),
):
    # Vérifier si l'utilisateur existe déjà
    existing_user = session.exec(select(User).where(User.email == email)).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Cet email est déjà utilisé.")
    # (le reste ne change pas)
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    db_user = User(
        firstname=firstname,
        lastname=lastname,
        email=email,
        password=hashed_pw.decode("utf-8"),
        role="user"
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {"email": db_user.email, "id": db_user.id}

# ROUTE LOGIN – Génération du token JWT
@app.post("/api/v1/auth/login")
async def auth_login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    print(f"==> Tentative de login pour {form_data.username}")
    # Recherche l'utilisateur dans la base
    user = session.exec(select(User).where(User.email == form_data.username)).first()
    if not user:
        print("Utilisateur non trouvé !")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    print(f"User trouvé : {user.email}, hash en base: {user.password}")
    # Vérification du mot de passe (haché)
    if not bcrypt.checkpw(form_data.password.encode("utf-8"), user.password.encode("utf-8")):
        print("Mot de passe incorrect !")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    # Génération du JWT avec expiration (exp: 1h)
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=60)
    payload = {
    "sub": user.email,
    "exp": expire
    }
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
        # Retourne toutes les infos utiles du user
        return {
            "email": user.email,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "role": user.role,
            # Ajoute d'autres champs si tu veux (ex: photo_name)
        }
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
async def create_user(
    firstname: str = Form(...),
    lastname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    session = Depends(get_session),
):
    # Vérifier si l'email existe déjà
    existing_user = session.exec(select(User).where(User.email == email)).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Cet email est déjà utilisé.")
    
    if not password:
        raise HTTPException(status_code=400, detail="Password required")
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    db_user = User(
        firstname=firstname,
        lastname=lastname,
        email=email,
        password=hashed_pw.decode("utf-8"),
        role="user"
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return {"email": db_user.email, "id": db_user.id}

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
