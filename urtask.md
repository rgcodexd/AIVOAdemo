# Setup Instructions for AIVOA Deviation Intake Module

Please follow these steps to manually set up the backend environment and start the application.

## Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- A Groq API Key
- A MySQL database instance

## Step 1: Detailed MySQL Database Setup

If you don't have MySQL installed yet, you can set it up in one of two ways:

**Option A: Local Installation (Windows/Mac)**
1. Download the MySQL Community Server from the [official website](https://dev.mysql.com/downloads/mysql/).
2. Run the installer and follow the setup wizard. Remember the **root password** you set during installation.
3. Once installed, open your command prompt or terminal and log in to MySQL:
   ```bash
   mysql -u root -p
   ```
4. Enter the password you chose during setup.
5. In the MySQL shell, create the database by running:
   ```sql
   CREATE DATABASE aivoa_deviations;
   ```
6. Type `exit` to leave the MySQL shell.

**Option B: Using Docker (Fastest if you have Docker Desktop)**
Run this command in your terminal to start a MySQL container:
```bash
docker run --name aivoa-mysql -e MYSQL_ROOT_PASSWORD=my_strong_password -e MYSQL_DATABASE=aivoa_deviations -p 3306:3306 -d mysql:latest
```

**Your Connection String**
Based on how you set it up, your connection string will look like this:
- If using local installation (Option A): `mysql+pymysql://root:YOUR_PASSWORD_HERE@localhost:3306/aivoa_deviations`
- If using Docker (Option B): `mysql+pymysql://root:my_strong_password@localhost:3306/aivoa_deviations`

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
1. Open a new terminal or PowerShell window.
2. Navigate to the backend folder by running this command:
   ```
   cd d:\Project\AIVOAdemo\backend
   ```
3. Activate the virtual environment by running:
   ```
   .\venv\Scripts\activate
   ```
4. Install the required packages by running:
   ```
   pip install -r requirements.txt
   ```
5. Finally, start the backend server by running:
   ```
   uvicorn main:app --reload
   ```
The backend API will be available at http://localhost:8000

## Step 4: Run the Frontend
1. Open another new terminal or PowerShell window.
2. Navigate to the frontend folder by running this command:
   ```
   cd d:\Project\AIVOAdemo\frontend
   ```
3. Start the React app by running:
   ```
   npm run dev
   ```
The React frontend will be available at http://localhost:5173

## Step 5: Test the Workflow
1. Navigate to the frontend URL.
2. Type or paste a deviation report into the AI Assistant panel.
3. Click send.
4. The form will be auto-populated and an initial impact/severity will be suggested.
5. Review the information and click "Save Deviation" to persist it in your database.
