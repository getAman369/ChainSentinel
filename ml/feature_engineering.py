"""Feature engineering for transaction patterns.

Adds derived features that capture behavioral patterns
beyond raw transaction counts.
"""
import numpy as np


def compute_features(raw_data: dict) -> dict:
    """Compute engineered features from raw address data.

    Args:
        raw_data: Dictionary with keys:
            tx_count, counterparties, avg_value, max_value,
            contracts, days_active, mixing_score

    Returns:
        Dictionary with original + engineered features:
            tx_frequency, counterparty_diversity,
            value_concentration, contract_ratio,
            risk_velocity, activity_growth_rate
    """
    tx_count = raw_data.get("tx_count", 0)
    counterparties = raw_data.get("counterparties", 0)
    avg_value = raw_data.get("avg_value", 0)
    max_value = raw_data.get("max_value", 0)
    contracts = raw_data.get("contracts", 0)
    days_active = raw_data.get("days_active", 1)
    mixing_score = raw_data.get("mixing_score", 0)

    if days_active <= 0:
        days_active = 1

    tx_frequency = tx_count / days_active

    counterparty_diversity = (
        counterparties / tx_count if tx_count > 0 else 0
    )

    value_concentration = (
        max_value / avg_value if avg_value > 0 else 0
    )

    contract_ratio = (
        contracts / tx_count if tx_count > 0 else 0
    )

    risk_velocity = mixing_score * (tx_count / 100)

    activity_growth_rate = (
        tx_count / max(days_active, 30) if days_active > 0 else 0
    )

    return {
        **raw_data,
        "tx_frequency": round(tx_frequency, 4),
        "counterparty_diversity": round(counterparty_diversity, 4),
        "value_concentration": round(value_concentration, 4),
        "contract_ratio": round(contract_ratio, 4),
        "risk_velocity": round(risk_velocity, 4),
        "activity_growth_rate": round(activity_growth_rate, 4),
    }


ENGINEERED_FEATURES = [
    "tx_frequency",
    "counterparty_diversity",
    "value_concentration",
    "contract_ratio",
    "risk_velocity",
    "activity_growth_rate",
]

ALL_FEATURES = [
    "tx_count",
    "counterparties",
    "avg_value",
    "max_value",
    "contracts",
    "days_active",
    "mixing_score",
    *ENGINEERED_FEATURES,
]
