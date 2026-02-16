import emailjs from '@emailjs/browser';

/**
 * Shared Email Service for Core Connect Academy
 * Uses EmailJS for sending transactional emails.
 */

// Initialize with public key from env
// This should be called once at the app entry point
export const initEmailService = (publicKey) => {
    if (publicKey) {
        emailjs.init(publicKey);
    } else {
        console.warn('EmailJS Public Key missing. Email service not initialized.');
    }
};

/**
 * Send an email using a predefined template
 * @param {string} serviceId - The EmailJS Service ID
 * @param {string} templateId - The EmailJS Template ID
 * @param {Object} templateParams - Key-value pairs matching template variables
 * @returns {Promise} - Resolves with EmailJS response or rejects with error
 */
export const sendEmail = async (serviceId, templateId, templateParams) => {
    try {
        const response = await emailjs.send(
            serviceId,
            templateId,
            templateParams
        );
        console.log('Email sent successfully:', response.status, response.text);
        return response;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

export default {
    init: initEmailService,
    send: sendEmail
};
