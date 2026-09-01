"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Edit, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useSectionGuard } from '@/hooks/use-unsaved-changes';
import { egAcademyCourseService } from '@/services/egAcademyCourseService';
import {
  CONTINENT_OPTIONS,
  TUITION_FEE_TYPES,
  SCHOLARSHIP_PERCENTAGES,
  CURRENCY_OPTIONS,
} from '@/types/egAcademyCourse';
import type { EgAcademyLearningCenter, EgAcademyFeeStructure, EgAcademyOtherFee } from '@/types/egAcademyCourse';

// ── Constants ─────────────────────────────────────────────────────────────────

const FEE_FIELDS: { key: keyof EgAcademyFeeStructure; label: string }[] = [
  { key: 'tuitionFee', label: 'Tuition Fee' },
  { key: 'applicationFee', label: 'Application Fee' },
  { key: 'admissionFee', label: 'Admission Fee' },
  { key: 'visaFee', label: 'Visa Fee' },
  { key: 'administrationFee', label: 'Administration Fee' },
  { key: 'accommodationFee', label: 'Accommodation Fee' },
  { key: 'transportationFee', label: 'Transportation Fee' },
  { key: 'assessmentFee', label: 'Assessment Fee' },
  { key: 'examFee', label: 'Exam Fee' },
];

const EMPTY_FEE: EgAcademyFeeStructure = {
  tuitionFeeType: undefined,
  scholarshipPercentage: 'Not Applicable',
  currency: '',
  tuitionFee: 0,
  applicationFee: 0,
  admissionFee: 0,
  visaFee: 0,
  administrationFee: 0,
  accommodationFee: 0,
  transportationFee: 0,
  assessmentFee: 0,
  examFee: 0,
  otherFees: [],
};

const EMPTY_CENTER: Omit<EgAcademyLearningCenter, '_id'> = {
  city: '',
  country: '',
  continent: '',
  feeStructure: { ...EMPTY_FEE },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface EgAcademyLearningCentersSectionProps {
  slug: string;
  learningCenters: EgAcademyLearningCenter[];
  onRefresh: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EgAcademyLearningCentersSection({
  slug,
  learningCenters,
  onRefresh,
}: EgAcademyLearningCentersSectionProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingCenterId, setEditingCenterId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<EgAcademyLearningCenter, '_id'>>({ ...EMPTY_CENTER, feeStructure: { ...EMPTY_FEE } });
  const [otherFees, setOtherFees] = useState<(EgAcademyOtherFee & { id: string })[]>([]);
  const [newFeeName, setNewFeeName] = useState('');

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setField = (key: keyof Omit<EgAcademyLearningCenter, '_id' | 'feeStructure'>, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const setFeeField = <K extends keyof EgAcademyFeeStructure>(key: K, value: EgAcademyFeeStructure[K]) => {
    setFormData(prev => ({
      ...prev,
      feeStructure: { ...(prev.feeStructure ?? EMPTY_FEE), [key]: value },
    }));
  };

  const handleNumberInput = (value: string): number => {
    const n = parseFloat(value);
    return isNaN(n) || n < 0 ? 0 : n;
  };

  const addOtherFee = () => {
    if (!newFeeName.trim()) return;
    setOtherFees(prev => [
      ...prev,
      { id: `fee_${Date.now()}`, fieldName: newFeeName.trim(), fieldValue: '', order: prev.length },
    ]);
    setNewFeeName('');
  };

  const updateOtherFee = (id: string, value: string) => {
    setOtherFees(prev => prev.map(f => f.id === id ? { ...f, fieldValue: value } : f));
  };

  const removeOtherFee = (id: string) => {
    setOtherFees(prev => prev.filter(f => f.id !== id));
  };

  const resetForm = () => {
    setFormData({ ...EMPTY_CENTER, feeStructure: { ...EMPTY_FEE } });
    setOtherFees([]);
    setNewFeeName('');
    setEditingCenterId(null);
    setIsAddingNew(false);
  };

  const buildPayload = (): Omit<EgAcademyLearningCenter, '_id'> => ({
    ...formData,
    feeStructure: {
      ...formData.feeStructure,
      otherFees: otherFees.map(({ id: _id, ...rest }) => rest),
    },
  });

  const calculateTotal = (fee?: EgAcademyFeeStructure): number => {
    if (!fee) return 0;
    const keys: (keyof EgAcademyFeeStructure)[] = [
      'tuitionFee', 'applicationFee', 'admissionFee', 'visaFee',
      'administrationFee', 'accommodationFee', 'transportationFee',
      'assessmentFee', 'examFee',
    ];
    let total = keys.reduce((sum, k) => sum + ((fee[k] as number) || 0), 0);
    fee.otherFees?.forEach(f => {
      const n = parseFloat(f.fieldValue);
      if (!isNaN(n)) total += n;
    });
    return total;
  };

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * A centre being added or edited is unsaved work like any other form, so it
   * registers with the guard: the open editor is what `value` tracks, and
   * saving it is whichever of add/update is open.
   */
  useSectionGuard({
    id: 'academyCourse.learningCenters',
    label: editingCenterId ? 'Learning Centre (editing)' : 'Learning Centre (new)',
    value: isAddingNew || editingCenterId ? { formData, otherFees } : null,
    onSave: () => (editingCenterId ? handleUpdateCenter() : handleAddCenter()),
    onRestore: () => resetForm(),
  });

  const handleAddCenter = async () => {
    if (!formData.city || !formData.country || !formData.continent) {
      throw new Error('City, Country, and Continent are required');
    }
    try {
      setIsSaving(true);
      await egAcademyCourseService.addLearningCenter(slug, buildPayload());
      toast.success('Learning center added successfully');
      resetForm();
      onRefresh();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add learning center');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCenter = async () => {
    if (!editingCenterId) return;
    if (!formData.city || !formData.country || !formData.continent) {
      throw new Error('City, Country, and Continent are required');
    }
    try {
      setIsSaving(true);
      await egAcademyCourseService.updateLearningCenter(slug, editingCenterId, buildPayload());
      toast.success('Learning center updated successfully');
      resetForm();
      onRefresh();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update learning center');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCenter = async (centerId: string) => {
    if (!window.confirm('Delete this learning center?')) return;
    try {
      await egAcademyCourseService.deleteLearningCenter(slug, centerId);
      toast.success('Learning center deleted');
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete learning center');
    }
  };

  const startEdit = (center: EgAcademyLearningCenter) => {
    const fee = center.feeStructure ?? { ...EMPTY_FEE };
    setFormData({
      city: center.city,
      country: center.country,
      continent: center.continent,
      feeStructure: { ...fee, otherFees: [] },
    });
    setOtherFees(
      (fee.otherFees ?? []).map((f, i) => ({ ...f, id: `fee_${i}_${Date.now()}` }))
    );
    setEditingCenterId(center._id!);
    setIsAddingNew(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Learning Centers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage learning centers and their fee structures for this course.
          </p>
        </div>
        {!isAddingNew && (
          <Button
            type="button"
            className="bg-primary hover:bg-primary"
            onClick={() => setIsAddingNew(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Learning Center
          </Button>
        )}
      </div>

      {/* Existing Centers */}
      {learningCenters.length > 0 && (
        <div className="space-y-3">
          {learningCenters.map((center) => {
            const id = center._id!;
            const isExpanded = expandedCards.has(id);
            const fee = center.feeStructure;
            const total = calculateTotal(fee);

            return (
              <Card key={id} className="p-4 bg-muted border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{center.city}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-foreground">{center.country}</span>
                      <span className="text-muted-foreground">/</span>
                      <Badge tone="red" className="text-xs">{center.continent}</Badge>
                    </div>

                    {fee && (
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        {fee.tuitionFeeType && (
                          <Badge className="bg-accent text-primary border-primary/30 text-xs">
                            {fee.tuitionFeeType}
                          </Badge>
                        )}
                        {fee.currency && (
                          <Badge tone="red" className="text-xs">{fee.currency}</Badge>
                        )}
                        {total > 0 && (
                          <span className="text-sm font-medium text-foreground">
                            Total: {fee.currency} {total.toLocaleString()}
                          </span>
                        )}
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          onClick={() => toggleExpand(id)}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3 w-3" /> Hide fees</>
                          ) : (
                            <><ChevronDown className="h-3 w-3" /> Show fees</>
                          )}
                        </button>
                      </div>
                    )}

                    {isExpanded && fee && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        {FEE_FIELDS.map(({ key, label }) => {
                          const val = fee[key] as number;
                          return val > 0 ? (
                            <div key={key}>
                              <span className="text-muted-foreground">{label}:</span>
                              <span className="ml-1 font-medium text-foreground">
                                {fee.currency} {val.toLocaleString()}
                              </span>
                            </div>
                          ) : null;
                        })}
                        {fee.otherFees?.map((f, i) =>
                          f.fieldValue ? (
                            <div key={i}>
                              <span className="text-muted-foreground">{f.fieldName}:</span>
                              <span className="ml-1 font-medium text-foreground">
                                {fee.currency} {f.fieldValue}
                              </span>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(center)}
                      disabled={isAddingNew && editingCenterId !== id}
                      className="text-primary hover:bg-accent"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCenter(id)}
                      disabled={isAddingNew}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {learningCenters.length === 0 && !isAddingNew && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
          <p className="text-sm">No learning centers added yet.</p>
          <p className="text-xs mt-1">Click "Add Learning Center" to get started.</p>
        </div>
      )}

      {/* Add / Edit Form */}
      {isAddingNew && (
        <Card className="p-6 border-2 border-border">
          <h3 className="font-semibold text-lg mb-6">
            {editingCenterId ? 'Edit Learning Center' : 'New Learning Center'}
          </h3>

          <div className="space-y-5">
            {/* Location fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>City *</Label>
                <Input
                  className="mt-2"
                  placeholder="e.g., London"
                  value={formData.city}
                  onChange={e => setField('city', e.target.value)}
                />
              </div>
              <div>
                <Label>Country *</Label>
                <Input
                  className="mt-2"
                  placeholder="e.g., United Kingdom"
                  value={formData.country}
                  onChange={e => setField('country', e.target.value)}
                />
              </div>
              <div>
                <Label>Continent *</Label>
                <Select
                  value={formData.continent}
                  onValueChange={v => setField('continent', v)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select continent" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {CONTINENT_OPTIONS.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fee Structure Divider */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-4">Fee Structure</h4>
            </div>

            {/* Tuition Fee Type + Scholarship */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Tuition Fee Type</Label>
                <Select
                  value={formData.feeStructure?.tuitionFeeType ?? ''}
                  onValueChange={v => setFeeField('tuitionFeeType', v as EgAcademyFeeStructure['tuitionFeeType'])}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {TUITION_FEE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scholarship Percentage</Label>
                <Select
                  value={formData.feeStructure?.scholarshipPercentage ?? 'Not Applicable'}
                  onValueChange={v => setFeeField('scholarshipPercentage', v)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {SCHOLARSHIP_PERCENTAGES.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Currency */}
            <div>
              <Label>Currency</Label>
              <Select
                value={formData.feeStructure?.currency ?? ''}
                onValueChange={v => setFeeField('currency', v)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-card max-h-60">
                  {CURRENCY_OPTIONS.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Standard Fee Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEE_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min="0"
                    className="mt-2"
                    placeholder="0"
                    value={
                      (formData.feeStructure?.[key] as number) === 0
                        ? ''
                        : (formData.feeStructure?.[key] as number) ?? ''
                    }
                    onChange={e =>
                      setFeeField(key, handleNumberInput(e.target.value) as any)
                    }
                  />
                </div>
              ))}
            </div>

            {/* Other Fees */}
            <div>
              <Label>Other Fees</Label>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Add any additional fees below</p>

              {otherFees.length > 0 && (
                <div className="space-y-2 mb-3">
                  {otherFees.map(fee => (
                    <div key={fee.id} className="flex items-center gap-2">
                      <span className="text-sm text-foreground w-40 shrink-0">{fee.fieldName}</span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="flex-1"
                        value={fee.fieldValue === '' ? '' : fee.fieldValue}
                        onChange={e => updateOtherFee(fee.id, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOtherFee(fee.id)}
                        className="text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Fee name (e.g. Library Fee)"
                  value={newFeeName}
                  onChange={e => setNewFeeName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOtherFee())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOtherFee}
                  disabled={!newFeeName.trim()}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-primary hover:bg-primary"
                onClick={() =>
                  void (editingCenterId ? handleUpdateCenter() : handleAddCenter()).catch(
                    (error: unknown) =>
                      toast.error(
                        error instanceof Error ? error.message : 'Could not save the learning centre',
                      ),
                  )
                }
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingCenterId ? (
                  'Update Center'
                ) : (
                  'Save Center'
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
