import { useState } from "react";
import { CommissionTierField } from "./Commissiontierfield";
import {
    COURSE_TYPES,
    COURSE_TYPE_LABELS,
    type CommissionFormValues,
    type CommissionTierForm,
    type CourseType,
} from "../../../types/commission";

// ── Default empty tier ────────────────────────────────────────────────────────

const emptyTier = (): CommissionTierForm => ({
    ranges: [],
    isFullyFunded: false,
});

const defaultValues = (): CommissionFormValues => ({
    universityRef: "",
    universityName: "",
    location: "",
    country: "",
    bachelors: emptyTier(),
    masters: emptyTier(),
    certifications_ps: emptyTier(),
    diploma_fopg: emptyTier(),
    diploma: emptyTier(),
    phd: emptyTier(),
    additionalBonus: "",
    courseTypeRestrictions: "",
    importantNotes: "",
    tuitionFees: "",
    intakes: "",
});

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    initialValues?: Partial<CommissionFormValues>;
    onSubmit: (values: CommissionFormValues) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    mode: "create" | "edit";
    // Set by the university editor's Commission tab: the institution is already
    // decided, and the API overwrites name/ref from the university anyway, so
    // showing those inputs would offer an edit that never takes effect.
    universityLocked?: boolean;
}

// ── Input component ───────────────────────────────────────────────────────────

const Field = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            {label}
        </label>
        {children}
    </div>
);

const inputCls =
    "w-full text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors font-mono";

// ── Component ─────────────────────────────────────────────────────────────────

export const CommissionForm = ({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
    mode,
    universityLocked = false,
}: Props) => {
    const [values, setValues] = useState<CommissionFormValues>({
        ...defaultValues(),
        ...initialValues,
    });

    const [activeTab, setActiveTab] = useState<"details" | "commissions" | "notes">(
        "details"
    );
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof CommissionFormValues>(
        key: K,
        val: CommissionFormValues[K]
    ) => setValues((prev: any) => ({ ...prev, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!universityLocked && !values.universityName.trim()) {
            setError("University name is required.");
            return;
        }
        try {
            await onSubmit(values);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-border px-6">
                {(["details", "commissions", "notes"] as const).map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 pt-1 mr-6 text-xs font-semibold tracking-widest uppercase transition-colors border-b-2 -mb-px ${activeTab === tab
                            ? "border-primary text-foreground"
                            : "border-transparent text-muted-foreground hover:text-muted-foreground"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* ── Details tab ── */}
                {activeTab === "details" && (
                    <>
                        {!universityLocked && (
                            <>
                                <Field label="University name *">
                                    <input
                                        className={inputCls}
                                        placeholder="e.g. HTMI (Luzern Campus)"
                                        value={values.universityName}
                                        onChange={(e) => set("universityName", e.target.value)}
                                    />
                                </Field>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Country">
                                        <input
                                            className={inputCls}
                                            placeholder="e.g. Switzerland"
                                            value={values.country}
                                            onChange={(e) => set("country", e.target.value)}
                                        />
                                    </Field>
                                    <Field label="Location / city">
                                        <input
                                            className={inputCls}
                                            placeholder="e.g. Luzern"
                                            value={values.location}
                                            onChange={(e) => set("location", e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </>
                        )}
                        <Field label="Intakes">
                            <input
                                className={inputCls}
                                placeholder="e.g. JAN, MAY, SEPT"
                                value={values.intakes}
                                onChange={(e) => set("intakes", e.target.value)}
                            />
                        </Field>
                        <Field label="Tuition fees (before commission payable)">
                            <input
                                className={inputCls}
                                placeholder="e.g. Full fee or 1 year fee"
                                value={values.tuitionFees}
                                onChange={(e) => set("tuitionFees", e.target.value)}
                            />
                        </Field>
                    </>
                )}

                {/* ── Commissions tab ── */}
                {activeTab === "commissions" && (
                    <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                            Leave empty for course types not offered. Add one tier for a flat rate
                            (no label needed), or multiple tiers with labels like "1-5", "6-15", "16+".
                        </p>
                        {COURSE_TYPES.map((ct: CourseType) => (
                            <CommissionTierField
                                key={ct}
                                label={COURSE_TYPE_LABELS[ct]}
                                value={values[ct]}
                                onChange={(val) => set(ct, val)}
                            />
                        ))}
                    </div>
                )}

                {/* ── Notes tab ── */}
                {activeTab === "notes" && (
                    <>
                        <Field label="Additional bonus">
                            <input
                                className={inputCls}
                                placeholder="e.g. 3 or more students — 12% of net tuition"
                                value={values.additionalBonus}
                                onChange={(e) => set("additionalBonus", e.target.value)}
                            />
                        </Field>
                        <Field label="Course type restrictions">
                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={3}
                                placeholder="Any restrictions on course types..."
                                value={values.courseTypeRestrictions}
                                onChange={(e) => set("courseTypeRestrictions", e.target.value)}
                            />
                        </Field>
                        <Field label="Important notes to partner">
                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={5}
                                placeholder="Certificate (yr1) — 12.00%&#10;Diploma (yr2) — 6.40%..."
                                value={values.importantNotes}
                                onChange={(e) => set("importantNotes", e.target.value)}
                            />
                        </Field>
                    </>
                )}

                {error && (
                    <p className="text-xs text-destructive font-medium border border-destructive/20 bg-destructive/10 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting && (
                        <span className="w-3.5 h-3.5 border-2 border-card/30 border-t-white rounded-full animate-spin" />
                    )}
                    {mode === "create" ? "Create commission" : "Save changes"}
                </button>
            </div>
        </form>
    );
};