# Setup Instructions for AIVOA Deviation Intake Module

Please follow these steps to manually set up the backend environment and start the application.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A Groq API Key
- A MySQL database instance

## Step 1: Database Setup
1. Create a database for this project, for example `aivoa_deviations`.
2. Make sure you have the correct connection string (e.g. `mysql+pymysql://user:password@localhost:3306/aivoa_deviations`).

## Step 2: Backend Configuration (.env)
1. In the `backend` folder, create a `.env` file based on the `.env.example` structure.
2. Add your `GROQ_API_KEY`.
3. Set your `DATABASE_URL` with your database connection string.

Example `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/aivoa_deviations
```

## Step 3: Run the Backend
Open a terminal in the `backend` folder and run:
```bash
# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies if not already installed
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload
```
The backend API will be available at http://localhost:8000

## Step 4: Run the Frontend
Open another terminal in the `frontend` folder and run:
```bash
npm run dev
```
The React frontend will be available at http://localhost:5173

## Step 5: Test the Workflow
1. Navigate to the frontend URL.
2. Type or paste a deviation report into the AI Assistant panel.
3. Click send.
4. The form will be auto-populated and an initial impact/severity will be suggested.
5. Review the information and click "Save Deviation" to persist it in your database.
