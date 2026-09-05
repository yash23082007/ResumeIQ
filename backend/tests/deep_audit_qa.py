"""
Deep QA Audit Script — Testing ResumeIQ Local ML Engines
Simulates "wild" data from Reddit (e.g. r/resumes) and messy internet sources.
"""

import sys
import json
import logging
from pprint import pprint

# Set up paths so we can import from backend
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.parsing.section_extractor import extract_sections
from app.services.ml.tailor_engine import generate_tailored_resume
from app.services.ml.semantic_matcher import semantic_match_score
from app.services.analysis.readability import analyze_readability
from app.services.analysis.bias_detector import detect_bias

logging.basicConfig(level=logging.INFO, format="[QA AUDIT] %(levelname)s: %(message)s")

# Dataset: Simulating extremely messy resumes sourced from internet/reddit
MESSY_RESUME_DATASET = [
    {
        "id": "reddit_case_1",
        "description": "No clear headers, terrible formatting, lots of typos.",
        "text": """
john doe
call me at 555-1234 or email john.d@gmail.com
i have worked at google as a swe for 2 yrs doing java and python.
my skills include python, java, sql, and html. i also know how to use git.
education: i went to MIT and got a BS in computer science. graduated 2020.
"""
    },
    {
        "id": "internet_case_2",
        "description": "Massive wall of text with weird bullet characters.",
        "text": """
JANE SMITH | Software Architect | JS@example.com
* Experience *
>>> Amazon (2018-2022)
---> Built microservices using Node.js and AWS DynamoDB.
---> Managed a team of 5 engineers.
* Education *
>>> Stanford University, MS CS.
* Technical Skills *
AWS, Node.js, React, DynamoDB, Leadership, Agile.
"""
    },
    {
        "id": "reddit_case_3",
        "description": "Includes biased language and personal info.",
        "text": """
Robert Johnson
DOB: 12/04/1985 | Marital Status: Married
Young and energetic developer looking for a fast-paced environment.
Experience:
Software Engineer at StartupX.
We were a brotherhood of coders working on a killer app in React.
"""
    }
]

TARGET_JD = """
Senior Backend Engineer
Requirements:
- 3+ years of Python and Java experience.
- Strong knowledge of AWS, DynamoDB, and Node.js.
- Experience with microservices architecture and Agile methodologies.
"""

def run_deep_qa():
    logging.info("Starting Deep QA Audit on Local ML Pipeline...")
    
    passed = 0
    failed = 0
    
    for case in MESSY_RESUME_DATASET:
        logging.info(f"--- Testing Case: {case['id']} ({case['description']}) ---")
        try:
            # 1. Test Parser robustness
            sections = extract_sections(case["text"])
            if not sections:
                raise ValueError("Parser failed to extract any sections.")
            
            # 2. Test Tailoring Engine
            parsed_json = {"sections": sections}
            tailor_res = generate_tailored_resume(case["text"], TARGET_JD, parsed_json)
            if "summary" not in tailor_res:
                raise ValueError("Tailor engine failed to generate summary.")
            
            # 3. Test Semantic Matcher
            match_res = semantic_match_score(case["text"], TARGET_JD)
            if "score" not in match_res:
                raise ValueError("Semantic matcher failed.")
                
            # 4. Test Readability
            read_res = analyze_readability(case["text"])
            
            # 5. Test Bias Detector
            bias_res = detect_bias(case["text"])
            
            logging.info(f"✓ Case {case['id']} passed successfully.")
            logging.info(f"  -> Extracted sections: {list(sections.keys())}")
            logging.info(f"  -> ATS Match Score: {match_res['score']}")
            logging.info(f"  -> Bias Score: {bias_res['score']}")
            passed += 1
        except Exception as e:
            logging.error(f"❌ Case {case['id']} failed: {str(e)}")
            failed += 1
            
    logging.info("==================================================")
    logging.info(f"QA Audit Complete. Passed: {passed}, Failed: {failed}")
    if failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    run_deep_qa()
