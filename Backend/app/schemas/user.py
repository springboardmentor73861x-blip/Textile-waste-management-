from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role:str="user"
    company_name: str | None = None
    company_code: str | None = None
    


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    company_name: str | None = None
    company_code: str | None = None

    class Config:
        from_attributes = True