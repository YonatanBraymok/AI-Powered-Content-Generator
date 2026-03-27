"use client";

import { useState } from "react";
import { GenerateForm } from "@/components/generate-form";
import { PostList } from "@/components/post-list";
import { StudioHero } from "@/components/dashboard/studio-hero";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SegmentedControl } from "@/components/dashboard/segmented-control";

export default function DashboardPage() {
  const [tab, setTab] = useState<"drafts" | "published">("drafts");

  return (
    <div className="space-y-14">
      <StudioHero>
        <GenerateForm />
      </StudioHero>

      <section className="space-y-8">
        <SectionHeader
          title="Recent Works"
          description="Review and manage your generated content drafts."
          right={
            <SegmentedControl
              ariaLabel="Posts view"
              value={tab}
              onChange={setTab}
              options={[
                { value: "drafts", label: "All Drafts" },
                { value: "published", label: "Published" },
              ]}
            />
          }
        />

        <PostList filter={tab} />
      </section>
    </div>
  );
}
