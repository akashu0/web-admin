import { useEffect, useState } from "react";
import { countryService } from "@/services/countryService";

/**
 * The country names from the Countries module — the one list a country may be
 * picked from anywhere in the admin.
 *
 * Country used to be a free-text input on the university and commission forms,
 * while the university filter bar builds its options from a `distinct` over
 * whatever was typed: "UK" and "United Kingdom" both became filter entries with
 * the records split between them, and the public site (exact match against the
 * countries collection) could not see half of them.
 *
 * `current` is the value already on the record being edited. Legacy rows hold
 * spellings the Countries module does not have; without keeping it as an option
 * the Select renders blank and the next save silently wipes the field. Those
 * values disappear on their own once `cmd/fixcountries` has run.
 */
export function useCountryNames(current?: string): string[] {
    const [names, setNames] = useState<string[]>([]);

    useEffect(() => {
        countryService
            .getAllCountries({ limit: 200 })
            .then((res) => setNames((res.data ?? []).map((c) => c.name).filter(Boolean)))
            .catch(() => setNames([]));
    }, []);

    const value = current?.trim();
    return value && !names.includes(value) ? [...names, value] : names;
}
