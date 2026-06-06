from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Initialize the Flask web application
app = Flask(__name__)

# Fetch the API key from environment variables
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("No API key found. Please make sure your .env file has GEMINI_API_KEY set.")

# Configure the Google Gemini API library with our API key
genai.configure(api_key=GEMINI_API_KEY)

# Set up the specific AI model we want to use (Gemini 2.5 Flash)
# We also provide a system instruction to dictate the AI's behavior
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction="You are a helpful AI assistant."
)

# A dictionary to store ongoing chat sessions in the server's memory
# This allows the AI to remember context for different users (identified by session_id)
chat_sessions = {}

# Define the route for the main homepage
@app.route("/")
def index():
    # Render and return the index.html template from the 'templates' folder
    return render_template("index.html")

# Define an API route for sending messages to the AI
@app.route("/api/chat", methods=["POST"])
def chat():
    # Parse the incoming JSON request data
    data = request.get_json()
    user_message = data.get("message", "")
    session_id = data.get("session_id", "default")

    # If the user didn't send a message, return an error
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # If this is a new session ID, initialize a new chat session with an empty history
    if session_id not in chat_sessions:
        chat_sessions[session_id] = model.start_chat(history=[])

    # Retrieve the chat session for this specific user
    chat_session = chat_sessions[session_id]

    try:
        # Send the user's message to the Gemini API and wait for the response
        response = chat_session.send_message(user_message)
        # Return the AI's response text as a JSON object
        return jsonify({"text": response.text})
    except Exception as e:
        # If anything goes wrong (e.g., API is down), return a 500 error with the exception details
        return jsonify({"error": str(e)}), 500

# Define an API route to clear the chat history
@app.route("/api/reset", methods=["POST"])
def reset():
    data = request.get_json()
    session_id = data.get("session_id", "default")
    
    # Remove the user's session from memory if it exists
    if session_id in chat_sessions:
        del chat_sessions[session_id]
        
    return jsonify({"status": "ok"})



# Start the Flask development server on port 5000
if __name__ == "__main__":
    app.run(debug=True, port=5000)
