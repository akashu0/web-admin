import type { CommissionTier, TierRange } from "../../../types/commission";
import { tierIsPriced } from "../../../types/commission";

interface Props {
    tier?: CommissionTier | null;
    compact?: boolean;
}

/** A single rate list. Flat (one unlabelled row) collapses to just the value. */
const Rates = ({ ranges, compact }: { ranges: TierRange[]; compact?: boolean }) => {
    const isFlat = ranges.length === 1 && !ranges[0].label;
    const size = compact ? "text-xs" : "text-sm";

    if (isFlat) {
        return (
            <span className={`font-mono font-semibold text-foreground ${size}`}>
                {ranges[0].value}
            </span>
        );
    }
    return (
        <div className="flex flex-col gap-1">
            {ranges.map((range, i) => (
                <div key={i} className="flex items-center gap-2">
                    {range.label && (
                        <span className="text-[10px] font-mono text-muted-foreground w-10 shrink-0">
                            {range.label}
                        </span>
                    )}
                    <span className={`font-mono font-semibold text-foreground ${size}`}>
                        {range.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const CommissionTierDisplay = ({ tier, compact = false }: Props) => {
    if (!tierIsPriced(tier)) {
        return <span className="text-muted-foreground text-xs font-mono">—</span>;
    }

    const funded = tier!.fundedRanges ?? [];
    const normal = tier!.ranges ?? [];

    // The common case by far: one list, no funded variant. Rendered bare, so the
    // table does not grow a "Normal" caption on every row that never had one.
    if (funded.length === 0 && !tier!.isFullyFunded) {
        return <Rates ranges={normal} compact={compact} />;
    }

    return (
        <div className="flex flex-col gap-1.5">
            {(funded.length > 0 || tier!.isFullyFunded) && (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold tracking-widest uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-sm w-fit">
                        Fully funded
                    </span>
                    {funded.length > 0 ? (
                        <Rates ranges={funded} compact={compact} />
                    ) : (
                        <span className="text-xs text-muted-foreground italic">
                            rate on request
                        </span>
                    )}
                </div>
            )}

            {normal.length > 0 && (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                        Normal
                    </span>
                    <Rates ranges={normal} compact={compact} />
                </div>
            )}
        </div>
    );
};
