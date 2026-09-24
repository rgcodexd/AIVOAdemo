# AIVOA - AI-Powered Deviation Intake Module
## Project Presentation & Interview Guide

---

## 1. Project Overview
**Objective:** Build a working Deviation Management workflow for an API pharmaceutical manufacturer where an AI assistant automatically extracts information from text and documents to populate a structured form.

**Core Workflow:** 
Deviation Document/Text Upload ➔ AI Extraction ➔ Log Deviation Form Auto-Population ➔ AI Impact & Severity Assistance ➔ User Review ➔ Save to Database.

**Technology Stack:**
* **Frontend:** React, Redux Toolkit, Lucide React (Icons), Framer Motion (Animations), Axios.
* **Backend:** FastAPI, Python, SQLAlchemy, PyPDF2.
* **Database:** MySQL (using `mysql+pymysql`).
* **AI Engine:** LangChain, LangGraph, Groq API (Qwen model).

---

## 2. Architecture & Implementation Details

* **Frontend State Management:** Redux is used to maintain the `DeviationFormState`. This allows for "Contextual Editing". When the user asks the AI to modify something, the current form state is sent alongside the request, ensuring the AI only updates specific fields without overwriting existing data.
* **AI Extraction (Structured Output):** The backend uses `ChatGroq` with `with_structured_output` to enforce the LLM to return data exactly matching a predefined Pydantic schema (`DeviationData`). This prevents formatting errors.
* **File Upload Pipeline:** The FastAPI `/api/upload-document` endpoint handles multipart file uploads. It uses `PyPDF2` to read the PDF in-memory, extract the raw text, and feed it into the LangGraph extraction pipeline.

---

## 3. Challenges, Errors Faced & Resolutions

During development, we encountered and resolved several complex technical challenges:

### Issue 1: Database Connection String & Password Encoding
* **Error:** `Access denied for user 'root'@'localhost' (using password: YES)`
* **Cause:** Initially, the password contained special characters (`@`, `#`) which broke the connection URL parsing. Later, when attempting a passwordless connection, the URL was formatted as `root:@localhost`. The colon `:` told SQLAlchemy to send an empty string as a password, which MySQL rejected because it expected absolutely no password.
* **Resolution:** URL-encoded the special characters (e.g., `#` to `%23`), and ultimately removed the colon (`root@localhost`) to correctly instruct the driver to connect completely without a password.

### Issue 2: Groq API Model Deprecations
* **Error:** `groq.NotFoundError / groq.BadRequestError: Model decommissioned`
* **Cause:** The originally planned models (`gemma2-9b-it`, `llama-3.1-70b-versatile`) were recently decommissioned by Groq or were unavailable on the specific API key provided.
* **Resolution:** Created a custom Python script to query the Groq `/models` endpoint using the provided API key. This allowed us to dynamically discover which models were active on the account.

### Issue 3: LLM Structured Output Failure
* **Error:** `Tool call validation failed: attempted to call tool 'json'`
* **Cause:** The first fallback model we tried (`gpt-oss-120b`) did not natively support LangChain's structured tool-calling functionality. It hallucinated a tool call instead of returning formatted JSON.
* **Resolution:** Switched the LLM to `qwen/qwen3.8-27b`, which fully supports structured output and LangChain tool-calling, successfully returning perfectly formatted JSON that maps directly to the Pydantic schema.

---

## 4. Potential Interview Questions & Answers

**Q1: Why did you choose FastAPI over Flask or Django?**
> **Answer:** FastAPI is extremely fast, asynchronous by default, and automatically generates OpenAPI (Swagger) documentation. Its native integration with Pydantic makes validating the AI's structured output seamless and type-safe.

**Q2: How does the AI know not to overwrite data the user has already typed into the form?**
> **Answer:** We implemented "Contextual Editing". The React frontend sends the `current_state` of the form to the backend along with the user's prompt. The LangChain prompt explicitly instructs the LLM to preserve existing values unless the user's new prompt specifically corrects them.

**Q3: How do you ensure the AI returns data that matches your frontend form fields?**
> **Answer:** We use LangChain's `with_structured_output()` combined with a Pydantic schema. This forces the LLM to output a strictly formatted JSON object rather than freeform text, preventing frontend parsing errors and ensuring fields like `initialImpact` strictly contain expected values.

**Q4: How did you handle PDF extraction?**
> **Answer:** We created an `/api/upload-document` endpoint using FastAPI's `UploadFile`. It reads the uploaded file stream in-memory, uses `PyPDF2` to iterate through the pages to extract raw text, and then passes that text to our LangGraph extraction chain.

**Q5: What happens if the database goes down or the AI API fails?**
> **Answer:** We implemented `try/except` blocks in the FastAPI endpoints. If an error occurs, the backend catches it and returns a `500 Internal Server Error` with a descriptive message. The frontend Axios catch-block receives this and gracefully updates the Redux state to show a friendly error message in the AI chat panel, ensuring the app doesn't crash.

**Q6: Why did you use Redux for state management instead of just React state?**
> **Answer:** Because the form state needs to be accessible across multiple deeply nested components (the Form Panel on the left and the AI Assistant Panel on the right). Redux provides a centralized store, making it trivial for the AI panel to trigger updates (`dispatch(updateMultipleFields)`) that immediately reflect on the form panel.
