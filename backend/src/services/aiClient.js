import fetch from "node-fetch";
import '../config.js';

const apiKey = process.env.HERO_OPENROUTER_API_KEY;

/**
 * Prompts for AI to generate articles.
 * - promptNumber 1 → initial 3 articles
 * - promptNumber 2 → daily 1 article
 */
const prompts = {
  1: `
Generate exactly 3 blog articles.  
Return ONLY valid JSON:

[
    { "title": "...", "content": "...", "author": "..." },
    { "title": "...", "content": "...", "author": "..." },
    { "title": "...", "content": "...", "author": "..." }
]

Rules:
    - title: 2-3 words
    - content: 3+ paragraphs, 150-300 words
    - author: fictional
    - no date, no explanation, no markdown
`,
  2: `
Generate exactly 1 blog article.  
Return ONLY valid JSON:

[
    { "title": "...", "content": "...", "author": "..." }
]

Rules:
    - title: 2-4 words
    - content: 3+ paragraphs, 150-300 words
    - author: fictional
    - no date, no explanation, no markdown
`
};

/**
 * Extracts JSON safely from AI response content.
 * Some models may wrap JSON inside markdown or extra text.
 */
function extractJSON(text) {
  try {
    // First attempt direct parsing (fast path)
    return JSON.parse(text);
  } catch (err) {
    // Fallback: remove markdown fences if present
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  }
}

/**
 * Fetches articles from OpenRouter AI using a model fallback strategy.
 * Tries multiple models until one succeeds.
 *
 * @param {number} promptNumber - 1 for initial setup, 2 for daily cron
 * @returns {Promise<Array>} - Array of validated articles
 */
export async function fetchArticlesFromAI(promptNumber) {
  const prompt = prompts[promptNumber];

  // Pool of free models (failover strategy)
  const models = [
    "z-ai/glm-4.5-air:free",
    "qwen/qwen3-coder:free",
    "minimax/minimax-m2.5:free",
    "arcee-ai/trinity-large-thinking:free",
    "liquid/lfm-2.5-1.2b-thinking:free",
    "liquid/lfm-2.5-1.2b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free"
  ];

  /**
   * Calls OpenRouter with a specific model
   */
  const callModel = async (model) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API failed (${model}) - ${response.status}`);
    }

    return await response.json();
  };

  /**
   * Sleep utility for retry delay between model attempts
   */
  function sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  // Try models one by one until success
  for (let i = 0; i < models.length; i++) {
    const model = models[i];

    try {
      console.log(`🧠 Trying AI model: ${model}`);

      const data = await callModel(model);

      const content = data?.choices?.[0]?.message?.content;

      if (!content) throw new Error("Empty AI response");

      // Try to extract structured JSON
      const articles = extractJSON(content);

      // Validate structure (safety layer)
      const validated = articles.map((article, index) => ({
        title: article?.title?.trim() || `Fallback Title ${index + 1}`,
        content: article?.content?.trim() || "Fallback content",
        author: article?.author?.trim() || "AI"
      }));

      return validated;

    } catch (error) {
      console.error(`❌ Model failed: ${model}`);

      // Wait before trying next model (rate-limit safety)
      console.log("Waiting before trying new Model...")
      await sleep(600000);
    }
  }

  // Final fallback only if ALL models fail
  console.error("⚠️ All AI models failed, using fallback articles");

  if (promptNumber === 1) {
    return [
      { title: "Fallback Article 1", content: "This is dummy content.", author: "System" },
      { title: "Fallback Article 2", content: "This is dummy content.", author: "System" },
      { title: "Fallback Article 3", content: "This is dummy content.", author: "System" }
    ];
  }

  return [
    { title: "Fallback Article", content: "This is dummy content.", author: "System" }
  ];
}