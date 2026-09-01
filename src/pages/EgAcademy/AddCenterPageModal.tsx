import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGuardedDialog, useSectionGuard } from "@/hooks/use-unsaved-changes";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/services/api";
import { centerPageService } from "@/services/centerPageService";
import type { CenterPage } from "@/types/centerPage";

/**
 * Create a centre page. Name, country and URL only — the content is then written
 * section by section in the editor, and the page starts as a draft.
 *
 * The URL is editable here and nowhere else: it is what the academy site serves
 * the page at, and changing it later would break every link and every search
 * result pointing at the old one.
 */
export function AddCenterPageModal({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (page: CenterPage) => void;
}) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const suggested = name
    ? `study-in-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
    : "";

  useSectionGuard({
    id: "centerPage.new",
    label: "New centre page",
    value: { name, country, slug },
    ready: open,
    onSave: () => submit(),
    onRestore: () => {
      setName("");
      setCountry("");
      setSlug("");
    },
  });

  const guardedOpenChange = useGuardedDialog(onOpenChange);

  const submit = async () => {
    if (!name.trim()) {
      throw new Error("Give the centre a name");
    }
    try {
      setIsSaving(true);
      const created = await centerPageService.create({
        name: name.trim(),
        slug: (slug || suggested).trim(),
        country: country.trim().toLowerCase() || undefined,
      });
      toast.success("Centre page created as a draft");
      onOpenChange(false);
      setName("");
      setCountry("");
      setSlug("");
      onCreated(created);
    } catch (error) {
      throw new Error(apiErrorMessage(error, "Could not create that page"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    void submit().catch((error: Error) => toast.error(error.message));
  };

  return (
    <Dialog open={open} onOpenChange={guardedOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a centre page</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-[13px]">Centre name</Label>
            <Input value={name} placeholder="Malta" onChange={(e) => setName(e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">
              Used in the site's menus as “Study in {name || "…"}”.
            </p>
          </div>

          <div>
            <Label className="mb-1.5 block text-[13px]">Country</Label>
            <Input
              value={country}
              placeholder="malta"
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-[13px]">URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-muted-foreground">/centers/</span>
              <Input
                value={slug}
                placeholder={suggested || "study-in-malta"}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Cannot be changed after this, so links and search results keep working.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create draft"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
