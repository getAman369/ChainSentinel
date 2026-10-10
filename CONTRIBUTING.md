# Contributing to ChainSentinel

Thanks for your interest in contributing! This document outlines the process for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ChainSentinel.git`
3. Create a feature branch: `git checkout -b feature/my-feature`
4. Install dependencies: `npm install` and `pip install -r ml/requirements.txt`

## Development Setup

```bash
# Install dependencies
npm install
pip install -r ml/requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your configuration

# Train the ML model
python ml/train_model.py

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

## Coding Standards

- Use TypeScript for all Node.js code
- Use Solidity 0.8.17 for smart contracts
- Follow the existing code style
- Add comments for complex logic
- Write tests for new features

## Pull Request Process

1. Update the README.md with details of changes
2. Add your issue to the PR description (if applicable)
3. Ensure all tests pass
4. Request review from maintainers

## Issues

- Use the issue templates provided
- Include steps to reproduce
- Provide environment details

## License

By contributing, you agree that your contributions will be licensed under the MIT License.