# AI Assistant (Flask + Gemini)

A simple AI chat web app built with **Flask** (backend) and a small **vanilla JS UI** (frontend). It uses the **Google Gemini** API to generate responses and keeps per-session chat history in memory.

## Features
- Web UI chat interface
- **Session-based chat history** (per `session_id`)
- Clear chat button to reset conversation history
- Calls Gemini model: **`gemini-2.5-flash`**

## Tech Stack
- Backend: Flask
- AI: `google-generativeai` (Gemini)
- Environment variables: `python-dotenv`
- Frontend: HTML templates + `static/script.js` + `static/style.css`

## Project Structure
- `app.py` — Flask server + API endpoints
- `templates/index.html` — UI page
- `static/script.js` — client logic (send/reset chat)
- `static/style.css` — styling
- `requirements.txt` — dependencies
- `.env` — local secrets (not included)

## Setup

### 1) Create a virtual environment (recommended)
```bash
python -m venv venv
```

### 2) Install dependencies
```bash
pip install -r requirements.txt
```

### 3) Configure environment variables
Create a `.env` file in the project root with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4) Run the server
```bash
python app.py
```

- The app runs on: `http://localhost:5000`

## How to Use
1. Open `http://localhost:5000`
2. Type a message and click **Send** (or press **Enter**)
3. The UI sends the message to the backend and displays the Gemini response
4. Click **Clear Chat** to reset session history

## API Endpoints (Backend)

### `POST /api/chat`
Send a chat message to Gemini.

**Request body (JSON):**
```json
{
  "message": "Hello!",
  "session_id": "session_abc123"
}
```

**Responses:**
- Success:
```json
{ "text": "AI response..." }
```
- Error:
```json
{ "error": "error details" }
```

**Notes:**
- If `session_id` is new, the server initializes a new in-memory chat session.

### `POST /api/reset`
Clear chat history for the given session.

**Request body (JSON):**
```json
{ "session_id": "session_abc123" }
```

**Response:**
```json
{ "status": "ok" }
```

## Important Notes / Limitations
- Chat history is stored **in server memory** (`chat_sessions` dict).  
  Restarting the server will clear all sessions.
- This demo does not implement authentication or persistence.

## Dependencies
See `requirements.txt`:
- `flask`
- `google-generativeai`
- `python-dotenv`
