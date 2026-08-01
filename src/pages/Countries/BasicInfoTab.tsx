// components/CountryForm/tabs/BasicInfoTab.tsx
import { Image as ImageIcon, X } from 'lucide-react';
import type { RefObject } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { generateSlug, type CountryFormValues } from './country-form-values';

interface BasicInfoTabProps {
    form: UseFormReturn<CountryFormValues>;
    bannerPreview: string;
    bannerInputRef: RefObject<HTMLInputElement | null>;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}

const CONTINENTS = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

const Required = () => <span className="text-destructive">*</span>;

export function BasicInfoTab({
    form,
    bannerPreview,
    bannerInputRef,
    onImageUpload,
    onRemoveImage,
}: BasicInfoTabProps) {
    const { register, setValue, watch } = form;

    return (
        <div className="space-y-6">
            <h3 className="text-h3 font-semibold">Basic Information</h3>

            {/* Banner Upload */}
            <div>
                <Label className="mb-2 block">Country Banner</Label>
                <div className="rounded-lg border-2 border-dashed border-input p-4 text-center transition-colors hover:border-primary/50">
                    {bannerPreview ? (
                        <div className="relative">
                            <img
                                src={bannerPreview}
                                alt="Banner preview"
                                className="h-32 w-full rounded object-cover"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                className="absolute right-2 top-2 size-7 rounded-full"
                                onClick={() => onRemoveImage()}
                            >
                                <X className="size-4" />
                            </Button>
                        </div>
                    ) : (
                        <div onClick={() => bannerInputRef.current?.click()} className="cursor-pointer">
                            <ImageIcon className="mx-auto mb-2 size-12 text-muted-foreground" />
                            <p className="text-muted-foreground">Click to upload banner</p>
                            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            <p className="mt-1 text-xs font-medium text-primary">
                                Required image ratio: 16:9 (e.g., 1280 x 720 px)
                            </p>
                        </div>
                    )}
                    <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="country-name">Country Name <Required /></Label>
                    <Input
                        id="country-name"
                        placeholder="e.g., United States"
                        {...register('name', {
                            // Typing the name keeps the slug in step; it stays editable below.
                            onChange: (e) => setValue('slug', generateSlug(e.target.value)),
                        })}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="country-slug">Slug <Required /></Label>
                    <Input
                        id="country-slug"
                        placeholder="e.g., united-states"
                        {...register('slug', {
                            onChange: (e) =>
                                setValue('slug', e.target.value.toLowerCase().replace(/\s+/g, '-')),
                        })}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="country-capital">Capital <Required /></Label>
                    <Input
                        id="country-capital"
                        placeholder="e.g., Washington, D.C."
                        {...register('capital')}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label>Continent <Required /></Label>
                    <Select
                        value={watch('continent') || undefined}
                        onValueChange={(v) => setValue('continent', v)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Continent" />
                        </SelectTrigger>
                        <SelectContent>
                            {CONTINENTS.map((continent) => (
                                <SelectItem key={continent} value={continent}>
                                    {continent}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="country-currency">Currency <Required /></Label>
                    <Input
                        id="country-currency"
                        placeholder="e.g., USD"
                        maxLength={3}
                        {...register('currency', {
                            onChange: (e) => setValue('currency', e.target.value.toUpperCase()),
                        })}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="country-languages">Spoken Languages <Required /></Label>
                    <Input
                        id="country-languages"
                        placeholder="e.g., English"
                        {...register('spokenLanguages')}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="country-population">Population</Label>
                    <Input
                        id="country-population"
                        type="number"
                        min="0"
                        placeholder="e.g., 331000000"
                        onWheel={(e) => e.currentTarget.blur()}
                        {...register('population')}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="country-about">About <Required /></Label>
                <Textarea
                    id="country-about"
                    placeholder="Brief description about the country..."
                    rows={4}
                    {...register('about')}
                    required
                />
            </div>

            <div className="space-y-1.5">
                <Label>Status <Required /></Label>
                <Select
                    value={watch('status')}
                    onValueChange={(v) => setValue('status', v as 'draft' | 'published')}
                >
                    <SelectTrigger className="w-full md:w-64">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
