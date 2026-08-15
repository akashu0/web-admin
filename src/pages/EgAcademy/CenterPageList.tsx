import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Pencil, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { ResourceTable, type Column } from "@/components/common/ResourceTable";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { apiErrorMessage } from "@/services/api";
import { centerPageService } from "@/services/centerPageService";
import type { CenterPage } from "@/types/centerPage";
import { AddCenterPageModal } from "./AddCenterPageModal";

const LIMIT = 10;
const ACADEMY_URL = import.meta.env.VITE_ACADEMY_URL as string | undefined;

/**
 * The eG Academy centre landing pages.
 *
 * These were seven files in eg-academy's source until now, so the list is short
 * and will stay short — it still pages, because the shared table does.
 */
export function CenterPageList() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<CenterPage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | undefined>();

  const isReset = useRef(true);

  const fetchPages = async (pageNum: number, append: boolean) => {
    if (isFetching) return;
    try {
      setIsFetching(true);
      const response = await centerPageService.getAll({
        page: pageNum,
        limit: LIMIT,
        search: searchInput || undefined,
        status,
      });
      const rows = response.data || [];
      const meta = response.pagination;
      setPages((prev) => (append ? [...prev, ...rows] : rows));
      setTotal(meta?.total ?? rows.length);
      setHasMore(
        typeof meta?.hasNextPage === "boolean"
          ? meta.hasNextPage
          : pageNum * LIMIT < (meta?.total ?? 0),
      );
    } catch (error) {
      // Without this the scroll sentinel refires the failed request for ever.
      setHasMore(false);
      toast.error(apiErrorMessage(error, "Could not load the centre pages"));
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  // Debounced search / filter reset.
  useEffect(() => {
    const timer = setTimeout(() => {
      isReset.current = true;
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, status]);

  useEffect(() => {
    const append = !isReset.current;
    isReset.current = false;
    fetchPages(page, append);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchInput, status]);

  const sentinelRef = useInfiniteScroll(() => setPage((prev) => prev + 1), {
    hasMore,
    loading: isFetching,
  });

  const refreshList = () => {
    if (page === 1) {
      fetchPages(1, false);
    } else {
      isReset.current = true;
      setPage(1);
    }
  };

  const handleDelete = async (row: CenterPage) => {
    if (
      !window.confirm(
        `Delete the ${row.name} page? /centers/${row.slug} will start returning "not found".`,
      )
    ) {
      return;
    }
    try {
      await centerPageService.remove(row.slug);
      toast.success("Centre page deleted");
      refreshList();
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not delete that page"));
    }
  };

  const columns: Column<CenterPage>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Centre",
        render: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">/centers/{row.slug}</p>
          </div>
        ),
      },
      {
        key: "country",
        header: "Country",
        render: (row) => <span className="capitalize">{row.country || "—"}</span>,
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <Badge tone={row.status === "published" ? "green" : "neutral"}>
            {row.status ?? "draft"}
          </Badge>
        ),
      },
      {
        key: "content",
        header: "Content",
        render: (row) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {row.courses?.items?.length ?? 0} programmes · {row.faqs?.length ?? 0} FAQs
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        render: (row) => (
          <div className="flex justify-end gap-1">
            {ACADEMY_URL && (
              <Button asChild variant="ghost" size="icon" title="Open on the website">
                <a
                  href={`${ACADEMY_URL}/centers/${row.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              title="Edit"
              onClick={() => navigate(`/eg-academy/centers/${row.slug}`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Delete"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div>
      <PageHeader
        title="Academy Centres"
        subtitle="The /centers pages on the academy site — hero, statistics, programmes and FAQs"
        actions={
          <>
            <Button variant="outline" onClick={refreshList} disabled={isFetching}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Centre
            </Button>
          </>
        }
      />

      <Card className="mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by centre or country…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={status ?? "__all__"}
          onValueChange={(v) =>
            setStatus(v === "__all__" ? undefined : (v as "draft" | "published"))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-auto pr-1 text-xs text-muted-foreground">
          {pages.length} of {total}
        </span>
      </Card>

      <Card className="overflow-hidden">
        <ResourceTable
          columns={columns}
          rows={pages}
          isLoading={isLoading}
          sentinelRef={sentinelRef}
          isFetchingNextPage={isFetching && pages.length > 0}
          hasNextPage={hasMore}
          emptyTitle="No centre pages"
          emptyDescription="Add a centre to give it a page on the academy site."
        />
      </Card>

      <AddCenterPageModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCreated={(created) => navigate(`/eg-academy/centers/${created.slug}`)}
      />
    </div>
  );
}
