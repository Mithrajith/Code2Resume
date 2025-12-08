#!/bin/bash

# Configure uv to use 'env' directory
export UV_PROJECT_ENVIRONMENT=env

# Run the application using uv
# This will automatically create the venv and install dependencies if needed
uv run python -m backend.app
