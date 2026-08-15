import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Radix rejects "" as an item value, so "no filter" needs a sentinel. Every
// list page had its own copy of that dance; it lives here now, with the
// undefined⇄sentinel conversion in one place instead of ten.
const ALL = "__all__";

export function FilterSelect({
    label,
    value,
    onChange,
    options,
    allLabel = "All",
    className = "w-[170px]",
    disabled,
}: {
    label: string;
    value?: string;
    onChange: (value: string | undefined) => void;
    /** Either plain strings, or {value,label} when the two differ. */
    options: readonly (string | { value: string; label: string })[];
    allLabel?: string;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Select
                value={value ?? ALL}
                onValueChange={(next) => onChange(next === ALL ? undefined : next)}
                disabled={disabled}
            >
                <SelectTrigger className={className}>
                    <SelectValue placeholder={allLabel} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                    <SelectItem value={ALL}>{allLabel}</SelectItem>
                    {options.map((option) => {
                        const { value: v, label: l } =
                            typeof option === "string" ? { value: option, label: option } : option;
                        return (
                            <SelectItem key={v} value={v}>
                                {l}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    );
}
