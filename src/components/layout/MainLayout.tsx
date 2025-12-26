import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
    return (
        <div className="min-h-screen bg-white text-black">
            {/* Fixed Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64">
                <Sidebar />
            </aside>

            {/* Scrollable Content */}
            <main className="ml-64 min-h-screen overflow-y-auto bg-zinc-50 p-8">
                <Outlet />
            </main>
        </div>
    );
};
