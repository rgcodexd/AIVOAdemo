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

# Enable CORS - Fixed Security Vulnerability (No longer using wildcard '*')
# Restrict this to exactly where the frontend is hosted.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000", # Common alternative
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"], # Restrict allowed methods
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
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Security: Do not leak internal stack traces or exact exceptions to the client
        print(f"Internal Server Error during extraction: {e}")
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred during text extraction.")

from fastapi import UploadFile, File
import PyPDF2
import io

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    # Security: Enforce a strict 10MB file size limit to prevent Denial of Service (DoS/OOM)
    MAX_FILE_SIZE = 10 * 1024 * 1024 # 10 MB
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")

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
        # Security: Prevent data leakage of API keys or stack traces
        print(f"Internal Server Error during document extraction: {e}")
        raise HTTPException(status_code=500, detail="An unexpected internal error occurred during document extraction.")

@app.post("/api/save-deviation")
def save_deviation(deviation: schemas.DeviationCreate, db: Session = Depends(get_db)):
    db_deviation = models.Deviation(**deviation.model_dump())
    db.add(db_deviation)
    db.commit()
    db.refresh(db_deviation)
    return {"status": "success", "id": db_deviation.id}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
