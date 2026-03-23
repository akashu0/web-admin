import { useEffect, useState } from "react";
import { CommissionForm } from "./Commissionform";
import { CommissionTierDisplay } from "./Commissiontierdisplay";
import {
    COURSE_TYPES,
    COURSE_TYPE_LABELS,
    type PartnerCommission,
    type CommissionFormValues,
    type CourseType,
} from "../../../types/commission";
import { apiClient } from "@/services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type DrawerMode = "view" | "create" | "edit" | "bulk";

interface Props {
    mode: DrawerMode;
    commission?: PartnerCommission | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (values: CommissionFormValues) => Promise<void>;
    onBulkUpload?: (records: unknown[]) => Promise<void>;
    isSubmitting?: boolean;
}

// ── Drawer titles ─────────────────────────────────────────────────────────────

const TITLES: Record<DrawerMode, string> = {
    view: "Commission details",
    create: "Add commission",
    edit: "Edit commission",
    bulk: "Bulk upload",
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
                        <h2 className="text-lg font-bold text-zinc-900 leading-tight">
                            {commission.universityName}
                        </h2>
                        {(commission.location || commission.country) && (
                            <p className="text-sm text-zinc-400 mt-0.5 font-mono">
                                {[commission.location, commission.country].filter(Boolean).join(", ")}
                            </p>
                        )}
                    </div>
                    {commission.universityRef ? (
                        <span className="shrink-0 text-[10px] font-semibold tracking-widest uppercase bg-zinc-900 text-white px-2.5 py-1 rounded-sm">
                            Linked
                        </span>
                    ) : (
                        <span className="shrink-0 text-[10px] font-semibold tracking-widest uppercase border border-zinc-200 text-zinc-400 px-2.5 py-1 rounded-sm">
                            Standalone
                        </span>
                    )}
                </div>
            </div>

            {/* Commission grid */}
            {offeredTypes.length > 0 ? (
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-3">
                        Commission rates
                    </p>
                    <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                        {offeredTypes.map((ct: CourseType) => (
                            <div
                                key={ct}
                                className="grid grid-cols-[140px_1fr] items-start px-4 py-3 bg-white hover:bg-zinc-50 transition-colors"
                            >
                                <span className="text-xs font-semibold text-zinc-500 pt-0.5">
                                    {COURSE_TYPE_LABELS[ct]}
                                </span>
                                <CommissionTierDisplay tier={commission[ct]} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-zinc-400 italic">No commission rates configured.</p>
            )}

            {/* Additional bonus */}
            {commission.additionalBonus && (
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-2">
                        Additional bonus
                    </p>
                    <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                        {commission.additionalBonus}
                    </p>
                </div>
            )}

            {/* Important notes */}
            {commission.importantNotes && (
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400 mb-2">
                        Important notes
                    </p>
                    <p className="text-sm text-zinc-700 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 whitespace-pre-line leading-relaxed">
                        {commission.importantNotes}
                    </p>
                </div>
            )}

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3">
                {commission.intakes && (
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mb-1">
                            Intakes
                        </p>
                        <p className="text-sm font-mono text-zinc-900">{commission.intakes}</p>
                    </div>
                )}
                {commission.tuitionFees && (
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mb-1">
                            Tuition fees
                        </p>
                        <p className="text-sm font-mono text-zinc-900">{commission.tuitionFees}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Bulk upload panel ─────────────────────────────────────────────────────────

const BulkUploadView = ({
    onBulkUpload,
    isSubmitting,
    onClose,
}: {
    onBulkUpload: (records: unknown[]) => Promise<void>;
    isSubmitting: boolean;
    onClose: () => void;
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [parsed, setParsed] = useState<unknown[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const ACCEPTED = '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';

    const handleFile = (f: File) => {
        setError(null);
        setParsed(null);
        setSuccess(null);
        setFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleUpload = async () => {
        if (!file) return;
        setError(null);
        setUploading(true);
        try {
            // Send file directly — backend parses xlsx/csv
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiClient.post('/partner-commissions/bulk/file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccess(
                `Upload complete — ${res.data.upserted} created, ${res.data.modified} updated.`
            );
            setFile(null);
        } catch (err: any) {
            setError(err?.response?.data?.message ?? (err as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const isLoading = isSubmitting || uploading;


    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Drop zone */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => document.getElementById('bulk-file-input')?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                        }`}
                >
                    <div className="text-3xl mb-2">{file ? '📄' : '↑'}</div>
                    {file ? (
                        <>
                            <p className="text-sm font-semibold text-zinc-900">{file.name}</p>
                            <p className="text-xs text-zinc-400 mt-1">
                                {(file.size / 1024).toFixed(1)} KB — click to change
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-zinc-700">
                                Click or drop file here
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                                Accepts <span className="font-mono">.xlsx</span>,{' '}
                                <span className="font-mono">.xls</span>,{' '}
                                <span className="font-mono">.csv</span>
                            </p>
                        </>
                    )}
                    <input
                        id="bulk-file-input"
                        type="file"
                        accept={ACCEPTED}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </div>

                {/* Expected columns */}
                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100">
                        <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400">
                            Required column headers
                        </span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-1.5">
                        {[
                            'SN', 'University', 'Location', 'Country',
                            'Bachelors', 'Masters', 'Certifications/ PS',
                            'Diploma/FO', 'PG Diploma', 'PhD',
                            'Additional Bonus', 'Course Type Restrictions',
                            'Important notes to partner',
                            'Tuition Fees - to be paid before Commission becomes payable',
                            'Intakes',
                        ].map((col) => (
                            <span
                                key={col}
                                className="text-[11px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded"
                            >
                                {col}
                            </span>
                        ))}
                    </div>
                </div>

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
                {success && (
                    <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        {success}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100">
                <button
                    onClick={onClose}
                    className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors font-medium"
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpload}
                    disabled={!file || isLoading}
                    className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLoading && (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {isLoading ? 'Uploading...' : `Upload${file ? ` "${file.name}"` : ''}`}
                </button>
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
    onBulkUpload,
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
                className={`fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 shrink-0">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-900">
                        {TITLES[mode]}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors text-xl leading-none"
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
                                    ? {
                                        universityName: commission.universityName,
                                        location: commission.location ?? "",
                                        country: commission.country ?? "",
                                        additionalBonus: commission.additionalBonus ?? "",
                                        importantNotes: commission.importantNotes ?? "",
                                        courseTypeRestrictions: commission.courseTypeRestrictions ?? "",
                                        tuitionFees: commission.tuitionFees ?? "",
                                        intakes: commission.intakes ?? "",
                                    }
                                    : undefined
                            }
                            onSubmit={onSubmit}
                            onCancel={onClose}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {mode === "bulk" && onBulkUpload && (
                        <BulkUploadView
                            onBulkUpload={onBulkUpload}
                            isSubmitting={isSubmitting}
                            onClose={onClose}
                        />
                    )}
                </div>
            </div>
        </>
    );
};