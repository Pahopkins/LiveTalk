import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { messages, propertyDetails } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/realtime?model=gpt-realtime", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-realtime",
        messages: [
          { role: "system", content: `You are a property assistant. Use ONLY these details: ${propertyDetails}. Answer questions and book showings.` },
          ...messages
        ],
        voice: "marin"
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("Realtime AI server running on port 3000"));
