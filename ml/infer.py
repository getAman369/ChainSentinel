"""ChainSentinel ML inference script - called by the TypeScript API via subprocess."""
import sys
import json
import pickle
import numpy as np

def load_model():
    with open("ml/models/risk_model.pkl", "rb") as f:
        return pickle.load(f)

def extract_features(data):
    return np.array([[
        data.get("tx_count", 0),
        data.get("counterparties", 0),
        data.get("avg_value", 0),
        data.get("max_value", 0),
        data.get("contracts", 0),
        data.get("days_active", 0),
        data.get("mixing_score", 0)
    ]])

def get_risk_label(score):
    labels = {1: "Minimal", 2: "Low", 3: "Medium", 4: "High", 5: "Critical"}
    return labels.get(score, "Unknown")

def main():
    try:
        input_data = json.loads(sys.argv[1])
        model = load_model()
        features = extract_features(input_data)
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(np.max(probabilities))
        
        result = {
            "riskScore": int(prediction),
            "riskLabel": get_risk_label(int(prediction)),
            "confidence": round(confidence, 4)
        }
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()