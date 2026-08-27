import cv2
import numpy as np
from PIL import Image


class FabricFeatureExtractor:
    """
    Feature Extractor for Textile Visual & Structural Properties using OpenCV & NumPy.
    Computes a 16-dimensional normalized feature vector capturing color distributions,
    specular sheen, metallic zari content, edge density, Sobel texture energy, and local variance.
    """

    @staticmethod
    def extract_features(img: Image.Image) -> np.ndarray:
        """
        Extracts 16-element float32 feature vector from a PIL Image.
        """
        # Convert PIL Image to RGB numpy array
        rgb = np.array(img.convert("RGB"))
        
        # 1. Color Space Metrics (HSV)
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        sat = hsv[:, :, 1]
        val = hsv[:, :, 2]
        hue = hsv[:, :, 0]

        sat_mean = float(sat.mean()) / 255.0
        sat_std = float(sat.std()) / 255.0
        val_mean = float(val.mean()) / 255.0
        val_std = float(val.std()) / 255.0
        
        # Specular Sheen (Silk/Satin lustre ratio: proportion of bright highlights)
        sheen_ratio = float(np.mean(val > 230))
        
        # Metallic Border / Zari score (Gold/Silver highlights)
        gold_mask = (rgb[:, :, 0] > 165) & (rgb[:, :, 1] > 135) & (rgb[:, :, 2] < 145)
        zari_score = float(np.mean(gold_mask & (hue >= 10) & (hue <= 40)))

        # 2. Gray-Scale & Texture Metrics
        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        
        # Canny edge density (ribbed denim, corduroy, terrycloth weave)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.mean(edges > 0))

        # Sobel gradient energy (weave directionality & texture roughness)
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel_mag = np.sqrt(sobelx**2 + sobely**2)
        sobel_energy = float(min(1.0, np.mean(sobel_mag) / 128.0))

        # Variance of Laplacian (image focus & fine texture sharpness)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        laplacian_norm = float(min(1.0, laplacian_var / 1000.0))

        # Local standard deviation (3x3 neighborhood texture roughness)
        blur = cv2.blur(gray.astype(np.float32), (3, 3))
        blur_sq = cv2.blur((gray.astype(np.float32))**2, (3, 3))
        local_var = np.maximum(0.0, blur_sq - blur**2)
        local_std_mean = float(min(1.0, np.mean(np.sqrt(local_var)) / 64.0))

        # 3. Color Moments (RGB means and stds)
        r_mean = float(rgb[:, :, 0].mean()) / 255.0
        g_mean = float(rgb[:, :, 1].mean()) / 255.0
        b_mean = float(rgb[:, :, 2].mean()) / 255.0

        r_std = float(rgb[:, :, 0].std()) / 255.0
        g_std = float(rgb[:, :, 1].std()) / 255.0
        b_std = float(rgb[:, :, 2].std()) / 255.0

        # Construct 16-dim feature array
        features = np.array([
            sat_mean,        # 0: HSV saturation mean
            sat_std,         # 1: HSV saturation std
            val_mean,        # 2: HSV brightness mean
            val_std,         # 3: HSV brightness std
            sheen_ratio,     # 4: Lustre / sheen highlight ratio
            zari_score,      # 5: Metallic border score
            edge_density,    # 6: Canny edge density
            sobel_energy,    # 7: Sobel gradient energy
            laplacian_norm,  # 8: Laplacian texture sharpness
            local_std_mean,  # 9: Local std dev roughness
            r_mean,          # 10: Red mean
            g_mean,          # 11: Green mean
            b_mean,          # 12: Blue mean
            r_std,           # 13: Red std
            g_std,           # 14: Green std
            b_std            # 15: Blue std
        ], dtype=np.float32)

        return features
