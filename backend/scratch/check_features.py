import joblib
import os

features_path = r'c:\Users\punam\OneDrive\Desktop\hospital main\hospital-main\backend\models\features.pkl'
if os.path.exists(features_path):
    features = joblib.load(features_path)
    print("Features:", features)
else:
    print("features.pkl not found")
