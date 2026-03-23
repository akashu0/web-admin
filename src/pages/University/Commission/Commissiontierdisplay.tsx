import type { CommissionTier } from "../../../types/commission";

interface Props {
    tier?: CommissionTier | null;
    compact?: boolean;
}

export const CommissionTierDisplay = ({ tier, compact = false }: Props) => {
    if (!tier || tier.ranges.length === 0) {
        return <span className="text-zinc-300 text-xs font-mono">—</span>;
    }

    const isFlat =
        tier.ranges.length === 1 && (!tier.ranges[0].label || tier.ranges[0].label === "");

    if (isFlat) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-semibold text-zinc-900">
                    {tier.ranges[0].value}
                </span>
                {tier.isFullyFunded && (
                    <span className="text-[10px] font-semibold tracking-widest uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-sm">
                        Funded
                    </span>
                )}
            </div>
        );
    }

    // Tiered
    return (
        <div className="flex flex-col gap-1">
            {tier.ranges.map((range, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    {range.label && (
                        <span className="text-[10px] font-mono text-zinc-400 w-10 shrink-0">
                            {range.label}
                        </span>
                    )}
                    <span
                        className={`font-mono font-semibold text-zinc-900 ${compact ? "text-xs" : "text-sm"
                            }`}
                    >
                        {range.value}
                    </span>
                </div>
            ))}
            {tier.isFullyFunded && (
                <span className="text-[10px] font-semibold tracking-widest uppercase bg-zinc-900 text-white px-2 py-0.5 rounded-sm w-fit mt-0.5">
                    Fully Funded
                </span>
            )}
        </div>
    );
};