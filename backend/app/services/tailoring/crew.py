import os
import json
from pydantic import BaseModel, Field
from typing import List
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI
from ...config import settings

# Define the expected output format using Pydantic
class InterviewQuestion(BaseModel):
    question: str = Field(description="The interview question")
    context: str = Field(description="Why this question is relevant based on the JD and Resume")
    suggested_approach: str = Field(description="How the candidate should approach answering this")

class TailorResult(BaseModel):
    tailored_resume: str = Field(description="The updated resume content with tailored bullets (Markdown format)")
    cover_letter: str = Field(description="The generated customized cover letter (Markdown format)")
    ats_score: int = Field(description="The ATS match score from 0 to 100")
    ats_feedback: str = Field(description="Feedback on why this score was given and what is missing")
    interview_questions: List[InterviewQuestion] = Field(description="A list of 3-5 interview prep questions")

def run_tailoring_pipeline(resume_text: str, jd_text: str) -> dict:
    # Initialize the LLM (Gemini Flash)
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=os.environ.get("GEMINI_API_KEY", settings.OPENAI_API_KEY) # Fallback if user set OPENAI_API_KEY in place of GEMINI
    )

    # 1. JD Parser Agent
    jd_parser = Agent(
        role='Senior Technical Recruiter',
        goal='Extract the core requirements, skills, and tone from the job description.',
        backstory='An expert recruiter who knows exactly what hiring managers are looking for and how ATS systems filter candidates.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # 2. Resume Rewriter Agent
    resume_rewriter = Agent(
        role='Expert Resume Writer',
        goal='Adapt the candidate\'s resume to highlight relevant experience for the job description without inventing any new experience.',
        backstory='A certified professional resume writer who excels at framing existing experience in the exact language of the job description.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # 3. ATS Scorer Agent
    ats_scorer = Agent(
        role='ATS System Simulator',
        goal='Evaluate the tailored resume against the job description and provide a strict match score (0-100).',
        backstory='A ruthless, objective algorithm designed to parse keywords, context, and semantics to score candidate fit.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # 4. Interview Quizzer Agent
    interview_quizzer = Agent(
        role='Hiring Manager',
        goal='Generate challenging and relevant interview questions based on the candidate\'s resume and the job\'s requirements.',
        backstory='A seasoned engineering leader who conducts rigorous interviews to validate experience and assess cultural/technical fit.',
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # Define tasks
    parse_jd_task = Task(
        description=f'Analyze the following job description and extract the most critical hard skills, soft skills, and experiences required.\n\nJob Description:\n{jd_text}',
        expected_output='A structured summary of the 5-7 most critical requirements for the role.',
        agent=jd_parser
    )

    rewrite_resume_task = Task(
        description=f'Using the extracted job requirements, rewrite the following resume to better align with the role. Do not invent any new experience. Focus on rephrasing existing bullet points to match the JD\'s keywords and tone.\n\nOriginal Resume:\n{resume_text}',
        expected_output='A tailored version of the resume in Markdown format.',
        agent=resume_rewriter,
        context=[parse_jd_task]
    )
    
    generate_cover_letter_task = Task(
        description='Based on the original resume and the job description requirements, write a compelling, concise cover letter (max 300 words). The tone should be professional and enthusiastic.',
        expected_output='A personalized cover letter in Markdown format.',
        agent=resume_rewriter,
        context=[parse_jd_task]
    )

    score_resume_task = Task(
        description='Compare the tailored resume against the extracted job requirements. Provide a final ATS match score between 0 and 100, and a brief paragraph of feedback explaining the score.',
        expected_output='An integer score and a brief feedback string.',
        agent=ats_scorer,
        context=[parse_jd_task, rewrite_resume_task]
    )

    generate_questions_task = Task(
        description='Based on the tailored resume and job description, generate 3-5 specific interview questions that the candidate is likely to be asked. For each question, explain why it is relevant and how they should answer it.',
        expected_output='A list of 3-5 interview questions with context and suggested approaches.',
        agent=interview_quizzer,
        context=[parse_jd_task, rewrite_resume_task]
    )

    # Compile the final result task
    # We use a simple JSON aggregator task to force the output into the Pydantic schema
    compile_results_task = Task(
        description='Compile the results from the previous tasks into a strict JSON format matching the TailorResult schema.',
        expected_output='A JSON object containing tailored_resume, cover_letter, ats_score, ats_feedback, and interview_questions.',
        agent=resume_rewriter,
        context=[rewrite_resume_task, generate_cover_letter_task, score_resume_task, generate_questions_task],
        output_json=TailorResult
    )

    crew = Crew(
        agents=[jd_parser, resume_rewriter, ats_scorer, interview_quizzer],
        tasks=[parse_jd_task, rewrite_resume_task, generate_cover_letter_task, score_resume_task, generate_questions_task, compile_results_task],
        process=Process.sequential,
        verbose=True
    )

    # Kickoff the process
    result = crew.kickoff()
    
    # result is a CrewOutput object, and we requested output_json=TailorResult on the last task
    # If the output_json parsing succeeded, it's available as a dictionary or we can parse it from the raw string.
    try:
        if hasattr(result, 'json_dict') and result.json_dict:
             return result.json_dict
        
        # Fallback parsing
        raw_str = result.raw
        if "```json" in raw_str:
            json_str = raw_str.split("```json")[1].split("```")[0].strip()
            return json.loads(json_str)
        return json.loads(raw_str)
    except Exception as e:
        print(f"Error parsing CrewAI output to JSON: {e}")
        # Return a safe fallback if parsing fails completely
        return {
            "tailored_resume": "Failed to generate tailored resume. " + str(result.raw),
            "cover_letter": "Failed to generate cover letter.",
            "ats_score": 0,
            "ats_feedback": "Error parsing output.",
            "interview_questions": []
        }
