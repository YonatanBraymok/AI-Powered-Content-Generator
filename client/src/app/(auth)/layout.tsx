import { Sparkles } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 flex items-center gap-2">
        <Sparkles className="size-6 text-primary" />
        <span className="text-2xl font-bold tracking-tight">{APP_NAME}</span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
