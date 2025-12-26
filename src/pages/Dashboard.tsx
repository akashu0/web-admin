export const Dashboard = () => {
    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Total Courses</div>
                    <div className="text-2xl font-bold">12</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Universities</div>
                    <div className="text-2xl font-bold">24</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Active Visas</div>
                    <div className="text-2xl font-bold">145</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium">Learning Centers</div>
                    <div className="text-2xl font-bold">8</div>
                </div>
            </div>
        </div>
    );
};
