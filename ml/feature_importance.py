"""Feature importance analysis for the trained model.

Extracts and ranks feature importances from the RandomForest model,
provides SHAP-like insights, and saves results as JSON.
"""
import pickle
import json
import os
import numpy as np
from feature_engineering import ALL_FEATURES

MODEL_PATH = "ml/models/risk_model.pkl"
FEATURE_NAMES = ALL_FEATURES
OUTPUT_PATH = "ml/models/feature_importance.json"


def load_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train_model.py first.")
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def get_feature_importances(model=None) -> list:
    """Get sorted feature importances from the model.

    Args:
        model: Optional pre-loaded model.

    Returns:
        List of dicts: {feature, importance, rank}
    """
    if model is None:
        model = load_model()

    if not hasattr(model, "feature_importances_"):
        return []

    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1]

    results = []
    for rank, idx in enumerate(indices, 1):
        results.append({
            "feature": FEATURE_NAMES[idx],
            "importance": float(importances[idx]),
            "rank": rank,
        })

    return results


def print_importance_table(importances: list) -> None:
    """Print a formatted feature importance table."""
    print(f"\n{'='*55}")
    print("Feature Importance Ranking")
    print(f"{'='*55}")
    print(f"{'Rank':<6} {'Feature':<28} {'Importance':<12}")
    print("-" * 55)
    for item in importances:
        bar_len = int(item["importance"] * 40)
        bar = "█" * bar_len + "░" * (40 - bar_len)
        print(f"{item['rank']:<6} {item['feature']:<28} {item['importance']:<.4f} {bar}")
    print()


def save_importance(importances: list) -> None:
    """Save feature importance to a JSON file."""
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    data = {
        "features": FEATURE_NAMES,
        "importances": importances,
        "top_features": [i["feature"] for i in importances[:5]],
    }
    with open(OUTPUT_PATH, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Feature importance saved to {OUTPUT_PATH}")


def top_features(n: int = 5) -> list:
    """Return the top N most important features."""
    importances = get_feature_importances()
    return [item["feature"] for item in importances[:n]]


def main():
    importances = get_feature_importances()
    print_importance_table(importances)
    save_importance(importances)


if __name__ == "__main__":
    main()
