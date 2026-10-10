"""ChainSentinel ML inference module"""
import pickle
import numpy as np
import os

class RiskClassifier:
    def __init__(self, model_path="ml/models/risk_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, "rb") as f:
                self.model = pickle.load(f)
        else:
            raise FileNotFoundError(f"Model not found at {self.model_path}. Run train_model.py first.")
    
    def extract_features(self, address_data):
        """Extract features from address transaction data."""
        return np.array([[
            address_data.get("tx_count", 0),
            address_data.get("counterparties", 0),
            address_data.get("avg_value", 0),
            address_data.get("max_value", 0),
            address_data.get("contracts", 0),
            address_data.get("days_active", 0),
            address_data.get("mixing_score", 0)
        ]])
    
    def predict(self, address_data):
        """Predict risk score (1-5) for an address."""
        features = self.extract_features(address_data)
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        confidence = float(np.max(probabilities))
        return int(prediction), confidence
    
    def get_risk_label(self, score):
        labels = {1: "Minimal", 2: "Low", 3: "Medium", 4: "High", 5: "Critical"}
        return labels.get(score, "Unknown")