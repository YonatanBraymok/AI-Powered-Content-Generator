import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface GenerateRequest {
  topic: string;
  style: string;
  title?: string;
}

function mockContent(input: GenerateRequest): { title: string; content: string } {
  const title = input.title ?? `${input.style} Take on ${input.topic}`;
  const content = [
    `This is a ${input.style.toLowerCase()}-style article about ${input.topic}.`,
    "",
    `The topic of ${input.topic} has gained significant attention in recent years. ` +
      "As more organizations and individuals explore this area, the conversation continues " +
      "to evolve with new insights and perspectives.",
    "",
    "While there are many dimensions to consider, the key takeaway is that thoughtful " +
      "engagement with this subject can lead to meaningful outcomes for everyone involved.",
  ].join("\n");
  return { title, content };
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

  try {
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
  } catch (error: unknown) {
    const isQuotaError =
      error instanceof Error && "code" in error && (error as any).code === "insufficient_quota";
    if (isQuotaError) {
      console.warn("OpenAI quota exceeded — returning mock content for development");
      return mockContent(input);
    }
    throw error;
  }
}
