/**
 * Shown next to a chosen reference that will not reach the website.
 *
 * The rule itself is `showsOnWebsite` in @/lib/publishing — it lives outside
 * this file so that this one exports only a component, which is what React Fast
 * Refresh needs to hot-reload it.
 */
export function NotLiveWarning({
    kind,
    status,
    where,
}: {
    kind: string;
    status?: string;
    where: string;
}) {
    return (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 dark:bg-amber-500/10 dark:border-amber-500/40 dark:text-amber-200">
            This {kind} is <strong>{status}</strong>, so it will not appear on the website.
            Publish it in the {where} menu.
        </p>
    );
}
