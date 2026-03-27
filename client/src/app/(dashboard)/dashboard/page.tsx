"use client";

import { GenerateForm } from "@/components/generate-form";
import { PostList } from "@/components/post-list";
import { StudioHero } from "@/components/dashboard/studio-hero";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function DashboardPage() {
  return (
    <div className="dash-enter space-y-10 lg:space-y-12">
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-7">
        <div className="lg:col-span-8">
          <StudioHero
            title="Command Center"
            description="Orchestrate your creative outputs with precision."
          >
            <GenerateForm />
          </StudioHero>
        </div>

        <aside className="lg:col-span-4">
          <div className="dash-draftsPanel">
            <SectionHeader
              className="dash-draftsPanelHeader"
              title="Drafts"
              description="Unpublished content ready for review."
            />
            <div className="dash-draftsPanelBody">
              <PostList filter="drafts" compact />
            </div>
          </div>
        </aside>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="Published Posts"
          description="Live content available to your audience."
        />
        <PostList filter="published" />
      </section>
    </div>
  );
}
