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
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
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
    You are an AI assistant for a pharmaceutical manufacturing quality management system.
    Your task is to analyze the following deviation report/note and extract/update the required information into the structured format.
    
    Rules:
    - If a 'Current Form State' is provided, you must PRESERVE all its existing information UNLESS the 'New Text / Request' explicitly changes or corrects it.
    - If the 'New Text / Request' provides a correction (e.g. "sorry the batch number is X"), UPDATE only that specific field and retain everything else.
    - Determine 'site', 'dateOfOccurrence', 'source', 'relatedProduct', 'batchNumber', and 'title' from the text if available.
    - Write a 'description' summarizing the event.
    - Evaluate 'initialImpact' (High, Medium, Low) and 'initialSeverity' (Critical, Major, Minor).
    - Provide a short 1-2 sentence 'aiExplanation' justifying your impact and severity choice.
    - If a field is unknown and not in the current state, leave it empty.
    
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
