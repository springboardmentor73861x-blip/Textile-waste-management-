import pandas as pd

from app.database import SessionLocal
from app.models.sustainable_fashion import SustainableFashion

# Create database session
db = SessionLocal()

# Read CSV
df = pd.read_csv("dataset/sustainable_fashion.csv")

# Insert each row
for _, row in df.iterrows():

    record = SustainableFashion(
        brand_id=row["Brand_ID"],
        brand_name=row["Brand_Name"],
        country=row["Country"],
        year=row["Year"],
        sustainability_rating=row["Sustainability_Rating"],
        material_type=row["Material_Type"],
        eco_friendly_manufacturing=row["Eco_Friendly_Manufacturing"],
        carbon_footprint_mt=row["Carbon_Footprint_MT"],
        water_usage_liters=row["Water_Usage_Liters"],
        waste_production_kg=row["Waste_Production_KG"],
        recycling_programs=row["Recycling_Programs"],
        product_lines=row["Product_Lines"],
        average_price_usd=row["Average_Price_USD"],
        market_trend=row["Market_Trend"],
        certifications="" if str(row["Certifications"]) == "nan" else row["Certifications"]
        
    )

    db.add(record)

db.commit()
db.close()

print("✅ Sustainable Fashion Dataset Imported Successfully!")