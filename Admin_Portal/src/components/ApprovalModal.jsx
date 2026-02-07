import React, { useState } from 'react';
import { X, DollarSign, CreditCard, BookOpen, FileText } from 'lucide-react';
import { DEMO_COURSES, PAYMENT_METHODS, calculateTotalPrice } from '../../../shared/constants/courses';

const ApprovalModal = ({ application, onClose, onApprove }) => {
    const [formData, setFormData] = useState({
        courses: [],
        paymentAmount: '',
        paymentMethod: 'pending',
        paymentStatus: 'pending',
        paymentNotes: '',
        adminNotes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCourseToggle = (courseId) => {
        setFormData(prev => {
            const newCourses = prev.courses.includes(courseId)
                ? prev.courses.filter(id => id !== courseId)
                : [...prev.courses, courseId];

            // Auto-calculate total price
            const totalPrice = calculateTotalPrice(newCourses);

            return {
                ...prev,
                courses: newCourses,
                paymentAmount: totalPrice.toString()
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.courses.length === 0) {
            alert('Please select at least one course');
            return;
        }

        if (!formData.paymentAmount || parseFloat(formData.paymentAmount) <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        setIsSubmitting(true);

        try {
            await onApprove({
                ...formData,
                paymentAmount: parseFloat(formData.paymentAmount)
            });
            onClose();
        } catch (error) {
            console.error('Approval error:', error);
            alert('Error approving application: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                            Review & Approve Application
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {application.full_name} • @{application.username}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors p-2"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Application Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                            <FileText size={14} /> Application Summary
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-bold text-gray-400">Email:</span>
                                <p className="font-medium">{application.email}</p>
                            </div>
                            <div>
                                <span className="font-bold text-gray-400">Phone:</span>
                                <p className="font-medium">{application.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="font-bold text-gray-400">Location:</span>
                                <p className="font-medium">{application.city}, {application.country}</p>
                            </div>
                            <div>
                                <span className="font-bold text-gray-400">Current Role:</span>
                                <p className="font-medium">{application.job_role}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="font-bold text-gray-400">Requested Program:</span>
                                <p className="font-medium">{application.program_name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Course Assignment */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen size={14} /> Assign Courses <span className="text-primary">*</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {DEMO_COURSES.map(course => (
                                <label
                                    key={course.id}
                                    className={`border-2 p-4 rounded-lg cursor-pointer transition-all ${formData.courses.includes(course.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.courses.includes(course.id)}
                                        onChange={() => handleCourseToggle(course.id)}
                                        className="mr-3"
                                    />
                                    <div className="inline-block">
                                        <div className="font-bold text-sm">{course.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {course.code} • {course.duration} • ${course.price}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {formData.courses.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                                <span className="font-bold text-green-800">
                                    {formData.courses.length} course(s) selected
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Payment Details */}
                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign size={14} /> Payment Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Payment Amount */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                    Payment Amount ($) <span className="text-primary">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={formData.paymentAmount}
                                    onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                                    className="w-full border-2 border-gray-200 p-3 font-bold text-lg focus:outline-none focus:border-primary transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Payment Status */}
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                    Payment Status <span className="text-primary">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.paymentStatus}
                                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                    className="w-full border-2 border-gray-200 p-3 font-bold focus:outline-none focus:border-primary transition-all"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="partial">Partial Payment</option>
                                </select>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="mt-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">
                                Payment Method <span className="text-primary">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                {PAYMENT_METHODS.map(method => (
                                    <label
                                        key={method.value}
                                        className={`border-2 p-4 rounded-lg cursor-pointer transition-all text-center ${formData.paymentMethod === method.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.value}
                                            checked={formData.paymentMethod === method.value}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="sr-only"
                                        />
                                        <div className="text-2xl mb-2">{method.icon}</div>
                                        <div className="font-bold text-xs">{method.label}</div>
                                    </label>
                                ))}
                                <label
                                    className={`border-2 p-4 rounded-lg cursor-pointer transition-all text-center ${formData.paymentMethod === 'pending'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="pending"
                                        checked={formData.paymentMethod === 'pending'}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        className="sr-only"
                                    />
                                    <div className="text-2xl mb-2">⏳</div>
                                    <div className="font-bold text-xs">To Be Decided</div>
                                </label>
                            </div>
                        </div>

                        {/* Payment Notes */}
                        <div className="mt-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                                Payment Notes (Optional)
                            </label>
                            <textarea
                                value={formData.paymentNotes}
                                onChange={(e) => setFormData({ ...formData, paymentNotes: e.target.value })}
                                rows={2}
                                className="w-full border-2 border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-primary transition-all"
                                placeholder="E.g., Payment plan agreed, installment details, etc."
                            />
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">
                            Admin Notes (Optional)
                        </label>
                        <textarea
                            value={formData.adminNotes}
                            onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                            rows={3}
                            className="w-full border-2 border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-primary transition-all"
                            placeholder="Internal notes about this enrollment..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-100 text-gray-700 py-4 font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 text-white py-4 font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard size={16} />
                                    Approve & Enroll Student
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApprovalModal;
