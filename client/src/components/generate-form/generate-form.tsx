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
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<string>(CONTENT_STYLES[0]);
  const generate = useGenerateContent();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = topic.trim();
    if (!trimmed) return;

    generate.mutate(
      { topic: trimmed, style, title: title.trim() || undefined },
      {
        onSuccess: () => {
          setTopic("");
          setTitle("");
          toast.success("Content generated successfully!");
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to generate content");
        },
      },
    );
  }

  return (
    <Card className="border-white/18 bg-background/54 shadow-[0_2px_4px_rgba(0,_0,_0,_0.14),0_20px_42px_rgba(0,_0,_0,_0.2)] backdrop-blur-xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight">
          <Sparkles className="size-5 text-primary" />
          Generate
        </CardTitle>
        <CardDescription className="text-sm">
          Choose a topic and editorial style, then generate a draft in seconds.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="title" className="dash-microLabel">
              Title{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="title"
              className="mt-2 h-14 rounded-xl bg-background/30 px-5 text-base font-medium placeholder:text-muted-foreground/70 focus-visible:ring-ring/40"
              placeholder="Give your post a title, or let the AI decide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={generate.isPending}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Label htmlFor="topic" className="dash-microLabel">
                Content topic
              </Label>
              <Input
                id="topic"
                className="mt-2 h-14 rounded-xl bg-background/30 px-5 text-base font-medium placeholder:text-muted-foreground/70 focus-visible:ring-ring/40"
                placeholder="What should the Oracle write about today?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={generate.isPending}
                required
              />
            </div>
            <div className="lg:col-span-3">
              <Label className="dash-microLabel">Editorial style</Label>
              <Select
                value={style}
                onValueChange={(v) => {
                  if (v) setStyle(v);
                }}
              >
                <SelectTrigger className="mt-2 h-14 w-full rounded-xl bg-background/30 px-5 text-base font-medium focus-visible:ring-ring/40">
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
            <div className="lg:col-span-2">
              <Button
                type="submit"
                className="h-14 w-full rounded-2xl font-heading font-bold shadow-[0_2px_4px_rgba(0,_0,_0,_0.16),0_16px_30px_rgba(0,_0,_0,_0.2)] transition-all duration-300 hover:brightness-105 active:translate-y-px"
                disabled={generate.isPending || !topic.trim()}
              >
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
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
