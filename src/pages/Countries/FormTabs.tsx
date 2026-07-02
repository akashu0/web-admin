// components/CountryForm/FormTabs.tsx

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
        <div className="border-b bg-gray-50 px-6">
            <div className="flex gap-2 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-3 font-medium text-sm cursor-pointer whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}