/**
 * Whether a record attached to another one will actually appear on the website.
 *
 * The server decides this, not the editor: every public read runs with
 * `publicOnly`, and `catalog.Status.Public()` admits exactly `published` and
 * `active`. Anything else is fetched, dropped, and the section it was attached
 * to renders empty — which is why attaching a draft FAQ used to look like it
 * had worked and done nothing.
 *
 * An absent status is a legacy record the public filter still admits.
 */
export const showsOnWebsite = (status?: string) =>
    !status || status === 'active' || status === 'published';
