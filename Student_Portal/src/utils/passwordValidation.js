/**
 * Password Validation Utility
 * Validates password strength according to security requirements
 */

export const PASSWORD_REQUIREMENTS = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true
};

export const validatePassword = (password) => {
    const requirements = {
        minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)
    };

    const allMet = Object.values(requirements).every(Boolean);

    return {
        isValid: allMet,
        requirements,
        strength: calculatePasswordStrength(password, requirements)
    };
};

const calculatePasswordStrength = (password, requirements) => {
    let score = 0;

    // Length scoring
    if (password.length >= 12) score += 20;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 10;

    // Character type scoring
    if (requirements.hasUppercase) score += 15;
    if (requirements.hasLowercase) score += 15;
    if (requirements.hasNumber) score += 15;
    if (requirements.hasSpecial) score += 15;

    // Bonus for variety
    const uniqueChars = new Set(password).size;
    if (uniqueChars > 10) score += 10;

    // Determine strength level
    if (score >= 90) return { level: 'strong', label: 'Strong', color: 'green' };
    if (score >= 70) return { level: 'good', label: 'Good', color: 'blue' };
    if (score >= 50) return { level: 'fair', label: 'Fair', color: 'yellow' };
    return { level: 'weak', label: 'Weak', color: 'red' };
};

export const getPasswordFeedback = (password) => {
    const validation = validatePassword(password);
    const feedback = [];

    if (!validation.requirements.minLength) {
        feedback.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }
    if (!validation.requirements.hasUppercase) {
        feedback.push('Add at least one uppercase letter (A-Z)');
    }
    if (!validation.requirements.hasLowercase) {
        feedback.push('Add at least one lowercase letter (a-z)');
    }
    if (!validation.requirements.hasNumber) {
        feedback.push('Add at least one number (0-9)');
    }
    if (!validation.requirements.hasSpecial) {
        feedback.push('Add at least one special character (!@#$%^&*...)');
    }

    return feedback;
};

export const passwordsMatch = (password, confirmPassword) => {
    return password === confirmPassword && password.length > 0;
};
