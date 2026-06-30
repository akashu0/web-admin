import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, FileText, Star, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../../components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { libraryService } from '../../services/libraryService';
import { LIBRARY_CATEGORIES, LIBRARY_LEVELS, type ILibraryResource } from '../../types/library';

const emptyForm = {
    title: '', description: '', category: '', academicLevel: '',
    type: '', author: '', rating: '', featured: false,
};

export const LibraryPage = () => {
    const [resources, setResources] = useState<ILibraryResource[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({ ...emptyForm });
    const [file, setFile] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbPreview, setThumbPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const thumbRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchResources(); }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await libraryService.getAll();
            setResources(res.data);
        } catch {
            toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const set = (key: keyof typeof emptyForm, value: string | boolean) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const resetForm = () => {
        setForm({ ...emptyForm });
        setFile(null);
        setThumbnail(null);
        setThumbPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        if (thumbRef.current) thumbRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Title is required'); return; }
        if (!form.category) { toast.error('Please select a category'); return; }
        if (!form.academicLevel) { toast.error('Please select an academic level'); return; }

        const fd = new FormData();
        fd.append('title', form.title.trim());
        fd.append('category', form.category);
        fd.append('academicLevel', form.academicLevel);
        if (form.description.trim()) fd.append('description', form.description.trim());
        if (form.type.trim()) fd.append('type', form.type.trim());
        if (form.author.trim()) fd.append('author', form.author.trim());
        if (form.rating) fd.append('rating', form.rating);
        fd.append('featured', String(form.featured));
        if (file) fd.append('file', file);
        if (thumbnail) fd.append('thumbnail', thumbnail);

        try {
            setSubmitting(true);
            const res = await libraryService.create(fd);
            setResources(prev => [res.data, ...prev]);
            toast.success('Resource added');
            setShowForm(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to add resource');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const res = await libraryService.toggleStatus(id);
            setResources(prev => prev.map(r => r._id === id ? res.data : r));
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await libraryService.remove(deleteId);
            setResources(prev => prev.filter(r => r._id !== deleteId));
            toast.success('Resource deleted');
        } catch {
            toast.error('Failed to delete resource');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">eG Library</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Upload and manage study resources shown on the public eG Library page.
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus size={16} /> Add Resource
                </Button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-40 text-zinc-400">Loading...</div>
            ) : resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 border border-dashed border-zinc-200 rounded-xl text-zinc-400 gap-3">
                    <FileText size={40} strokeWidth={1.2} />
                    <p className="text-sm">No resources yet. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {resources.map(r => (
                        <div key={r._id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                            <div className="relative aspect-[2/1] bg-zinc-100">
                                {r.thumbnail
                                    ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-zinc-300"><FileText size={40} /></div>}
                                <div className="absolute top-2 right-2 flex gap-1">
                                    {r.featured && <Badge className="bg-purple-600 hover:bg-purple-600">Featured</Badge>}
                                    <Badge variant={r.status === 'active' ? 'default' : 'secondary'} className={r.status === 'active' ? 'bg-green-600 hover:bg-green-600' : ''}>
                                        {r.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-4 flex flex-col gap-1 flex-1">
                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 uppercase tracking-wide">
                                    <span className="text-purple-600 font-semibold">{r.category}</span>
                                    <span>• {r.academicLevel}</span>
                                </div>
                                <p className="font-medium text-sm text-zinc-800 truncate">{r.title}</p>
                                {r.author && <p className="text-xs text-zinc-500 truncate">{r.author}</p>}
                                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                                    {typeof r.rating === 'number' && r.rating > 0 && (
                                        <span className="flex items-center gap-1 text-amber-500"><Star size={12} fill="currentColor" /> {r.rating}</span>
                                    )}
                                    <span className="flex items-center gap-1"><Download size={12} /> {r.downloadCount}</span>
                                    {r.fileUrl
                                        ? <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">file</a>
                                        : <span className="text-red-400">no file</span>}
                                </div>
                            </div>

                            <div className="px-4 pb-4 flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleToggle(r._id)}>
                                    {r.status === 'active'
                                        ? <><ToggleRight size={15} className="text-green-600" /> Deactivate</>
                                        : <><ToggleLeft size={15} /> Activate</>}
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100" onClick={() => setDeleteId(r._id)}>
                                    <Trash2 size={15} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Dialog */}
            <Dialog open={showForm} onOpenChange={open => { setShowForm(open); if (!open) resetForm(); }}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Library Resource</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label>Title <span className="text-red-500">*</span></Label>
                            <Input placeholder="e.g. IELTS 2026 Prep Guide" value={form.title} onChange={e => set('title', e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Category <span className="text-red-500">*</span></Label>
                                <Select value={form.category} onValueChange={v => set('category', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {LIBRARY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Academic Level <span className="text-red-500">*</span></Label>
                                <Select value={form.academicLevel} onValueChange={v => set('academicLevel', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {LIBRARY_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea placeholder="Short summary of the resource..." value={form.description} onChange={e => set('description', e.target.value)} />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label>Type</Label>
                                <Input placeholder="PDF Guide" value={form.type} onChange={e => set('type', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Author</Label>
                                <Input placeholder="eduGuardian" value={form.author} onChange={e => set('author', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Rating</Label>
                                <Input type="number" step="0.1" min="0" max="5" placeholder="4.8" value={form.rating} onChange={e => set('rating', e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
                            <div>
                                <Label className="cursor-pointer">Featured</Label>
                                <p className="text-xs text-zinc-400">Show in "Handpicked for You"</p>
                            </div>
                            <Switch checked={form.featured} onCheckedChange={v => set('featured', v)} />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Resource File</Label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*,video/*"
                                    className="block w-full text-xs text-zinc-600 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-zinc-900 file:text-white"
                                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                                />
                                <p className="text-[11px] text-zinc-400">Needed for View/Download to work.</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Cover Image</Label>
                                <input
                                    ref={thumbRef}
                                    type="file"
                                    accept="image/*"
                                    className="block w-full text-xs text-zinc-600 file:mr-2 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-zinc-900 file:text-white"
                                    onChange={e => {
                                        const f = e.target.files?.[0] ?? null;
                                        setThumbnail(f);
                                        setThumbPreview(f ? URL.createObjectURL(f) : null);
                                    }}
                                />
                                {thumbPreview && <img src={thumbPreview} alt="preview" className="mt-1 rounded-md max-h-20 object-cover" />}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Resource'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm */}
            <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently deletes the resource and its files from Cloudinary. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
