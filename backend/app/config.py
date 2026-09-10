from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    PROJECT_NAME = "Textile Waste Intelligence Platform"
    PROJECT_VERSION = "1.0.0"

    DATABASE_URL = os.getenv("DATABASE_URL")

    SECRET_KEY = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


settings = Settings()