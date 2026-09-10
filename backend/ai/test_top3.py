from ai.predict import predict_image


IMAGE_PATH = (
    r"D:\Development\Textile-Waste-Intelligence-Platform"
    r"\datasets\Cotton\10\im_1.png"
)


result = predict_image(
    IMAGE_PATH
)


print("\n" + "=" * 60)
print("AI TEXTILE ANALYSIS")
print("=" * 60)

print(
    f"\nPrimary Fabric : "
    f"{result['fabric']}"
)

print(
    f"Confidence    : "
    f"{result['confidence']}%"
)

print("\nTop Predictions:")

for prediction in result["top_predictions"]:

    print(
        f"  {prediction['fabric']:<15}"
        f"{prediction['confidence']:.2f}%"
    )

print(
    f"\nCategory      : "
    f"{result['category']}"
)

print(
    f"Recyclability : "
    f"{result['recyclability']}"
)

print(
    f"Recommendation: "
    f"{result['recommendation']}"
)

print("\n" + "=" * 60)