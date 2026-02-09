import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, HelpCircle, AlertTriangle } from 'lucide-react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'alert', // alert, confirm, prompt
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        inputPlaceholder: '',
        inputValue: '',
        variant: 'info' // info, success, warning, error
    });

    const [userInput, setUserInput] = useState('');

    const close = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        setUserInput('');
    };

    const showAlert = useCallback((message, title = 'Notification', variant = 'info') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'alert',
                title,
                message,
                variant,
                onConfirm: () => {
                    close();
                    resolve(true);
                }
            });
        });
    }, []);

    const showConfirm = useCallback((message, title = 'Confirm Action', variant = 'warning') => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                type: 'confirm',
                title,
                message,
                variant,
                onConfirm: () => {
                    close();
                    resolve(true);
                },
                onCancel: () => {
                    close();
                    resolve(false);
                }
            });
        });
    }, []);

    const showPrompt = useCallback((message, placeholder = '', title = 'Input Required') => {
        return new Promise((resolve) => {
            setUserInput('');
            setModalState({
                isOpen: true,
                type: 'prompt',
                title,
                message,
                inputPlaceholder: placeholder,
                onConfirm: (val) => {
                    close();
                    resolve(val);
                },
                onCancel: () => {
                    close();
                    resolve(null);
                }
            });
        });
    }, []);

    // Helper for icons based on variant
    const getIcon = () => {
        switch (modalState.variant) {
            case 'success': return <CheckCircle className="text-green-500" size={32} />;
            case 'error': return <AlertTriangle className="text-red-500" size={32} />;
            case 'warning': return <AlertTriangle className="text-secondary" size={32} />;
            default: return <AlertCircle className="text-primary" size={32} />;
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
            {children}
            {modalState.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white max-w-md w-full shadow-2xl rounded-lg overflow-hidden border-t-4 border-primary animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-50 rounded-full shrink-0">
                                    {getIcon()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black text-black uppercase tracking-tight mb-2">
                                        {modalState.title}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-800 leading-relaxed mb-4">
                                        {modalState.message}
                                    </p>

                                    {modalState.type === 'prompt' && (
                                        <input
                                            autoFocus
                                            type="text"
                                            className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-black"
                                            placeholder={modalState.inputPlaceholder}
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') modalState.onConfirm(userInput);
                                            }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
                            {(modalState.type === 'confirm' || modalState.type === 'prompt') && (
                                <button
                                    onClick={modalState.onCancel}
                                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => modalState.type === 'prompt' ? modalState.onConfirm(userInput) : modalState.onConfirm()}
                                className="px-6 py-2 bg-primary text-white text-xs font-black uppercase tracking-widest rounded shadow-lg shadow-primary/20 hover:bg-black hover:shadow-xl transition-all"
                            >
                                {modalState.type === 'alert' ? 'Dismiss' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};
