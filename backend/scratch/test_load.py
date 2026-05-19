import joblib
import os
import sys

MODEL_PATH = r"c:\Users\punam\OneDrive\Desktop\hospital main\hospital-main\backend\models\heart_model.pkl"

try:
    print(f"Python version: {sys.version}")
    import sklearn
    print(f"Scikit-learn version: {sklearn.__version__}")
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
