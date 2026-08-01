import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { PageHeader } from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/PageLoader';
import { EmptyState } from '../../components/common/states';
import { popupBannerService } from '../../services/popupBannerService';
import type { IPopupBanner } from '../../types/popupBanner';

export const PopupBannerPage = () => {
    const [banners, setBanners] = useState<IPopupBanner[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const res = await popupBannerService.getAll();
            setBanners(res.data);
        } catch {
            toast.error('Failed to load banners');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setTitle('');
        setLinkUrl('');
        setImageFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            toast.error('Please select a banner image');
            return;
        }
        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', title.trim());
        if (linkUrl.trim()) formData.append('linkUrl', linkUrl.trim());

        try {
            setSubmitting(true);
            const res = await popupBannerService.create(formData);
            setBanners(prev => [res.data, ...prev]);
            toast.success('Banner uploaded successfully');
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to upload banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const current = banners.find(b => b._id === id);
            const res = await popupBannerService.setActive(id, !current?.isActive);
            setBanners(prev => prev.map(b => b._id === id ? res.data : b));
            toast.success('Banner status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await popupBannerService.remove(deleteId);
            setBanners(prev => prev.filter(b => b._id !== deleteId));
            toast.success('Banner deleted');
        } catch {
            toast.error('Failed to delete banner');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div>
            <PageHeader
                title="Popup Banners"
                subtitle="Manage homepage popup banners. The most recent active banner is shown to website visitors."
                actions={
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                        <Plus size={16} />
                        Upload Banner
                    </Button>
                }
            />

            {/* Banner Grid */}
            {loading ? (
                <PageLoader />
            ) : banners.length === 0 ? (
                <EmptyState
                    icon={<ImageIcon size={32} strokeWidth={1.2} />}
                    title="No banners yet"
                    description="Upload one to get started."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {banners.map(banner => (
                        <div
                            key={banner._id}
                            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
                        >
                            <div className="relative aspect-[2/1] bg-muted">
                                <img
                                    src={banner.imageUrl}
                                    alt={banner.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <Badge
                                        tone={banner.isActive ? "green" : "neutral"}
                                        className={banner.isActive ? 'bg-primary text-primary-foreground' : ''}
                                    >
                                        {banner.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col gap-2 flex-1">
                                <p className="font-medium text-sm text-foreground truncate">{banner.title}</p>
                                {banner.linkUrl && (
                                    <a
                                        href={banner.linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                                    >
                                        <ExternalLink size={12} />
                                        {banner.linkUrl}
                                    </a>
                                )}
                                <p className="text-xs text-muted-foreground mt-auto">
                                    {new Date(banner.createdAt).toLocaleDateString('en-GB', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div className="px-4 pb-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 gap-2"
                                    onClick={() => handleToggle(banner._id)}
                                >
                                    {banner.isActive
                                        ? <><ToggleRight size={15} className="text-primary" /> Deactivate</>
                                        : <><ToggleLeft size={15} /> Activate</>
                                    }
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                    onClick={() => setDeleteId(banner._id)}
                                >
                                    <Trash2 size={15} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Dialog */}
            <Dialog open={showForm} onOpenChange={open => { setShowForm(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Popup Banner</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                            <Input
                                id="title"
                                placeholder="e.g. Summer Intake 2025"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="linkUrl">Link URL <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                                id="linkUrl"
                                placeholder="https://myeduguardian.com/..."
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="image">Banner Image <span className="text-destructive">*</span></Label>
                            <div
                                className="border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-input transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full rounded-md object-cover max-h-44"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-2 py-4 text-muted-foreground">
                                        <ImageIcon size={32} strokeWidth={1.2} />
                                        <p className="text-sm">Click to select image</p>
                                        <p className="text-xs">JPG, PNG, WEBP up to 5MB</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                id="image"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => { setShowForm(false); resetForm(); }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? 'Uploading...' : 'Upload Banner'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the banner and remove it from Cloudinary. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
