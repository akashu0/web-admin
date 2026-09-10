import { useState } from "react";
import type { CommissionTierForm, TierRangeForm } from "../../../types/commission";
import { COURSE_TYPE_LABELS, COURSE_TYPES, type CourseType } from "../../../types/commission";

interface Props {
    label: string;
    value: CommissionTierForm;
    onChange: (val: CommissionTierForm) => void;
    /** Copy this level's rates onto other levels. Omitted in the standalone drawer. */
    onCopyToLevels?: (targets: CourseType[]) => void;
    /** The level this field edits, so it can exclude itself from the copy list. */
    self?: CourseType;
}

const emptyRange = (): TierRangeForm => ({ label: "", value: "" });

/** Which of the two lists a row belongs to. Both are TierRangeForm[]. */
type ListKey = "ranges" | "fundedRanges";

const isEmptyRange = (r: TierRangeForm) => !r.label.trim() && !r.value.trim();

/**
 * One rate list — the standard rates or the fully-funded ones.
 *
 * Extracted because the two lists are identical in every respect except which
 * key they write to, and a second copy of the row markup is a second place for
 * the label/value inputs to drift apart.
 */
const RangeRows = ({
    title,
    rows,
    onRows,
    action,
}: {
    title: string;
    rows: TierRangeForm[];
    onRows: (rows: TierRangeForm[]) => void;
    action?: React.ReactNode;
}) => {
    const update = (index: number, field: keyof TierRangeForm, val: string) =>
        onRows(rows.map((r, i) => (i === index ? { ...r, [field]: val } : r)));

    return (
        <div className="border border-border rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border">
                <span className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
                    {title}
                </span>
                <div className="flex items-center gap-3">
                    {action}
                    <button
                        type="button"
                        onClick={() => onRows([...rows, emptyRange()])}
                        className="text-[11px] font-semibold text-foreground hover:text-muted-foreground transition-colors"
                    >
                        + Add tier
                    </button>
                </div>
            </div>

            <div className="divide-y divide-border">
                {rows.length === 0 && (
                    <div className="px-3 py-2.5 text-xs text-muted-foreground italic">
                        No rate — leave empty or add a tier
                    </div>
                )}

                {rows.map((range, i) => (
                    // Index-keyed: rows are never reordered, only appended,
                    // edited, removed, or replaced wholesale by a copy.
                    <div key={i} className="flex items-center gap-2 px-3 py-2">
                        <input
                            type="text"
                            placeholder="Label (e.g. 1-5)"
                            value={range.label}
                            onChange={(e) => update(i, "label", e.target.value)}
                            className="w-28 text-xs font-mono border border-border rounded px-2 py-1.5 bg-background"
                        />
                        <span className="text-muted-foreground text-xs">→</span>
                        <input
                            type="text"
                            placeholder="Value (e.g. 20% or 600 EUR)"
                            value={range.value}
                            onChange={(e) => update(i, "value", e.target.value)}
                            className="flex-1 text-xs font-mono border border-border rounded px-2 py-1.5 bg-background"
                        />
                        <button
                            type="button"
                            onClick={() => onRows(rows.filter((_, j) => j !== i))}
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm leading-none"
                            aria-label="Remove tier"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CommissionTierField = ({
    label,
    value,
    onChange,
    onCopyToLevels,
    self,
}: Props) => {
    const [copyOpen, setCopyOpen] = useState(false);
    const [targets, setTargets] = useState<CourseType[]>([]);

    const setList = (key: ListKey, rows: TierRangeForm[]) =>
        onChange({ ...value, [key]: rows });

    /**
     * Copy one list onto the other — the whole point of the two-list layout is
     * that the second rate is usually the first with a couple of numbers
     * changed. Overwriting real content asks first.
     */
    const copyAcross = (from: ListKey, to: ListKey) => {
        const source = value[from];
        if (source.length === 0) return;
        const dest = value[to];
        const wouldLose = dest.some((r) => !isEmptyRange(r));
        if (wouldLose && !confirm(`Replace the ${to === "ranges" ? "Normal" : "Fully funded"} rates with a copy?`)) {
            return;
        }
        onChange({ ...value, [to]: source.map((r) => ({ ...r })) });
    };

    const toggleFunded = (on: boolean) =>
        // Unticking drops the funded rates rather than hiding them: a level that
        // does not offer a funded variant should not carry rates nobody can see.
        onChange({ ...value, isFullyFunded: on, fundedRanges: on ? value.fundedRanges : [] });

    const applyCopy = () => {
        if (targets.length && onCopyToLevels) onCopyToLevels(targets);
        setTargets([]);
        setCopyOpen(false);
    };

    const others = COURSE_TYPES.filter((ct) => ct !== self);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    {label}
                </span>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value.isFullyFunded}
                            onChange={(e) => toggleFunded(e.target.checked)}
                            className="w-3 h-3 accent-zinc-900"
                        />
                        <span className="text-[11px] text-muted-foreground">
                            Offers fully funded
                        </span>
                    </label>

                    {onCopyToLevels && (
                        <button
                            type="button"
                            onClick={() => setCopyOpen((o) => !o)}
                            className="text-[11px] font-semibold text-foreground hover:text-muted-foreground transition-colors"
                        >
                            Copy to level {copyOpen ? "▴" : "▾"}
                        </button>
                    )}
                </div>
            </div>

            {copyOpen && onCopyToLevels && (
                <div className="px-3 py-2.5 bg-muted/40 border-b border-border space-y-2">
                    <p className="text-[11px] text-muted-foreground">
                        Copy both rate lists from {label} onto:
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                        {others.map((ct) => (
                            <label key={ct} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={targets.includes(ct)}
                                    onChange={(e) =>
                                        setTargets((prev) =>
                                            e.target.checked
                                                ? [...prev, ct]
                                                : prev.filter((p) => p !== ct)
                                        )
                                    }
                                    className="w-3 h-3 accent-zinc-900"
                                />
                                <span className="text-[11px]">{COURSE_TYPE_LABELS[ct]}</span>
                            </label>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={applyCopy}
                        disabled={targets.length === 0}
                        className="text-[11px] font-semibold text-foreground hover:text-muted-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Apply to {targets.length || "…"} level{targets.length === 1 ? "" : "s"}
                    </button>
                </div>
            )}

            <div className="p-3 space-y-2">
                {value.isFullyFunded && (
                    <RangeRows
                        title="Fully funded"
                        rows={value.fundedRanges}
                        onRows={(rows) => setList("fundedRanges", rows)}
                        action={
                            value.fundedRanges.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => copyAcross("fundedRanges", "ranges")}
                                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Copy to Normal ↓
                                </button>
                            )
                        }
                    />
                )}

                <RangeRows
                    title="Normal"
                    rows={value.ranges}
                    onRows={(rows) => setList("ranges", rows)}
                    action={
                        value.isFullyFunded && value.ranges.length > 0 && (
                            <button
                                type="button"
                                onClick={() => copyAcross("ranges", "fundedRanges")}
                                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Copy to Fully funded ↑
                            </button>
                        )
                    }
                />
            </div>
        </div>
    );
};
