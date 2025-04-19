require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

function extractJsonFromMarkdown(text) {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0].trim() : null;
}

async function generateWithGemini(productName) {
  const prompt = {
    contents: [{
      parts: [{
        text: `Generate a structured JSON review for "${productName}". Include these fields: {
          "overview": "Brief product introduction",
          "price": "Price in INR",
          "key_features": ["Feature 1", "Feature 2", ...],
          "performance": {"Criteria1":["performance in criteria in %","Explanation1"], "Criteria2":["performance in criteria in %","Explanation2"], ...},
          "pros": ["Pro 1", "Pro 2", ...],
          "cons": ["Con 1", "Con 2", ...],
          "final_rating": "0-5 rating"
        }. Return only JSON without additional text.`
      }]
    }]
  };

  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, prompt, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });

    const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error("No response text from Gemini");

    try {
      return JSON.parse(responseText);
    } catch {
      const extractedJson = extractJsonFromMarkdown(responseText);
      if (extractedJson) return JSON.parse(extractedJson);
      throw new Error("No valid JSON found");
    }
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw error;
  }
}

async function generateWithMistral(productName) {
  const prompt = `Generate a JSON review for "${productName}" with: {
    "overview": "Product introduction",
    "price": "Price in INR",
    "key_features": ["Feature 1", "Feature 2", ...],
    "performance": {"Criteria1":"Explanation1", "Criteria2":"Explanation2", ...},
    "pros": ["Pro 1", "Pro 2", ...],
    "cons": ["Con 1", "Con 2", ...],
    "final_rating": "0-5 rating"
  }. Return only JSON between \`\`\`json {...} \`\`\``;

  try {
    const response = await axios.post(HF_API_URL, { inputs: prompt }, {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      timeout: 15000
    });

    const generatedText = response.data[0]?.generated_text || "";
    const extractedJson = extractJsonFromMarkdown(generatedText);
    
    if (!extractedJson) throw new Error("No JSON found");
    return JSON.parse(extractedJson);
  } catch (error) {
    console.error("Mistral Error:", error.message);
    throw error;
  }
}

async function generateReview(productName) {
  try {
    return await generateWithGemini(productName);
  } catch {
    return await generateWithMistral(productName);
  }
}

app.get("/generate_review", async (req, res) => {
  const { product_name } = req.query;
  if (!product_name) return res.status(400).json({ error: "Product name required" });

  try {
    const review = await generateReview(product_name);
    res.json({ product: product_name, review });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));