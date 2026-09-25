import os
from typing import TypedDict, Any
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langgraph.graph import StateGraph, START, END
from schemas import DeviationData
from dotenv import load_dotenv

load_dotenv()

# We will use Groq model as requested
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if GROQ_API_KEY:
    llm = ChatGroq(model="qwen/qwen3.8-27b", temperature=0)
else:
    # Fallback to None, will fail at runtime if key isn't provided
    llm = None

class ExtractionState(TypedDict):
    input_text: str
    current_state: dict | None
    extracted_data: dict

def extract_information(state: ExtractionState):
    if not llm:
        raise ValueError("GROQ_API_KEY is missing. Cannot perform AI extraction.")
    
    # We use LLM with structured output
    structured_llm = llm.with_structured_output(DeviationData)
    
    prompt = """
    You are an intelligent AI form builder for a quality management and HR system.
    Your task is to analyze the following document/note and dynamically build a form to capture all the critical information inside it.
    
    Rules:
    - If a 'Current Form State' is provided, you must PRESERVE all its existing information UNLESS the 'New Text / Request' explicitly changes or corrects it.
    - Generate a descriptive `formTitle` (e.g., 'Log Customer Complaint', 'Log Deviation') and `formDescription` (e.g., 'API & FDF Quality Assurance Module') based on the content.
    - Build a list of `fields` to capture all the important entities, dates, locations, and descriptions found in the text.
    - For each field, assign a `section` to group them logically (e.g., '1. ORIGIN & CUSTOMER DETAILS', '2. PRODUCT & BATCH IDENTIFICATION', '3. FACILITY & MATERIAL IMPACT', '4. DEFECT ANALYSIS').
    - For each field, provide a camelCase `id`, a human-readable `label`, the extracted `value`, and the `type` ('text', 'textarea', or 'date').
    - Evaluate `severity` (Critical, Major, Minor).
    - Provide a `suggestedNextAction` (e.g., 'Route to QA Investigation & Issue Replacement').
    - Provide an `aiExplanation` (Initial Risk Assessment detailing the potential root cause and risks).
    
    Current Form State (JSON):
    {current_state}
    
    New Text / Request to analyze:
    {input_text}
    """
    
    prompt_template = PromptTemplate(template=prompt, input_variables=["input_text", "current_state"])
    
    chain = prompt_template | structured_llm
    
    current_state_str = str(state.get("current_state") or {})
    result = chain.invoke({"input_text": state["input_text"], "current_state": current_state_str})
    
    return {"extracted_data": result.dict()}

def build_graph():
    builder = StateGraph(ExtractionState)
    builder.add_node("extract", extract_information)
    builder.add_edge(START, "extract")
    builder.add_edge("extract", END)
    return builder.compile()

extraction_graph = build_graph()

def run_extraction(text: str, current_state: dict = None) -> dict:
    result = extraction_graph.invoke({"input_text": text, "current_state": current_state})
    return result.get("extracted_data", {})
