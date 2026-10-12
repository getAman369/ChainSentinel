"""Synthetic data generation for testing the ML model.

Generates labeled address-like datasets for testing inference,
evaluation, and adversarial robustness without real blockchain data.
"""
import numpy as np
import json
import os
import argparse

np.random.seed(42)


def generate_address_like_id(index: int) -> str:
    """Generate a deterministic pseudo-address for test tracking."""
    return f"0x{index:040x}"


def generate_synthetic_sample(risk_level: int = None) -> dict:
    """Generate a single synthetic sample.

    Args:
        risk_level: If None, randomly sampled. Otherwise forces the label.

    Returns:
        Dictionary of raw (pre-feature-engineering) features.
    """
    if risk_level is None:
        risk_level = np.random.randint(1, 6)

    if risk_level == 1:
        tx_count = np.random.randint(1, 20)
        counterparties = np.random.randint(1, 10)
        avg_value = np.random.uniform(0, 0.1)
        max_value = np.random.uniform(0, 0.5)
        contracts = np.random.randint(0, 3)
        days = np.random.randint(1, 365)
        mixing = np.random.uniform(0, 0.1)
    elif risk_level == 2:
        tx_count = np.random.randint(10, 50)
        counterparties = np.random.randint(5, 30)
        avg_value = np.random.uniform(0.1, 1)
        max_value = np.random.uniform(0.5, 5)
        contracts = np.random.randint(0, 10)
        days = np.random.randint(30, 730)
        mixing = np.random.uniform(0, 0.3)
    elif risk_level == 3:
        tx_count = np.random.randint(30, 100)
        counterparties = np.random.randint(20, 100)
        avg_value = np.random.uniform(1, 10)
        max_value = np.random.uniform(5, 50)
        contracts = np.random.randint(5, 30)
        days = np.random.randint(90, 1095)
        mixing = np.random.uniform(0.1, 0.6)
    elif risk_level == 4:
        tx_count = np.random.randint(80, 300)
        counterparties = np.random.randint(80, 500)
        avg_value = np.random.uniform(10, 100)
        max_value = np.random.uniform(50, 500)
        contracts = np.random.randint(20, 100)
        days = np.random.randint(180, 1825)
        mixing = np.random.uniform(0.4, 0.9)
    else:
        tx_count = np.random.randint(200, 1000)
        counterparties = np.random.randint(300, 2000)
        avg_value = np.random.uniform(50, 1000)
        max_value = np.random.uniform(500, 10000)
        contracts = np.random.randint(50, 500)
        days = np.random.randint(365, 3650)
        mixing = np.random.uniform(0.7, 1.0)

    return {
        "address": generate_address_like_id(risk_level * 10000 + np.random.randint(0, 999)),
        "tx_count": tx_count,
        "counterparties": counterparties,
        "avg_value": avg_value,
        "max_value": max_value,
        "contracts": contracts,
        "days_active": days,
        "mixing_score": mixing,
        "risk_level": risk_level,
    }


def generate_dataset(n_samples: int = 100, output_file: str = None) -> list:
    """Generate a full synthetic dataset.

    Args:
        n_samples: Number of samples to generate.
        output_file: If provided, write the dataset to this JSON file.

    Returns:
        List of sample dictionaries.
    """
    samples = []
    for i in range(n_samples):
        risk_level = np.random.randint(1, 6)
        sample = generate_synthetic_sample(risk_level)
        sample["sample_id"] = i
        samples.append(sample)

    if output_file:
        os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)
        with open(output_file, "w") as f:
            json.dump(samples, f, indent=2)
        print(f"Dataset of {len(samples)} samples saved to {output_file}")

    return samples


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic test data")
    parser.add_argument("--samples", type=int, default=100, help="Number of samples")
    parser.add_argument("--output", type=str, default="ml/test_data/synthetic_samples.json")
    args = parser.parse_args()

    generate_dataset(args.samples, args.output)
