"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGenerateContent } from "@/hooks/use-generate";
import { CONTENT_STYLES } from "@/lib/constants";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

export function GenerateForm() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<string>(CONTENT_STYLES[0]);
  const generate = useGenerateContent();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = topic.trim();
    if (!trimmed) return;

    generate.mutate(
      { topic: trimmed, style },
      {
        onSuccess: () => {
          setTopic("");
          toast.success("Content generated successfully!");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to generate content");
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Generate Content
        </CardTitle>
        <CardDescription>
          Enter a topic and choose a writing style to generate AI-powered
          content.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g. Benefits of remote work"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={generate.isPending}
                required
              />
            </div>
            <div className="w-full space-y-2 sm:w-44">
              <Label>Style</Label>
              <Select
                value={style}
                onValueChange={(v) => {
                  if (v) setStyle(v);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STYLES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={generate.isPending || !topic.trim()}>
              {generate.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
