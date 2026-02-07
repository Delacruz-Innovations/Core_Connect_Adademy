import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Subscribe to real-time notifications
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
                },
                (payload) => {
                    setNotifications(prev => [payload.new, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('recipient_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            setNotifications(data || []);
            setUnreadCount(data?.filter(n => !n.read).length || 0);
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
                .update({ read: true, read_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
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
                .update({ read: true, read_at: new Date().toISOString() })
                .eq('recipient_id', user.id)
                .eq('read', false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;

            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (notifications.find(n => n.id === notificationId && !n.read)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200';
            case 'warning': return 'bg-yellow-50 border-yellow-200';
            case 'error': return 'bg-red-50 border-red-200';
            default: return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-black">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                                        {unreadCount} unread
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium text-sm">No notifications</p>
                                    <p className="text-gray-400 text-xs mt-1">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className="text-xl flex-shrink-0 mt-0.5">
                                                    {getNotificationIcon(notification.type)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-black mb-1">
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {new Date(notification.created_at).toLocaleDateString()} at{' '}
                                                            {new Date(notification.created_at).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        {notification.link && (
                                                            <Link
                                                                to={notification.link}
                                                                onClick={() => {
                                                                    markAsRead(notification.id);
                                                                    setIsOpen(false);
                                                                }}
                                                                className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1"
                                                            >
                                                                View <ExternalLink size={10} />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} className="text-gray-600" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X size={14} className="text-gray-600 hover:text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-gray-100 text-center">
                                <Link
                                    to="/admin/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-widest"
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
