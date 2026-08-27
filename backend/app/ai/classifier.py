# pyrefly: ignore [missing-import]
import torch.nn as nn
# pyrefly: ignore [missing-import]
from torchvision.models import resnet18, ResNet18_Weights


def build_model(num_classes: int = 10):
    """
    Build a ResNet18 transfer learning model.
    """

    # Load pretrained ResNet18
    model = resnet18(weights=ResNet18_Weights.DEFAULT)

    # Freeze all pretrained layers
    for param in model.parameters():
        param.requires_grad = False

    # Replace the final classification layer
    model.fc = nn.Sequential(
        nn.Linear(model.fc.in_features, 512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, num_classes),
    )

    return model