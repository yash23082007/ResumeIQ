"""
ResumeIQ — Standalone Developer CLI
Run enterprise-grade resume scoring, ATS compatibility simulation, and AI roast directly from your terminal or CI/CD pipelines.

Usage:
  python -m backend.app.cli resume.pdf
  python -m backend.app.cli resume.pdf --fail-under 80
  python -m backend.app.cli resume.pdf --roast
  python -m backend.app.cli resume.pdf --jd job_desc.txt --json
"""

import os
import sys
import argparse
import json
import asyncio
from typing import Dict, Any

# Ensure UTF-8 output on Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from .services.parsing.parser import parse_resume_file
from .services.scoring.score_engine import calculate_resume_score
from .services.analysis.ats_checker import check_ats_compatibility, simulate_ats
from .services.ml.star_rewriter import suggest_rewrites
from .services.ml.roast_engine import stream_resume_roast
from .services.analysis.pow_verifier import verify_proof_of_work

# ANSI Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"


def print_banner():
    banner = f"""
{CYAN}{BOLD}======================================================================
  ____                                _____ ____  
 |  _ \\ ___  ___ _   _ _ __ ___   ___|_   _/ __ \\ 
 | |_) / _ \\/ __| | | | '_ ` _ \\ / _ \\ | || |  | |
 |  _ <  __/\\__ \\ |_| | | | | | |  __/ | || |__| |
 |_| \\_\\___||___/\\__,_|_| |_| |_|\\___| |_| \\___\\_\\
  Autonomous Resume Diagnostics & ATS Simulation Engine (CLI)
======================================================================{RESET}
"""
    print(banner)


def format_score_badge(score: float) -> str:
    s = round(score, 1)
    if s >= 80:
        return f"{GREEN}{BOLD}[ {s}/100 - HIGH PASS ]{RESET}"
    elif s >= 65:
        return f"{YELLOW}{BOLD}[ {s}/100 - MODERATE / NEEDS WORK ]{RESET}"
    else:
        return f"{RED}{BOLD}[ {s}/100 - ATS AT-RISK ]{RESET}"


def run_cli():
    parser = argparse.ArgumentParser(
        prog="resumeiq",
        description="ResumeIQ CLI: Diagnostic resume auditing, ATS validation, and STAR rewrites in your terminal."
    )
    parser.add_argument("file", help="Path to resume file (.pdf, .docx, or .txt)")
    parser.add_argument("--jd", help="Path to target Job Description (.txt) for role-matching", default=None)
    parser.add_argument("--fail-under", type=float, help="Fail with exit code 1 if score is below this threshold (for CI/CD)", default=0.0)
    parser.add_argument("--json", action="store_true", help="Output machine-readable JSON")
    parser.add_argument("--roast", action="store_true", help="Run AI Recruiter Roast engine")
    parser.add_argument("--verify-pow", action="store_true", help="Check public developer proof-of-work (GitHub/Codeforces)")

    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"{RED}Error: File not found: {args.file}{RESET}", file=sys.stderr)
        sys.exit(2)

    try:
        parsed = parse_resume_file(args.file, os.path.basename(args.file))
    except Exception as exc:
        print(f"{RED}Failed to parse resume: {exc}{RESET}", file=sys.stderr)
        sys.exit(2)

    raw_text = parsed.get("rawText", "")
    parsed_json = parsed.get("structured", {})

    jd_text = None
    if args.jd:
        if os.path.exists(args.jd):
            with open(args.jd, "r", encoding="utf-8", errors="ignore") as f:
                jd_text = f.read()
        else:
            print(f"{YELLOW}Warning: JD file not found: {args.jd}{RESET}", file=sys.stderr)

    # Calculate scores & diagnostics
    score_data = calculate_resume_score(raw_text, parsed_json, jd_text)
    ats_sim = simulate_ats(parsed_json)
    pow_data = verify_proof_of_work(raw_text) if args.verify_pow else None

    # Handle JSON output
    if args.json:
        payload = {
            "file": args.file,
            "overallScore": score_data["overallScore"],
            "subScores": score_data["subScores"],
            "atsSimulation": ats_sim,
            "findings": score_data["findings"],
        }
        if pow_data:
            payload["proofOfWork"] = pow_data
        print(json.dumps(payload, indent=2))
        if args.fail_under > 0 and score_data["overallScore"] < args.fail_under:
            sys.exit(1)
        sys.exit(0)

    # Print Terminal UI
    print_banner()
    print(f"File: {BOLD}{os.path.abspath(args.file)}{RESET}")
    print(f"Words: {parsed_json.get('wordCount', 0)} | Sections: {len(parsed_json.get('sections', {}))}")
    print("-" * 70)
    print(f"Overall Composite Score: {format_score_badge(score_data['overallScore'])}\n")

    print(f"{BOLD}Sub-Score Breakdown:{RESET}")
    subs = score_data.get("subScores", {})
    print(f"  • Content Impact (30%):        {subs.get('content_impact', 0):.1f}%")
    print(f"  • ATS Compatibility (25%):     {subs.get('ats_compatibility', 0):.1f}%")
    if subs.get('keyword_relevance') is not None:
        print(f"  • Role / Keyword Match (20%):  {subs.get('keyword_relevance', 0):.1f}%")
    else:
        print(f"  • Role / Keyword Match (20%):  N/A (No target JD provided)")
    print(f"  • Readability & Scannability:  {subs.get('readability', 0):.1f}%")
    print(f"  • Structural Formatting:       {subs.get('formatting', 0):.1f}%")

    print(f"\n{BOLD}ATS Platform Simulation Matrix:{RESET}")
    for engine in ats_sim.get("results", []):
        status_tag = f"{GREEN}✓ PASS{RESET}" if engine["parsedCorrectly"] else f"{RED}✗ RISK{RESET}"
        print(f"  [{status_tag}] {engine['ats']} ({engine['type']})")
        for issue in engine.get("issues", []):
            print(f"       {YELLOW}↳ {issue}{RESET}")

    # STAR Rewrites
    rewrites = score_data.get("findings", {}).get("rewrites", [])
    if rewrites:
        print(f"\n{BOLD}Top STAR Rewrite Opportunities ({len(rewrites)} identified):{RESET}")
        for idx, rw in enumerate(rewrites[:3], start=1):
            orig = rw.get('original', '')
            proposed = rw.get('proposedText') or rw.get('rewritten') or rw.get('improved') or ''
            print(f"  {idx}. {RED}{orig}{RESET}")
            if proposed:
                print(f"     {GREEN}→ {proposed}{RESET}")
            if rw.get('explanation'):
                print(f"     {CYAN}💡 {rw.get('explanation')}{RESET}")

    if pow_data:
        print(f"\n{BOLD}Proof-of-Work Verification:{RESET}")
        print(f"  Trust Score: {pow_data['trustScore']}/100 ({pow_data['summary']})")
        for prof in pow_data.get("profiles", []):
            badge = prof.get("badge") or "Linked"
            print(f"  • [{prof['platform']}] @{prof['handle']} → {GREEN}{badge}{RESET} ({prof.get('url')})")

    # Roast option
    if args.roast:
        print(f"\n{MAGENTA}{BOLD}==================== AI RECRUITER ROAST ===================={RESET}")
        async def _do_roast():
            async for chunk in stream_resume_roast(raw_text):
                if chunk.startswith("data: "):
                    raw_data = chunk[6:].strip()
                    if raw_data == "[DONE]":
                        break
                    try:
                        obj = json.loads(raw_data)
                        sys.stdout.write(obj.get("chunk", ""))
                        sys.stdout.flush()
                    except Exception:
                        pass
        asyncio.run(_do_roast())
        print(f"\n{MAGENTA}{BOLD}============================================================{RESET}\n")

    print("-" * 70)
    if args.fail_under > 0:
        if score_data["overallScore"] < args.fail_under:
            print(f"{RED}{BOLD}FAIL: Score {score_data['overallScore']:.1f} is below threshold {args.fail_under}.{RESET}")
            sys.exit(1)
        else:
            print(f"{GREEN}{BOLD}PASS: Score {score_data['overallScore']:.1f} meets threshold {args.fail_under}.{RESET}")

    sys.exit(0)


if __name__ == "__main__":
    run_cli()
