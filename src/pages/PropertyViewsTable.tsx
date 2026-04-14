import { useEffect, useState } from 'react';
import { apiClient } from '@/services/api';

interface PropertyView {
    _id: string;
    ip: string;
    userAgent: string;
    referer: string;
    host: string;
    origin: string;
    acceptLanguage: string;
    page: string;
    referrer: string;
    browserLanguage: string;
    screenResolution: string;
    timezone: string;
    timestamp: string;
    country: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    isp: string;
    createdAt: string;
}

export default function PropertyViewsTable() {
    const [views, setViews] = useState<PropertyView[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiClient.get(`/properties/views`);
                setViews(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = views?.filter(v =>
        v.ip?.includes(search) ||
        v.page?.toLowerCase().includes(search.toLowerCase()) ||
        v.timezone?.toLowerCase().includes(search.toLowerCase()) ||
        v.city?.toLowerCase().includes(search.toLowerCase()) ||
        v.country?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const parseDevice = (ua: string) => {
        if (/mobile/i.test(ua)) return '📱 Mobile';
        if (/tablet/i.test(ua)) return '📟 Tablet';
        return '🖥️ Desktop';
    };

    const parseBrowser = (ua: string) => {
        if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome';
        if (/firefox/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
        if (/edg/i.test(ua)) return 'Edge';
        return 'Other';
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-500">
            Loading visitor data...
        </div>
    );

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Property Page Visitors</h1>
                    <p className="text-sm text-gray-500 mt-1">{views?.length} total visits recorded</p>
                </div>
                <input
                    type="text"
                    placeholder="Search by IP, page, city, country..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Date & Time</th>
                            <th className="px-4 py-3">IP Address</th>
                            <th className="px-4 py-3">Device</th>
                            <th className="px-4 py-3">Browser</th>
                            <th className="px-4 py-3">Location</th>
                            <th className="px-4 py-3">Coordinates</th>
                            <th className="px-4 py-3">ISP</th>
                            <th className="px-4 py-3">Page</th>
                            <th className="px-4 py-3">Referrer</th>
                            <th className="px-4 py-3">Screen</th>
                            <th className="px-4 py-3">Timezone</th>
                            <th className="px-4 py-3">Language</th>
                            <th className="px-4 py-3">Origin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered?.length === 0 ? (
                            <tr>
                                <td colSpan={14} className="text-center py-10 text-gray-400">
                                    No records found
                                </td>
                            </tr>
                        ) : (
                            filtered?.map((v, i) => (
                                <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                        {formatDate(v.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-blue-600">{v.ip || '—'}</td>
                                    <td className="px-4 py-3">{parseDevice(v.userAgent)}</td>
                                    <td className="px-4 py-3">{parseBrowser(v.userAgent)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {v.city || v.region || v.country ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-700">
                                                    {[v.city, v.region].filter(Boolean).join(', ')}
                                                </span>
                                                <span className="text-xs text-gray-400">{v.country || '—'}</span>
                                            </div>
                                        ) : '—'}
                                    </td>
                                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
    {v.latitude && v.longitude ? (
        <a
            href={`https://maps.google.com/?q=${v.latitude},${v.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:underline"
        >
            {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
        </a>
    ) : '—'}
</td>
                                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate" title={v.isp}>
                                        {v.isp || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 max-w-[150px] truncate" title={v.page}>
                                        {v.page || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate" title={v.referrer}>
                                        {v.referrer || <span className="text-gray-300">Direct</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{v.screenResolution || '—'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{v.timezone || '—'}</td>
                                    <td className="px-4 py-3">{v.browserLanguage || '—'}</td>
                                    <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate" title={v.origin}>
                                        {v.origin || '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}