import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import pdf from "pdf-parse";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Load PDF on startup
let propertyDetails = "Property details not loaded yet.";

async function loadMLS() {
  try {
    const dataBuffer = fs.readFileSync("./Listing.pdf"); // Must be in repo root
    const pdfData = await pdf(dataBuffer);
    propertyDetails = pdfData.text;
    console.log("✅ MLS PDF loaded successfully");
  } catch (err) {
    console.error("❌ Error loading MLS PDF:", err);
  }
}

// Run at server start
loadMLS();

app.post("/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a property assistant. Use ONLY this MLS data when answering questions:\n\n${propertyDetails}`
          },
          ...messages
        ]
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => console.log("Property AI assistant running on port 3000"));
