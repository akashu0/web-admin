import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/services/api";
import { centerPageService } from "@/services/centerPageService";
import type { CenterPage } from "@/types/centerPage";
import { CenterPageSection } from "./CenterPageSection";
import { CENTER_SECTIONS } from "./centerPageSpec";

/**
 * Edit one eG Academy centre page.
 *
 * Sections save one at a time through the API's PATCH, so a half-finished
 * paragraph in the hero cannot overwrite the FAQ list someone else just changed —
 * and publishing is its own button rather than a side effect of saving.
 */
export default function EditCenterPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<CenterPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeId, setActiveId] = useState(CENTER_SECTIONS[0].id);
  // Bumped after each section save so the form remounts and renders what the
  // server actually stored, rather than what was typed — same reason
  // EditUniversity keys its sections by version.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!slug) {
      navigate("/eg-academy/centers");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const data = await centerPageService.getBySlug(slug);
        if (!cancelled) setPage(data);
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not load that centre page"));
        navigate("/eg-academy/centers");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const togglePublish = async () => {
    if (!page) return;
    const next = page.status === "published" ? "draft" : "published";
    try {
      setIsPublishing(true);
      const updated = await centerPageService.updateStatus(page.slug, next);
      setPage(updated);
      toast.success(next === "published" ? "Page published" : "Page unpublished");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not change the publish state"));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-muted-foreground">Centre page not found</p>
      </div>
    );
  }

  const active = CENTER_SECTIONS.find((s) => s.id === activeId) ?? CENTER_SECTIONS[0];

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] bg-canvas lg:-m-5">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-border bg-card">
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-foreground">Centre page</h2>
          <p className="mt-1 truncate text-sm text-muted-foreground" title={page.name}>
            {page.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">/centers/{page.slug}</p>
        </div>

        <nav className="space-y-1 p-4">
          {CENTER_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveId(section.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                activeId === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 border-b border-border bg-card px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{active.label}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {page.status === "published" ? "Live on the academy site" : "Draft — not public yet"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {ACADEMY_URL && (
                <Button asChild variant="outline">
                  <a href={`${ACADEMY_URL}/centers/${page.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View page
                  </a>
                </Button>
              )}
              <Button
                onClick={togglePublish}
                disabled={isPublishing}
                className={cn(
                  "gap-2",
                  page.status === "published"
                    ? "bg-muted-foreground hover:bg-primary"
                    : "bg-primary hover:bg-primary/90",
                )}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {page.status === "published" ? "Unpublish" : "Publish page"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mx-auto max-w-5xl rounded-lg border border-border bg-card p-6 shadow-sm">
            <CenterPageSection
              // Remount per section, and again after a save. Deliberately NOT on
              // every render: unrelated parent updates (publishing, for one) must
              // leave an in-progress edit — including a just-uploaded image URL —
              // exactly where it is.
              key={`${active.id}:${version}`}
              slug={page.slug}
              sectionKey={active.sectionKey}
              patch={active.patch}
              initial={active.read(page)}
              blocks={active.blocks}
              description={active.description}
              onSaved={(saved) => {
                setPage(saved);
                setVersion((v) => v + 1);
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/** Where the academy site runs, for the "View page" link. Optional: without it
 *  the button is simply not shown, rather than linking to nowhere. */
const ACADEMY_URL = import.meta.env.VITE_ACADEMY_URL as string | undefined;
