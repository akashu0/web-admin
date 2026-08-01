import { BookMarked, BookOpen, FileText, GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';

// ponytail: counts are still hardcoded placeholders — swap for the list
// endpoints' pagination totals (they already return `total`) when the dashboard
// gets real numbers.
const STATS = [
    { icon: BookOpen, label: 'Total Courses', value: 12 },
    { icon: GraduationCap, label: 'Universities', value: 24 },
    { icon: FileText, label: 'Active Visas', value: 145 },
    { icon: BookMarked, label: 'Learning Centers', value: 8 },
];

export const Dashboard = () => {
    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Content published across the eduGuardian surfaces"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => (
                    <StatCard
                        key={stat.label}
                        icon={stat.icon}
                        value={stat.value}
                        label={stat.label}
                    />
                ))}
            </div>
        </div>
    );
};
