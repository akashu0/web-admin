/**
 * The tuition-fee vocabulary: what is stored, and what the employee reads.
 *
 * The label and the stored value are deliberately NOT the same string. The
 * value is load-bearing well outside this app:
 *
 *   - eg-api keys the website's "fully funded" tab on the exact literal
 *     (`FullyFunded` in internal/catalog/course.go, used by the `?fullyFunded=true`
 *     filter and by scholarshipFunding's "Fully Funded" mapping).
 *   - eg-academy colour-codes a fee badge on an exact `===` against it.
 *   - Both websites build their fee-type filter from the DISTINCT stored values,
 *     so renaming the value while old rows survive shows students the same
 *     option twice.
 *
 * So "Fully Tuition Fee Funded" stays in the database and only the wording in
 * web-admin changed. Renaming the value would need a migration under
 * eg-api/cmd plus matching edits in eg-api, eg-academy and eG-website.
 */

export const TUITION_FEE_TYPE_OPTIONS = [
  { value: 'Fully Tuition Fee Funded', label: 'Fully Tuition Fee Sponsored' },
  { value: 'Scholarships', label: 'Scholarships' },
  { value: 'Regular (Self-Funded Program)', label: 'Regular (Self-Funded Program)' },
] as const;

/** The stored values alone, for the Zod enum — one list, so it cannot drift. */
export const TUITION_FEE_TYPE_VALUES = [
  'Fully Tuition Fee Funded',
  'Scholarships',
  'Regular (Self-Funded Program)',
] as const;

export type TuitionFeeType = (typeof TUITION_FEE_TYPE_VALUES)[number];

/**
 * Stored value -> what to show for it.
 *
 * Anything not in the list passes through unchanged: a record written before
 * this list existed still renders its own text rather than disappearing.
 */
export function tuitionFeeTypeLabel(value?: string | null): string {
  if (!value) return '';
  return TUITION_FEE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
