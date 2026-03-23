import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    FileText,
    School,
    LogOut,
    HelpCircle,
    ChevronDown,
    Percent,
    Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/authStore';
import React from 'react';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: BookOpen, label: 'Courses', href: '/courses' },
    {
        icon: GraduationCap,
        label: 'Universities',
        href: '/universities',
        // Add submenus here
        subMenus: [
            { icon: GraduationCap, label: 'Universities', href: '/universities' },
            { icon: Percent, label: 'Commission', href: '/universities/commission' },
        ]
    },
    { icon: Globe, label: 'Countries', href: '/countries' },
    { icon: FileText, label: 'Visas', href: '/visas' },
    { icon: School, label: 'Learning Centers', href: '/learning-centers' },
    { icon: HelpCircle, label: 'FAQs', href: '/faqs' },
    { icon: FileText, label: 'Enquiries', href: '/enquiries' },
];

export const Sidebar = () => {
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);

    // Manage which submenus are open (defaulting Universities to open if active)
    const [openMenus, setOpenMenus] = React.useState<string[]>(
        location.pathname.includes('/universities') ? ['Universities'] : []
    );

    const toggleMenu = (label: string) => {
        setOpenMenus(prev =>
            prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
        );
    };

    return (
        <div className="h-screen w-64 bg-white text-black flex flex-col border-r border-zinc-200">
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight">eduGuardian</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href || (item.subMenus && location.pathname.startsWith(item.href));
                    const isMenuOpen = openMenus.includes(item.label);

                    return (
                        <div key={item.label} className="flex flex-col">
                            {/* Main Item */}
                            {item.subMenus ? (
                                <Button
                                    variant="ghost"
                                    onClick={() => toggleMenu(item.label)}
                                    className={cn(
                                        "w-full justify-between gap-3 mb-1 cursor-pointer",
                                        isActive && !isMenuOpen ? "bg-zinc-100 text-black" : "text-zinc-500 hover:text-black"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={20} />
                                        {item.label}
                                    </div>
                                    <ChevronDown size={16} className={cn("transition-transform", isMenuOpen && "rotate-180")} />
                                </Button>
                            ) : (
                                <Link to={item.href}>
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
                            )}

                            {/* Submenu Rendering */}
                            {item.subMenus && isMenuOpen && (
                                <div className="ml-4 pl-4 border-l border-zinc-100 flex flex-col gap-1 mb-2">
                                    {item.subMenus.map((sub) => {
                                        const SubIcon = sub.icon;
                                        const isSubActive = location.pathname === sub.href;
                                        return (
                                            <Link key={sub.href} to={sub.href}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={cn(
                                                        "w-full justify-start gap-3 h-9 cursor-pointer text-sm",
                                                        isSubActive
                                                            ? "bg-zinc-100 text-black font-medium"
                                                            : "text-zinc-400 hover:text-black hover:bg-zinc-50"
                                                    )}
                                                >
                                                    <SubIcon size={16} />
                                                    {sub.label}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
