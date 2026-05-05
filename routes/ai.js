const express = require("express");
const axios = require("axios");

const router = express.Router();

const fetchAI = async (question, retries = 1) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const models = [
    "gemini-2.5-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.0-pro"
  ];

  const prompt = `Answer in ONE word only.\nQuestion: ${question}`;

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 8
          }
        },
        {
          params: { key: apiKey },
          timeout: 20000
        }
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      const cleaned = (text || "").trim().match(/[A-Za-z]+/);

      if (cleaned?.[0]) {
        console.log(`Success with ${model}`);
        return cleaned[0];
      }

    } catch (err) {
      console.log(`Model ${model} failed`);
      console.log("Reason:", err.response?.data || err.message);
    }
  }

  // Retry logic (once)
  if (retries > 0) {
    console.log("Retrying full AI flow...");
    return fetchAI(question, retries - 1);
  }

  throw new Error("All AI models failed");
};

router.post("/ai", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const question = req.body?.question;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    try {
      const ans = await fetchAI(question);
      return res.json({ answer: ans });
    } catch (err) {
      console.log("FINAL AI ERROR:", err.message);
      return res.json({ answer: "Unavailable" }); // graceful fallback
    }

  } catch (error) {
    console.log("OUTER ERROR:", error.message);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;