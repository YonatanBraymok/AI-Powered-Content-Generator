import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const geminiResponseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
});

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

  const parsed = JSON.parse(raw);
  const validated = geminiResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error("Gemini returned an unexpected response shape");
  }

  return validated.data;
}
