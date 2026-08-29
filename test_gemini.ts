import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const geminiAi = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const modelsToTry = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-2.5-flash'];

async function test() {
  let lastError;
  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}...`);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 2000)
      );
      
      const response = await Promise.race([
        geminiAi.models.generateContent({
          model: model,
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        }),
        timeoutPromise
      ]);
      
      console.log(`Success with ${model}`);
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message || err);
      lastError = err;
    }
  }
  console.log("All failed.");
}

test();
