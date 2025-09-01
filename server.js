import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

// Allow your frontend (Cloudflare Pages) to connect
app.use(cors({ origin: "*" }));
app.use(express.json());

// Chat endpoint
app.post("/chat", async (req, res) => {
  const { messages, propertyDetails } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",   // fast, low-cost text model
        messages: [
          { role: "system", content: `You are a property assistant. Use ONLY these details: ${propertyDetails}. Be concise and accurate.` },
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Send response back to frontend
    res.json(data);

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(3000, () => console.log("Property AI assistant backend running on port 3000"));