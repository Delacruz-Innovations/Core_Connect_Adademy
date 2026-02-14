import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, Filter, CheckCircle, AlertCircle, Info, Award, FileText, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandedLoader from '../components/BrandedLoader';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all'); // all, success, info, warning, error

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time updates
        const subscription = supabase
            .channel('notifications_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Get current admin user
            const { data: { user } } = await supabase.auth.getUser();

            // If no user is logged in, skip fetching
            if (!user) {
                console.log('No authenticated user found');
                setNotifications([]);
                return;
            }

            let query = supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

            const { data, error } = await query;
            if (error) throw error;

            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('recipient_id', user.id)
                .eq('read', false);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={24} />;
            case 'error': return <AlertCircle className="text-red-500" size={24} />;
            case 'warning': return <AlertCircle className="text-orange-500" size={24} />;
            case 'achievement': return <Award className="text-purple-500" size={24} />;
            default: return <Info className="text-blue-500" size={24} />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'error': return 'bg-red-50 border-red-200';
            case 'warning': return 'bg-orange-50 border-orange-200';
            case 'achievement': return 'bg-purple-50 border-purple-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    const formatNotificationDetails = (metadata) => {
        if (!metadata) return null;

        const details = [];

        // Extract common fields
        if (metadata.full_name) details.push({ label: 'Name', value: metadata.full_name });
        if (metadata.email) details.push({ label: 'Email', value: metadata.email });
        if (metadata.student_email) details.push({ label: 'Student', value: metadata.student_email });
        if (metadata.course_id) details.push({ label: 'Course ID', value: metadata.course_id });
        if (metadata.assignment_id) details.push({ label: 'Assignment', value: metadata.assignment_id });
        if (metadata.grade_score) details.push({ label: 'Grade', value: `${metadata.grade_score}%` });

        return details;
    };

    const filteredNotifications = notifications
        .filter(n => {
            if (filter === 'unread') return !n.read;
            if (filter === 'read') return n.read;
            return true;
        })
        .filter(n => {
            if (typeFilter === 'all') return true;
            return n.type === typeFilter;
        });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-black mb-2">
                        Notifications
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Stay updated with platform activity {unreadCount > 0 && `• ${unreadCount} unread`}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
                    >
                        Mark All as Read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={20} className="text-gray-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">Filters</h2>
                </div>

                <div className="flex flex-wrap gap-4">
                    {/* Read Status Filter */}
                    <div className="flex gap-2">
                        {['all', 'unread', 'read'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${filter === status
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Type Filter */}
                    <div className="flex gap-2 ml-4">
                        {['all', 'success', 'info', 'warning', 'error'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${typeFilter === type
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {loading && <BrandedLoader message="Loading Notifications..." />}

                {!loading && filteredNotifications.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No notifications found</p>
                        <p className="text-gray-400 text-sm mt-2">
                            {filter !== 'all' || typeFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Check back later for updates'}
                        </p>
                    </div>
                )}

                {!loading && filteredNotifications.map((notification) => {
                    const details = formatNotificationDetails(notification.metadata);

                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white border ${notification.read ? 'border-gray-200' : 'border-primary/30 shadow-lg'
                                } rounded-lg p-6 hover:shadow-xl transition-all cursor-pointer`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-black text-lg text-black mb-1">
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <span className="ml-4 flex-shrink-0 w-3 h-3 bg-primary rounded-full" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    {details && details.length > 0 && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                                            <div className="grid grid-cols-2 gap-3">
                                                {details.map((detail, idx) => (
                                                    <div key={idx} className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                                            {detail.label}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {detail.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                                        <Clock size={12} />
                                        <span>
                                            {new Date(notification.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Notifications;
