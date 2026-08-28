import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await geminiAi.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: 'Hello, what model are you?'
    });
    console.log('Success!', response.text);
  } catch (error: any) {
    console.error('Gemini Error:', error.message || error);
  }
}

test();
