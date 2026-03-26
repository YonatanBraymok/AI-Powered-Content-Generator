import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GenerateRequest {
  topic: string;
  style: string;
  title?: string;
}

export async function generateContent(input: GenerateRequest): Promise<{
  title: string;
  content: string;
}> {
  const systemPrompt = `You are a professional content writer. Generate high-quality content based on the user's topic and style. Return a JSON object with "title" and "content" fields. The content should be well-structured with paragraphs.`;

  const userPrompt = [
    `Topic: ${input.topic}`,
    `Style: ${input.style}`,
    input.title ? `Suggested title: ${input.title}` : "Generate a compelling title.",
  ].join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  });

  const raw = response.text;
  if (!raw) throw new Error("Empty response from Gemini");

  return JSON.parse(raw) as { title: string; content: string };
}
