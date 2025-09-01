import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let propertyDetails = "Property details not loaded yet.";

async function loadMLS() {
  try {
    const filePath = path.join(__dirname, "Listing.pdf");
    const rawData = new Uint8Array(fs.readFileSync(filePath));
    const pdfDoc = await pdfjsLib.getDocument({ data: rawData }).promise;

    let textContent = "";
    for (let i = 0; i < pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i + 1);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      textContent += strings.join(" ") + "\n";
    }

    propertyDetails = textContent;
    console.log("✅ MLS PDF loaded with text extraction");
  } catch (err) {
    console.error("❌ Error loading MLS PDF:", err);
  }
}

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

app.listen(3000, () =>
  console.log("Property AI assistant running on port 3000")
);
