from pydantic import BaseModel, Field
from typing import Optional

class ExtractionRequest(BaseModel):
    text: str
    current_state: Optional[dict] = Field(default=None, description="The current state of the form to allow for contextual editing.")

class DynamicField(BaseModel):
    id: str = Field(description="Unique camelCase id for the field (e.g., employeeName, dateOfOccurrence)")
    label: str = Field(description="Human readable label for the field (e.g., 'Employee Name', 'Date of Occurrence')")
    value: str = Field(description="Extracted value for this field based on the document")
    type: str = Field(description="Type of input field: 'text', 'textarea', or 'date'")
    section: str = Field(description="The section this field belongs to (e.g., '1. ORIGIN & CUSTOMER DETAILS', '2. PRODUCT & BATCH IDENTIFICATION', '3. FACILITY & MATERIAL IMPACT', '4. DEFECT ANALYSIS')")

class DeviationData(BaseModel):
    formTitle: str = Field(description="The title of the form being generated based on the document (e.g., 'Log Customer Complaint', 'Log Deviation')")
    formDescription: str = Field(description="A short description of the form's purpose (e.g. 'API & FDF Quality Assurance Module')")
    fields: list[DynamicField] = Field(description="Dynamically generated form fields based on the document content. Group them logically into sections.")
    severity: str = Field(description="Estimated severity: Critical, Major, or Minor.")
    suggestedNextAction: str = Field(description="Suggested next action (e.g., 'Route to QA Investigation & Issue Replacement')")
    aiExplanation: str = Field(description="Initial Risk Assessment detailing the potential root cause and risks.")

class ExtractionResponse(BaseModel):
    extracted_data: DeviationData

class DeviationCreate(BaseModel):
    formTitle: str
    formDescription: str
    fields: list[dict]
    severity: str
    suggestedNextAction: str
    aiExplanation: str
