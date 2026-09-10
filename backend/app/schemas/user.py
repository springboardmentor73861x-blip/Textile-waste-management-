from pydantic import BaseModel, EmailStr
from typing import Literal

Role = Literal[
    "recycling_operator",
    "sustainability_manager",
    "manufacturer",
    "admin",
]

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Role = "recycling_operator"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str   
class GoogleAuthRequest(BaseModel):
    credential: str
    role: Role = "recycling_operator"