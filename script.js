const chatBox = document.getElementById("chatBox");

// 🌍 Detect Language
let userLang = navigator.language.slice(0, 2); // "te", "hi", "en"

// 📤 Send Message
async function sendMessage(textInput = null) {

    let input = textInput || document.getElementById("input").value;

    if (!input) return;

    addMessage("You", input);

    let res = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: input,
            lang: userLang
        })
    });

    let data = await res.json();

    addMessage("Bot", data.reply);

    speak(data.reply);
}

// 💬 Add Message UI
function addMessage(sender, text) {
    let div = document.createElement("div");
    div.className = sender === "You" ? "user" : "bot";
    div.innerText = `${sender}: ${text}`;
    chatBox.appendChild(div);
}

// 🔊 Voice Output
function speak(text) {
    let speech = new SpeechSynthesisUtterance();

    speech.lang = userLang + "-IN"; // ex: te-IN
    speech.text = text;

    window.speechSynthesis.speak(speech);
}

// 🎤 Voice Input
function startVoice() {
    const recognition = new webkitSpeechRecognition();

    recognition.lang = userLang + "-IN";
    recognition.start();

    recognition.onresult = function(event) {
        let voiceText = event.results[0][0].transcript;
        sendMessage(voiceText);
    };
}