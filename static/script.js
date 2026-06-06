// Generate a unique session ID for the user by creating a random string
// This allows the server to keep track of this specific user's conversation history
const sessionId = "session_" + Math.random().toString(36).substring(7);

// Grab references to important DOM elements we'll need to interact with
const inputField = document.getElementById("userInput");
const messagesDiv = document.getElementById("messages");

// Listen for keyboard events on the text input field
// Specifically, we want to allow the user to send a message by pressing the "Enter" key
inputField.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent the default form submission behavior (which might reload the page)
        sendMessage();          // Trigger the sendMessage function
    }
});

/**
 * Helper function to create and append a new message bubble to the chat window
 * @param {string} role - Who sent the message ("user" or "bot")
 * @param {string} text - The content of the message
 * @param {boolean} isError - Optional flag to style the message differently if it's an error
 */
function appendMessage(role, text, isError = false) {
    // Create an outer container for the message to handle alignment (left vs right)
    const container = document.createElement("div");
    container.className = "message-container " + role;
    
    // Create the inner bubble that actually holds the text and has the background color
    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    
    // If it's an error message, add a specific CSS class to make the text red
    if (isError) {
        bubble.classList.add("error-text");
    }
    
    // Set the text content safely (textContent protects against XSS attacks vs innerHTML)
    bubble.textContent = text;
    
    // Attach the bubble to the container, and the container to the messages area
    container.appendChild(bubble);
    messagesDiv.appendChild(container);
    
    // Automatically scroll to the bottom of the chat window so the newest message is visible
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/**
 * Main function that handles sending a user's input to the server and displaying the response
 */
function sendMessage() {
    // Get the user's input and remove any leading/trailing whitespace
    const userText = inputField.value.trim();
    
    // If the input is empty, do nothing
    if (userText === "") return;

    // First, display the user's message in the UI immediately
    appendMessage("user", userText);
    
    // Clear the input field so they can type their next message
    inputField.value = "";

    // Make an HTTP POST request to our Flask backend API
    fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We send both the user's message and their unique session ID to the server
        body: JSON.stringify({ message: userText, session_id: sessionId })
    })
    // When the server responds, parse the response body as JSON
    .then(response => response.json())
    // After parsing the JSON, handle the data
    .then(data => {
        // If the server returned an error property, display it as an error message
        if (data.error) {
            appendMessage("bot", "Error: " + data.error, true);
        } else {
            // Otherwise, display the AI's response text normally
            appendMessage("bot", data.text);
        }
    })
    // Catch any network errors (e.g., server offline, CORS issues)
    .catch(error => {
        appendMessage("bot", "Error: " + error, true);
    });
}

/**
 * Function to clear the current chat history both on the UI and on the server
 */
function clearChat() {
    // Tell the server to delete the history associated with this session ID
    fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
    }).then(() => {
        // Once the server confirms the reset, clear the messages div and add a fresh greeting
        messagesDiv.innerHTML = `
            <div class="message-container bot">
                <div class="message-bubble">Hello! How can I help you today?</div>
            </div>
        `;
    });
}
