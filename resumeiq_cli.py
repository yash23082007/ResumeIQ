#!/usr/bin/env python
"""
ResumeIQ CLI Entrypoint
Run from workspace root:
  python resumeiq_cli.py sample_resume.txt
  python resumeiq_cli.py sample_resume.txt --roast
  python resumeiq_cli.py sample_resume.txt --fail-under 80
"""
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app.cli import run_cli

if __name__ == "__main__":
    run_cli()
