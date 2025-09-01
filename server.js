import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Resolve directory paths safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load PDF on startup
let propertyDetails = "Property details not loaded yet.";

async function loadMLS() {
  try {
    const filePath = path.join(__dirname, "Listing.pdf");
    const file = fs.readFileSync(filePath);

    const pdfDoc = await PDFDocument.load(file);
    let text = "";

    // NOTE: pdf-lib doesn’t have a built-in text extractor.
    // For MVP, we can dump metadata (page count) and mark property loaded.
    const pageCount = pdfDoc.getPageCount();
    text = `MLS Sheet loaded successfully. Pages: ${pageCount}.`;

    propertyDetails = text;
    console.log("✅ MLS PDF loaded successfully");
  } catch (err) {
    console.error("❌ Error loading MLS PDF:", err);
  }
}

// Load PDF at startup
await loadMLS();

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
            content: `You are a property assistant. Use ONLY the following MLS property data when answering:\n\n${propertyDetails}`
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

app.listen(3000, () =>
  console.log("Property AI assistant running on port 3000")
);
