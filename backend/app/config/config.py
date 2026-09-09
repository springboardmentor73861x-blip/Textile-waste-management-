from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/textile_waste_db")
SECRET_KEY = os.getenv("SECRET_KEY", "textile-waste-intelligence-secret-key-2026")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Configurable estimates. Inventory quantities are assumed to be kilograms.
CO2_SAVINGS_PER_KG = float(os.getenv("CO2_SAVINGS_PER_KG", "2.5"))
WATER_SAVINGS_PER_KG = float(os.getenv("WATER_SAVINGS_PER_KG", "1000"))
LANDFILL_DIVERSION_PER_KG = float(os.getenv("LANDFILL_DIVERSION_PER_KG", "1.0"))
RESOURCE_RECOVERY_PER_KG = float(os.getenv("RESOURCE_RECOVERY_PER_KG", "1.0"))
FRONTEND_ORIGINS = [origin.strip() for origin in os.getenv(
	"FRONTEND_ORIGINS",
	"http://localhost:5173,http://127.0.0.1:5173"
).split(",") if origin.strip()]
