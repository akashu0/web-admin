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
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 border-b border-zinc-200">
                <span className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
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
                        <span className="text-[11px] text-zinc-500">Fully funded</span>
                    </label>
                    <button
                        type="button"
                        onClick={addRange}
                        className="text-[11px] font-semibold text-zinc-900 hover:text-zinc-600 transition-colors"
                    >
                        + Add tier
                    </button>
                </div>
            </div>

            {/* Ranges */}
            <div className="divide-y divide-zinc-100">
                {!hasRanges && (
                    <div className="px-3 py-3 text-xs text-zinc-400 italic">
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
                            className="w-28 text-xs font-mono border border-zinc-200 rounded px-2 py-1.5 bg-white text-zinc-900 placeholder-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors"
                        />
                        <span className="text-zinc-300 text-xs">→</span>
                        <input
                            type="text"
                            placeholder="Value (e.g. 20% or 600 EUR)"
                            value={range.value}
                            onChange={(e) => updateRange(i, "value", e.target.value)}
                            className="flex-1 text-xs font-mono border border-zinc-200 rounded px-2 py-1.5 bg-white text-zinc-900 placeholder-zinc-300 focus:outline-none focus:border-zinc-900 transition-colors"
                        />
                        <button
                            type="button"
                            onClick={() => removeRange(i)}
                            className="text-zinc-300 hover:text-zinc-900 transition-colors text-sm leading-none"
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