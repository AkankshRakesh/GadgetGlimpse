require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// API configurations
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
function extractJsonFromMarkdown(text) {
  // First try to extract from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
      return codeBlockMatch[1].trim();
  }
   
  // If no code blocks, try to find the first valid JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
      return jsonMatch[0].trim();
  }  
  
  return null;
}
// Function to generate review using Gemini API
async function generateWithGemini(productName) {
    const prompt = {
        contents: [{
            parts: [{
                text: `Generate a structured JSON review for the tech product "${productName}". The response should be a valid JSON object with the following fields:
                {
                  "overview": "Brief introduction of the product.",
                  "price" : "Price of the product in INR",
                  "key_features": ["Feature 1", "Feature 2", "Feature 3", ...],
                  "performance": {"Criteria1":"Explanation1", "Criteria2":"Explanation2", ...},
                  "pros": ["Pro 1", "Pro 2", ...],
                  "cons": ["Con 1", "Con 2", ...],
                  "final_rating": "rating of product (0-5)"
                }
                Return only the JSON object without any additional text or markdown formatting.`
            }]
        }]
    };

    try {
      const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          prompt,
          {
              headers: { "Content-Type": "application/json" },
              timeout: 10000
          }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("No response text from Gemini");

      // Try to parse directly first
      try {
          return JSON.parse(responseText);
      } catch (e) {
          // If direct parse fails, try extracting from markdown
          const extractedJson = extractJsonFromMarkdown(responseText);
          if (extractedJson) {
              return JSON.parse(extractedJson);
          }
          throw new Error("No valid JSON found in Gemini response");
      }
  } catch (error) {
      console.error("Gemini API Error:", error.message);
      throw error;
  }
}

// Fallback function using Mistral
// Updated generateWithMistral function
async function generateWithMistral(productName) {
  const prompt = `Generate a structured JSON review for the product "${productName}". The response should be a valid JSON object with the following fields:
  {
    "overview": "Brief introduction of the product.",
    "price" : "Price of the product in INR",
    "key_features": ["Feature 1", "Feature 2", "Feature 3", ...],
    "performance": {"Criteria1":"Explanation1", "Criteria2":"Explanation2", ...},
    "pros": ["Pro 1", "Pro 2", ...],
    "cons": ["Con 1", "Con 2", ...],
    "final_rating": "rating of product (0-5)"
  }
  Return only the JSON object between triple backticks like this: \`\`\`json {...} \`\`\``;

  try {
    const response = await axios.post(
        HF_API_URL,
        { inputs: prompt },
        {
            headers: { Authorization: `Bearer ${HF_API_KEY}` },
            timeout: 15000
        }
    );

    const generatedText = response.data[0]?.generated_text || "";
    const extractedJson = extractJsonFromMarkdown(generatedText);
    
    if (!extractedJson) {
        console.error("Mistral Response:", generatedText);
        throw new Error("No JSON found in Mistral response");
    }

    try {
        return JSON.parse(extractedJson);
    } catch (parseError) {
        console.error("Failed to parse Mistral JSON:", {
            extractedJson,
            error: parseError.message
        });
        throw new Error("Invalid JSON from Mistral");
    }
} catch (error) {
    console.error("Mistral API Error:", error.message);
    throw error;
}
}

// Main review generation function
async function generateReview(productName) {
    // Try Gemini first
    let review = await generateWithGemini(productName);
    
    // If Gemini fails, fallback to Mistral
    if (!review || review.error) {
        console.log("Falling back to Mistral...");
        review = await generateWithMistral(productName);
    }
    
    return review;
}

// API Endpoint
app.get("/generate_review", async (req, res) => {
    const { product_name } = req.query;
    if (!product_name) {
        return res.status(400).json({ error: "Product name is required!" });
    }

    try {
        const review = await generateReview(product_name);
        res.json({ product: product_name, review });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));