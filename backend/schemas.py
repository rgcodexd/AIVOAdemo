from pydantic import BaseModel, Field
from typing import Optional

class ExtractionRequest(BaseModel):
    text: str

class DeviationData(BaseModel):
    site: Optional[str] = Field(default="", description="The manufacturing site or plant where the deviation occurred (e.g. API Manufacturing Unit, Formulation Unit).")
    dateOfOccurrence: Optional[str] = Field(default="", description="Date of occurrence in YYYY-MM-DD format if possible, or exact string.")
    title: Optional[str] = Field(default="", description="A short, descriptive title for the deviation.")
    source: Optional[str] = Field(default="", description="Source of the deviation (Manufacturing, Quality Control (QC), Engineering / Maintenance, Warehouse).")
    relatedProduct: Optional[str] = Field(default="", description="The name of the related product or material.")
    batchNumber: Optional[str] = Field(default="", description="Batch or lot number associated with the deviation.")
    description: Optional[str] = Field(default="", description="Detailed description of what happened, where, when, and how it was detected.")
    initialImpact: Optional[str] = Field(default="", description="Estimated initial impact: High, Medium, or Low.")
    initialSeverity: Optional[str] = Field(default="", description="Estimated initial severity: Critical, Major, or Minor.")
    aiExplanation: Optional[str] = Field(default="", description="A short 1-2 sentence explanation for the initialImpact and initialSeverity choices.")

class ExtractionResponse(BaseModel):
    extracted_data: DeviationData

class DeviationCreate(BaseModel):
    site: str
    dateOfOccurrence: str
    title: str
    source: str
    relatedProduct: str
    batchNumber: str
    description: str
    initialImpact: str
    initialSeverity: str
    aiExplanation: str
