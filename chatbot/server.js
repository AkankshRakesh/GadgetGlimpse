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

async function generateWithGemini(prompt) {
  try {
    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
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

async function generateWithMistral(prompt) {
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

app.get("/generate_review", async (req, res) => {
  const { product_name } = req.query;
  if (!product_name) return res.status(400).json({ error: "Product name required" });

  const prompt = `Generate a structured JSON review for "${product_name}". Include these fields: {
    "overview": "Brief product introduction",
    "price": "Price in INR",
    "key_features": ["Feature 1", "Feature 2", ...],
    "performance": {"Criteria1":["performance in criteria in %","Explanation1"], "Criteria2":["performance in criteria in %","Explanation2"], ...},
    "pros": ["Pro 1", "Pro 2", ...],
    "cons": ["Con 1", "Con 2", ...],
    "final_rating": "0-5 rating"
  }. Return only JSON without additional text.`;

  try {
    const review = await generateWithGemini(prompt);
    res.json({ product: product_name, review });
  } catch (error) {
    console.error("Server error:", error);
    try {
      const review = await generateWithMistral(prompt);
      res.json({ product: product_name, review });
    } catch (fallbackError) {
      res.status(500).json({ error: "Failed to generate review" });
    }
  }
});

app.post('/api/compare_products', async (req, res) => {
  const { product1, product2 } = req.body;
  
  if (!product1 || !product2) {
    return res.status(400).json({ error: "Both products with names are required" });
  }

  const prompt = `Generate a detailed comparison between these two products in a structured JSON format:

          Product 1: ${product1}
          Product 2: ${product2}

          The JSON should include these exact fields with this structure:
          {
            \"overview\": \"A concise 2-3 sentence comparison highlighting the main differences\",
            \"price\": \"Detailed price comparison including price difference and value analysis\",
            \"key_features\": [
              \"Comparison of feature 1 (how they differ)\",
              \"Comparison of feature 2 (how they differ)\",
              \"Comparison of feature 3 (how they differ)\",
              \"Comparison of feature 4 (how they differ)\",
              \"Comparison of feature 5 (how they differ)\"
            ],
            \"performance\": {
              \"Speed\": [\"Product 1 performance\", \"Product 2 performance\", \"Detailed comparison analysis\"],
              \"Display Quality\": [\"Product 1 performance\", \"Product 2 performance\", \"Detailed comparison analysis\"],
              \"Battery Life\": [\"Product 1 performance\", \"Product 2 performance\", \"Detailed comparison analysis\"],
              \"Camera Quality\": [\"Product 1 performance\", \"Product 2 performance\", \"Detailed comparison analysis\"],
              \"Build Quality\": [\"Product 1 performance\", \"Product 2 performance\", \"Detailed comparison analysis\"]
            },
            \"pros\": [
              \"Product 1 advantage 1\",
              \"Product 1 advantage 2\",
              \"Product 2 advantage 1\",
              \"Product 2 advantage 2\",
              \"Shared advantage if applicable\"
            ],
            \"cons\": [
              \"Product 1 limitation 1\",
              \"Product 1 limitation 2\",
              \"Product 2 limitation 1\",
              \"Product 2 limitation 2\",
              \"Shared limitation if applicable\"
            ],
            \"ratings\": {
              \"product1\": \"Rating out of 5 (e.g., 3.5)\",
              \"product2\": \"Rating out of 5 (e.g., 4.2)\"
            }
          }

          Important requirements:
          1. Always maintain this exact JSON structure
          2. Include exactly 5 key features
          3. Include exactly 5 performance metrics
          4. Include at least 4-5 pros and cons (can be mixed between products)
          5. Ratings should be on a scale of 1-5 with one decimal place
          6. Performance metrics should include specific percentages or measurable values where possible
          7. Never include any additional text outside the JSON structure
          8. Ensure all comparisons are objective and factual

          Example performance format:
          \"Battery Life\": [\"10 hours\", \"15 hours\", \"Product 2 lasts 50% longer than Product 1\"]

          Return ONLY the raw JSON without any markdown formatting or additional text.`;

  try {
    // Try Gemini first
    const comparison = await generateWithGemini(prompt);
    return res.json({
      product1: product1,
      product2: product2,
      comparison
    });
  } catch (error) {
    console.error("Gemini comparison failed, trying Mistral:", error);
    try {
      // Fallback to Mistral
      const comparison = await generateWithMistral(prompt);
      return res.json({
        product1: product1,
        product2: product2,
        comparison
      });
    } catch (fallbackError) {
      console.error("Both comparison methods failed:", fallbackError);
      return res.status(500).json({ 
        error: "Failed to generate comparison",
        details: fallbackError.message 
      });
    }
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));