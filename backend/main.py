from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from db import users
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI()
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET")

class RegisterModel(BaseModel):
    name: str
    surname: str
    gender: str
    job: str
    email: EmailStr
    password: str
    anxiety: int

class LoginModel(BaseModel):
    email: EmailStr
    password: str

def hash_pass(p):
    return pwd.hash(p)

def verify(p, h):
    return pwd.verify(p, h)

@app.post("/api/register")
def register(data: RegisterModel):
    if users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User exists")

    res = users.insert_one({
        "name": data.name,
        "surname": data.surname,
        "gender": data.gender,
        "job": data.job,
        "email": data.email,
        "password": hash_pass(data.password),
        "anxiety": data.anxiety
    })

    return {"success": True, "id": str(res.inserted_id)}

@app.post("/api/login")
def login(data: LoginModel):
    user = users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = jwt.encode({"id": str(user["_id"])}, JWT_SECRET, algorithm="HS256")

    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "surname": user["surname"],
            "email": user["email"],
            "gender": user["gender"]
        }
    }

@app.get("/api/test-db")
def test_db():
    return {"count": users.count_documents({})}
