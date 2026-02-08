import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Filter, Download, Calendar, User, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: 'all',
        dateFrom: '',
        dateTo: '',
        searchTerm: ''
    });
    const [expandedId, setExpandedId] = useState(null);

    const actionTypes = [
        { value: 'all', label: 'All Actions', icon: '📋' },
        { value: 'application_submitted', label: 'Application Submitted', icon: '📝' },
        { value: 'application_approved', label: 'Application Approved', icon: '✅' },
        { value: 'enrollment_created', label: 'Enrollment Created', icon: '🎓' },
        { value: 'course_created', label: 'Course Created', icon: '📚' },
        { value: 'module_created', label: 'Module Created', icon: '📦' },
        { value: 'SYSTEM_BOOTSTRAP', label: 'System Bootstrap', icon: '🚀' }
    ];

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('audit_logs')
                .select('*, profiles!audit_logs_actor_id_fkey(full_name)')
                .order('created_at', { ascending: false })
                .limit(100);

            // Apply filters
            if (filters.action !== 'all') {
                query = query.eq('action', filters.action);
            }

            if (filters.dateFrom) {
                query = query.gte('created_at', new Date(filters.dateFrom).toISOString());
            }

            if (filters.dateTo) {
                const endDate = new Date(filters.dateTo);
                endDate.setHours(23, 59, 59, 999);
                query = query.lte('created_at', endDate.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;

            // Client-side search filter
            let filteredData = data || [];
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                filteredData = filteredData.filter(log =>
                    log.action.toLowerCase().includes(searchLower) ||
                    JSON.stringify(log.metadata).toLowerCase().includes(searchLower) ||
                    log.profiles?.full_name?.toLowerCase().includes(searchLower)
                );
            }

            setLogs(filteredData);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            alert('Error loading audit logs');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'Action', 'Actor', 'Entity Type', 'Entity ID', 'Metadata'];
        const rows = logs.map(log => [
            new Date(log.created_at).toLocaleString(),
            log.action,
            log.profiles?.full_name || 'System',
            log.entity_type || '',
            log.entity_id || '',
            JSON.stringify(log.metadata)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const getActionIcon = (action) => {
        const type = actionTypes.find(a => a.value === action);
        return type?.icon || '📋';
    };

    const getActionColor = (action) => {
        const lowAction = action.toLowerCase();
        if (lowAction.includes('approved') || lowAction.includes('created') || lowAction.includes('bootstrap')) return 'text-green-600 bg-green-50';
        if (lowAction.includes('rejected') || lowAction.includes('deleted')) return 'text-red-600 bg-red-50';
        if (lowAction.includes('submitted')) return 'text-blue-600 bg-blue-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">Audit Logs</h1>
                <p className="text-gray-500 font-medium">Track all system activities and administrative actions</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-gray-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">Filters</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Event Type Filter */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                            Action Type
                        </label>
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            className="w-full border border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-primary"
                        >
                            {actionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full border border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full border border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Search */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={filters.searchTerm}
                            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                            className="w-full border border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={() => setFilters({ eventType: 'all', dateFrom: '', dateTo: '', searchTerm: '' })}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={logs.length === 0}
                        className="px-4 py-2 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <div className="text-3xl font-black text-black mb-1">{logs.length}</div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Actions</div>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <div className="text-3xl font-black text-green-600 mb-1">
                        {logs.filter(l => l.action.toLowerCase().includes('approved')).length}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Approvals</div>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <div className="text-3xl font-black text-blue-600 mb-1">
                        {logs.filter(l => l.action.toLowerCase().includes('submitted')).length}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submissions</div>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                    <div className="text-3xl font-black text-purple-600 mb-1">
                        {logs.filter(l => l.action.toLowerCase().includes('created')).length}
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Created</div>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No audit logs found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Icon */}
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-black text-sm uppercase tracking-wide text-black">
                                                    {log.action.replace(/_/g, ' ')}
                                                </h3>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </span>
                                            </div>

                                            {log.profiles && (
                                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                    <User size={12} />
                                                    <span className="font-medium">
                                                        {log.profiles.full_name}
                                                    </span>
                                                </div>
                                            )}

                                            {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                                        className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                                                    >
                                                        {expandedId === log.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        {expandedId === log.id ? 'Hide' : 'Show'} Details
                                                    </button>

                                                    {expandedId === log.id && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                                                            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                                                                {JSON.stringify(log.metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
