require("dotenv").config();

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🌍 Translate Function
async function translate(text, targetLang) {
    let res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            q: text,
            source: "auto",
            target: targetLang,
            format: "text"
        })
    });

    let data = await res.json();
    return data.translatedText;
}

app.post("/chat", async (req, res) => {
    let { message, lang } = req.body;

    try {
        // 🔥 Step 1: Translate to English
        let englishText = await translate(message, "en");

        // 🤖 Step 2: AI Response
        let aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: englishText }]
            })
        });

        let data = await aiRes.json();
        let aiReply = data.choices[0].message.content;

        // 🌍 Step 3: Translate back
        let finalReply = await translate(aiReply, lang);

        res.json({ reply: finalReply });

    } catch (err) {
        res.json({ reply: "⚠️ Server error" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));