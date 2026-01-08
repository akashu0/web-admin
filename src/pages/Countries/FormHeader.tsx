// components/CountryForm/FormHeader.tsx
import { X } from 'lucide-react';

interface FormHeaderProps {
    title: string;
    onClose: () => void;
}

export function FormHeader({ title, onClose }: FormHeaderProps) {
    return (
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">
                {title}
            </h2>
            <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}