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
    surface = "website",
    hint,
}: {
    kind: string;
    status?: string;
    /** The menu that publishes this kind of record. Omit when `hint` says it. */
    where?: string;
    /**
     * Where the record fails to show up. Defaults to the website, which is what
     * every reference on a university page means; the incentive tabs pass the
     * agent portals instead, because a rate card is never on the public site.
     */
    surface?: string;
    /**
     * Replaces the "Publish it in the {where} menu." sentence.
     *
     * Every reference on this page names a record that is published somewhere
     * else, so pointing at a menu is the right instruction for them. A job is
     * the exception: it is published by the button at the top of the page you
     * are already on, and sending someone to a menu would be sending them the
     * wrong way.
     */
    hint?: string;
}) {
    return (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 dark:bg-amber-500/10 dark:border-amber-500/40 dark:text-amber-200">
            This {kind} is <strong>{status}</strong>, so it will not appear on the {surface}.
            {hint ? ` ${hint}` : where ? ` Publish it in the ${where} menu.` : ""}
        </p>
    );
}
