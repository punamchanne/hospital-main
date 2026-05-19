# train_model.py
"""Train a heart disease risk classifier and save the model.
The dataset used is the UCI Heart Disease dataset (CSV format).
Download the CSV (heart.csv) and place it in the same directory as this script.
"""
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset – expect columns include: age, sex, cp, trestbps, chol, fbs, thalach, target
# Adjust column names if they differ.
df = pd.read_csv('heart.csv')
X = df.drop('target', axis=1)
y = df['target']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=200, random_state=42)
clf.fit(X_train, y_train)

preds = clf.predict(X_test)
print('Test Accuracy:', accuracy_score(y_test, preds))

# Save the trained model
joblib.dump(clf, 'model.pkl')
