import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2048,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(raw) as { title: string; content: string };
  return parsed;
}
