import { toast } from "sonner";

import { apiErrorMessage } from "@/services/api";
import { universityService } from "@/services/universityService";

/**
 * Where the public site is, and how to open one of its pages.
 *
 * web-admin does not render content pages any more. It used to keep a read-only
 * copy of the university page, which was a second rendering of the same record
 * to keep in step and still never answered the question the editor was asking —
 * how does this look on the site. "View" now opens the real page.
 *
 * Unset (as VITE_ACADEMY_URL may be) means the buttons are simply not shown,
 * rather than sending someone to a broken origin.
 */
export const WEBSITE_URL = (import.meta.env.VITE_WEBSITE_URL as string | undefined)
    ?.replace(/\/$/, "");

/**
 * Opens one university on the public site, in a new tab.
 *
 * A published record is just a URL. A draft is not on the site at all, so the
 * API is asked for a signed, short-lived preview link — signed there so the
 * secret stays server-side, since anything this bundle held would be readable
 * by anyone who opened it.
 */
export function openUniversityPage(university: { slug: string; status?: string }) {
    if (!WEBSITE_URL) return;

    if (university.status !== "draft") {
        window.open(`${WEBSITE_URL}/universities/${university.slug}`, "_blank", "noopener,noreferrer");
        return;
    }

    // The tab is opened now and filled in when the link arrives: a window.open
    // that happens after an await is no longer attributable to the click, and
    // every popup blocker stops it. `noopener` is set by hand for the same
    // reason — passing it as a feature makes window.open return null.
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null;

    universityService
        .getPreviewLink(university.slug)
        .then(({ url }) => {
            if (tab) tab.location.href = url;
            else window.location.assign(url);
        })
        .catch((error) => {
            tab?.close();
            toast.error(apiErrorMessage(error, "Could not open the draft preview"));
        });
}
