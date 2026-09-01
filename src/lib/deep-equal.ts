/**
 * Value equality for "has this form changed since it was loaded".
 *
 * `JSON.stringify` is not usable here: the image pickers keep `File` objects in
 * form state and stringify flattens every one of them to `{}`, so swapping an
 * image would read as no change at all.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  // null/undefined and "" are all "nothing was entered". Sections seed missing
  // fields with "" while the API omits them entirely, so treating these as
  // different would mark an untouched form dirty the moment it mounts.
  if (isBlank(a) && isBlank(b)) return true;

  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {
    return false;
  }

  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }

  // A newly picked File is never equal to a stored URL string, which is the
  // point; two references to the same picked file are.
  if (a instanceof File || b instanceof File) {
    return (
      a instanceof File &&
      b instanceof File &&
      a.name === b.name &&
      a.size === b.size &&
      a.lastModified === b.lastModified
    );
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }

  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  // Union of the keys, so a key present on one side and absent on the other is
  // still compared — through isBlank, which forgives undefined vs "".
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (!deepEqual(left[key], right[key])) return false;
  }
  return true;
}

function isBlank(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}
