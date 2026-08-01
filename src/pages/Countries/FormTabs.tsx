// components/CountryForm/FormTabs.tsx
import { cn } from '@/lib/utils';

type TabType = 'basic' | 'costs' | 'references';

interface Tab {
    id: TabType;
    label: string;
}

interface FormTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TABS: Tab[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'costs', label: 'Cost of Living' },
    { id: 'references', label: 'References' },
];

export function FormTabs({ activeTab, onTabChange }: FormTabsProps) {
    return (
        <div className="border-b border-border bg-muted/40 px-6">
            <div className="flex gap-2 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-colors',
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
