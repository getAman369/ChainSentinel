"""Model evaluation metrics tracking.

Computes and tracks comprehensive metrics including
accuracy, precision, recall, F1-score, and per-class metrics.
"""
import numpy as np
import json
import os
from datetime import datetime
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
)


METRICS_FILE = "ml/models/metrics.json"


def compute_metrics(y_true, y_pred, risk_labels=None):
    """Compute comprehensive evaluation metrics.

    Args:
        y_true: Ground truth labels.
        y_pred: Predicted labels.
        risk_labels: Optional mapping of label to human-readable name.

    Returns:
        Dictionary of metrics.
    """
    if risk_labels is None:
        risk_labels = {1: "Minimal", 2: "Low", 3: "Medium", 4: "High", 5: "Critical"}

    accuracy = float(accuracy_score(y_true, y_pred))
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, y_pred, average=None, labels=list(risk_labels.keys()), zero_division=0
    )

    cm = confusion_matrix(y_true, y_pred, labels=list(risk_labels.keys()))

    per_class = {}
    for i, label in enumerate(sorted(risk_labels.keys())):
        idx = i
        per_class[risk_labels[label]] = {
            "precision": float(precision[idx]),
            "recall": float(recall[idx]),
            "f1_score": float(f1[idx]),
            "support": int(support[idx]),
        }

    macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    weighted_p, weighted_r, weighted_f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    metrics = {
        "accuracy": accuracy,
        "macro_avg": {
            "precision": float(macro_p),
            "recall": float(macro_r),
            "f1_score": float(macro_f1),
        },
        "weighted_avg": {
            "precision": float(weighted_p),
            "recall": float(weighted_r),
            "f1_score": float(weighted_f1),
        },
        "per_class": per_class,
        "confusion_matrix": cm.tolist(),
        "computed_at": datetime.utcnow().isoformat() + "Z",
    }

    return metrics


def save_metrics(metrics, model_version=None):
    """Save metrics to a JSON file.

    Args:
        metrics: Metrics dictionary.
        model_version: Optional version string.
    """
    os.makedirs("ml/models", exist_ok=True)

    history = []
    if os.path.exists(METRICS_FILE):
        try:
            with open(METRICS_FILE, "r") as f:
                history = json.load(f)
                if not isinstance(history, list):
                    history = []
        except (json.JSONDecodeError, IOError):
            history = []

    entry = {
        "version": model_version or "unknown",
        "metrics": metrics,
    }

    history.append(entry)

    with open(METRICS_FILE, "w") as f:
        json.dump(history, f, indent=2)

    print(f"Metrics saved to {METRICS_FILE}")


def print_metrics(metrics):
    """Print metrics in a formatted table."""
    print(f"\n{'='*50}")
    print("Model Evaluation Metrics")
    print(f"{'='*50}")
    print(f"Accuracy:           {metrics['accuracy']:.4f}")
    print(f"Macro F1-Score:     {metrics['macro_avg']['f1_score']:.4f}")
    print(f"Weighted F1-Score:  {metrics['weighted_avg']['f1_score']:.4f}")
    print(f"\nPer-Class Metrics:")
    print(f"{'Class':<12} {'Precision':<12} {'Recall':<12} {'F1-Score':<12} {'Support':<10}")
    print("-" * 58)
    for label, vals in metrics["per_class"].items():
        print(f"{label:<12} {vals['precision']:<12.4f} {vals['recall']:<12.4f} "
              f"{vals['f1_score']:<12.4f} {vals['support']:<10}")
    print(f"\nConfusion Matrix (rows=true, cols=pred):")
    for row in metrics["confusion_matrix"]:
        print("  " + " ".join(f"{v:4d}" for v in row))
    print(f"\nComputed at: {metrics['computed_at']}")


def load_latest_metrics():
    """Load the most recent metrics entry."""
    if not os.path.exists(METRICS_FILE):
        return None

    try:
        with open(METRICS_FILE, "r") as f:
            history = json.load(f)
            if isinstance(history, list) and len(history) > 0:
                return history[-1]
    except (json.JSONDecodeError, IOError):
        pass

    return None
