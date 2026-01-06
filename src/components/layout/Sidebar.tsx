import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    FileText,
    School,
    LogOut,
    HelpCircle,
    Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'Courses', href: '/courses' },
    { icon: GraduationCap, label: 'Universities', href: '/universities' },
    { icon: Globe, label: 'Countries', href: '/countries' },
    { icon: FileText, label: 'Visas', href: '/visas' },
    { icon: School, label: 'Learning Centers', href: '/learning-centers' },
    { icon: HelpCircle, label: 'FAQs', href: '/faqs' },
];

export const Sidebar = () => {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    return (
        <div className="h-screen w-64 bg-white  text-black flex flex-col border-r border-zinc-200">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight">eduGuardian</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 ">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.href);

                    return (
                        <Link key={item.href} to={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 mb-1 cursor-pointer",
                                    isActive
                                        ? "bg-black text-white hover:bg-zinc-800 hover:text-white"
                                        : "text-zinc-500 hover:text-black hover:bg-zinc-100"
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-200">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                    onClick={logout}
                >
                    <LogOut size={20} />
                    Logout
                </Button>
            </div>
        </div>
    );
};
