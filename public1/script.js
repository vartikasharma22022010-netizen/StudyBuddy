// API route for Render backend
const API_URL = "/api/chat";

async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) return;

    addMessage("You", message);
    input.value = "";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: message })
        });

        const data = await response.json();

        addMessage("StudyBuddy", data.reply || "No response received.");
    } catch (error) {
        console.error("Error:", error);
        addMessage("StudyBuddy", "⚠️ Error connecting to the server!");
    }
}

function addMessage(sender, text) {
    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML += `
        <p><b>${sender}:</b> ${text}</p>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;
}
