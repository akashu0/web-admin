import { useEffect } from "react";
import { CommissionForm } from "./Commissionform";
import { CommissionTierDisplay } from "./Commissiontierdisplay";
import {
    COURSE_TYPES,
    COURSE_TYPE_LABELS,
    toFormValues,
    type PartnerCommission,
    type CommissionFormValues,
    type CourseType,
} from "../../../types/commission";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerMode = "view" | "create" | "edit";

interface Props {
    mode: DrawerMode;
    commission?: PartnerCommission | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (values: CommissionFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

// ── Drawer titles ─────────────────────────────────────────────────────────────

const TITLES: Record<DrawerMode, string> = {
    view: "Commission details",
    create: "Add commission",
    edit: "Edit commission",
};

// ── View mode: detail panel ───────────────────────────────────────────────────

const CommissionDetailView = ({ commission }: { commission: PartnerCommission }) => {
    const offeredTypes = COURSE_TYPES.filter(
        (ct: CourseType) => commission[ct]?.ranges?.length
    );

    return (
        <div className="space-y-6 px-6 py-5">
            {/* University info */}
            <div>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-foreground leading-tight">
                            {commission.universityName}
                        </h2>
                        {(commission.location || commission.country) && (
                            <p className="text-sm text-muted-foreground mt-0.5 font-mono">
                                {[commission.location, commission.country].filter(Boolean).join(", ")}
                            </p>
                        )}
                    </div>
                    {commission.universityRef ? (
                        <span className="shrink-0 text-[10px] font-semibold tracking-widest uppercase bg-primary text-primary-foreground px-2.5 py-1 rounded-sm">
                            Linked
                        </span>
                    ) : (
                        <span className="shrink-0 text-[10px] font-semibold tracking-widest uppercase border border-border text-muted-foreground px-2.5 py-1 rounded-sm">
                            Standalone
                        </span>
                    )}
                </div>
            </div>

            {/* Commission grid */}
            {offeredTypes.length > 0 ? (
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-3">
                        Commission rates
                    </p>
                    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                        {offeredTypes.map((ct: CourseType) => (
                            <div
                                key={ct}
                                className="grid grid-cols-[140px_1fr] items-start px-4 py-3 bg-card hover:bg-muted transition-colors"
                            >
                                <span className="text-xs font-semibold text-muted-foreground pt-0.5">
                                    {COURSE_TYPE_LABELS[ct]}
                                </span>
                                <CommissionTierDisplay tier={commission[ct]} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground italic">No commission rates configured.</p>
            )}

            {/* Additional bonus */}
            {commission.additionalBonus && (
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                        Additional bonus
                    </p>
                    <p className="text-sm text-foreground bg-muted border border-border rounded-xl px-4 py-3">
                        {commission.additionalBonus}
                    </p>
                </div>
            )}

            {/* Important notes */}
            {commission.importantNotes && (
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
                        Important notes
                    </p>
                    <p className="text-sm text-foreground bg-muted border border-border rounded-xl px-4 py-3 whitespace-pre-line leading-relaxed">
                        {commission.importantNotes}
                    </p>
                </div>
            )}

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3">
                {commission.intakes && (
                    <div className="bg-muted border border-border rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
                            Intakes
                        </p>
                        <p className="text-sm font-mono text-foreground">{commission.intakes}</p>
                    </div>
                )}
                {commission.tuitionFees && (
                    <div className="bg-muted border border-border rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">
                            Tuition fees
                        </p>
                        <p className="text-sm font-mono text-foreground">{commission.tuitionFees}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main drawer ───────────────────────────────────────────────────────────────

export const CommissionDrawer = ({
    mode,
    commission,
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
}: Props) => {
    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    // Lock body scroll when open
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-primary/20 backdrop-blur-[2px] z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-xl bg-card z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-foreground">
                        {TITLES[mode]}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {mode === "view" && commission && (
                        <CommissionDetailView commission={commission} />
                    )}

                    {(mode === "create" || mode === "edit") && onSubmit && (
                        <CommissionForm
                            mode={mode}
                            initialValues={
                                mode === "edit" && commission
                                    ? toFormValues(commission)
                                    : undefined
                            }
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </>
    );
};