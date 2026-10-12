"""ChainSentinel ML inference script - called by the TypeScript API via subprocess."""
import sys
import json
import os
import pickle
import numpy as np
from feature_engineering import compute_features

DEFAULT_CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.5"))


def load_model():
    with open("ml/models/risk_model.pkl", "rb") as f:
        return pickle.load(f)


def extract_features(data):
    enhanced = compute_features(data)
    return np.array([[
        enhanced.get("tx_count", 0),
        enhanced.get("counterparties", 0),
        enhanced.get("avg_value", 0),
        enhanced.get("max_value", 0),
        enhanced.get("contracts", 0),
        enhanced.get("days_active", 0),
        enhanced.get("mixing_score", 0),
        enhanced.get("tx_frequency", 0),
        enhanced.get("counterparty_diversity", 0),
        enhanced.get("value_concentration", 0),
        enhanced.get("contract_ratio", 0),
        enhanced.get("risk_velocity", 0),
        enhanced.get("activity_growth_rate", 0)
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

        threshold = input_data.get("confidence_threshold", DEFAULT_CONFIDENCE_THRESHOLD)

        all_probs = {str(label): round(float(p), 4) for label, p in zip(model.classes_, probabilities)}

        result = {
            "riskScore": int(prediction),
            "riskLabel": get_risk_label(int(prediction)),
            "confidence": round(confidence, 4),
            "confidenceThreshold": round(threshold, 4),
            "belowThreshold": confidence < threshold,
            "allProbabilities": all_probs,
        }

        if confidence < threshold:
            result["warning"] = f"Confidence {round(confidence, 4)} is below threshold {round(threshold, 4)}"

        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()