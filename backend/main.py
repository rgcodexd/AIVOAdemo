from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Deviation
import models
import schemas
from agent import run_extraction
import uvicorn

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIVOA Deviation API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AIVOA Backend is running"}

@app.post("/api/extract-deviation", response_model=schemas.ExtractionResponse)
def extract_deviation(request: schemas.ExtractionRequest):
    try:
        extracted = run_extraction(request.text, request.current_state)
        return {"extracted_data": extracted}
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

from fastapi import UploadFile, File
import PyPDF2
import io

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    text = ""
    if file.filename.endswith(".pdf"):
        content = await file.read()
        pdf = PyPDF2.PdfReader(io.BytesIO(content))
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    else:
        # Default to reading as text for other supported types (.txt)
        content = await file.read()
        text = content.decode('utf-8', errors='ignore')
        
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from document.")
        
    try:
        extracted = run_extraction(f"Document content:\n{text}")
        return {"extracted_data": extracted, "extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

@app.post("/api/save-deviation")
def save_deviation(deviation: schemas.DeviationCreate, db: Session = Depends(get_db)):
    db_deviation = models.Deviation(**deviation.model_dump())
    db.add(db_deviation)
    db.commit()
    db.refresh(db_deviation)
    return {"status": "success", "id": db_deviation.id}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
