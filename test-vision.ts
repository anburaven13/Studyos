import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY
});

async function main() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract the exams list from this image. Return a JSON array of objects with "name" (string) and "date" in YYYY-MM-DD format (string). Do not include any markdown, just the raw JSON array.'
            },
            {
              type: 'image_url',
              image_url: { url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" }
            }
          ]
        }
      ],
      model: 'qwen/qwen3.6-27b',
    });

    console.log(completion.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("Groq Error:", err.message);
  }
}

main();
