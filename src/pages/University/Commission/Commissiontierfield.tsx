import type { CommissionTierForm, TierRangeForm } from "../../../types/commission";

interface Props {
    label: string;
    value: CommissionTierForm;
    onChange: (val: CommissionTierForm) => void;
}

const emptyRange = (): TierRangeForm => ({ label: "", value: "" });

export const CommissionTierField = ({ label, value, onChange }: Props) => {
    const updateRange = (index: number, field: keyof TierRangeForm, val: string) => {
        const updated = value.ranges.map((r, i) =>
            i === index ? { ...r, [field]: val } : r
        );
        onChange({ ...value, ranges: updated });
    };

    const addRange = () =>
        onChange({ ...value, ranges: [...value.ranges, emptyRange()] });

    const removeRange = (index: number) =>
        onChange({ ...value, ranges: value.ranges.filter((_: any, i: number) => i !== index) });

    const hasRanges = value.ranges.length > 0;

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                    {label}
                </span>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value.isFullyFunded}
                            onChange={(e) => onChange({ ...value, isFullyFunded: e.target.checked })}
                            className="w-3 h-3 accent-zinc-900"
                        />
                        <span className="text-[11px] text-muted-foreground">Fully funded</span>
                    </label>
                    <button
                        type="button"
                        onClick={addRange}
                        className="text-[11px] font-semibold text-foreground hover:text-muted-foreground transition-colors"
                    >
                        + Add tier
                    </button>
                </div>
            </div>

            {/* Ranges */}
            <div className="divide-y divide-border">
                {!hasRanges && (
                    <div className="px-3 py-3 text-xs text-muted-foreground italic">
                        No commission — leave empty or add a tier
                    </div>
                )}

                {value.ranges.map((range, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2">
                        <input
                            type="text"
                            placeholder="Label (e.g. 1-5)"
                            value={range.label}
                            onChange={(e) => updateRange(i, "label", e.target.value)}
                            className="w-28 text-xs font-mono border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <span className="text-muted-foreground text-xs">→</span>
                        <input
                            type="text"
                            placeholder="Value (e.g. 20% or 600 EUR)"
                            value={range.value}
                            onChange={(e) => updateRange(i, "value", e.target.value)}
                            className="flex-1 text-xs font-mono border border-border rounded px-2 py-1.5 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => removeRange(i)}
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