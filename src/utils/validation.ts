import mongoose from 'mongoose';

// Validate MongoDB ObjectId
export const validateObjectId = (id: string): boolean => {
    return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate URL format
export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Validate phone number (basic validation)
export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Sanitize string input
export const sanitizeString = (str: string): string => {
    return str.trim().replace(/[<>]/g, '');
};

// Validate file type
export const validateFileType = (filename: string, allowedTypes: string[]): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
};

// Validate file size
export const validateFileSize = (size: number, maxSize: number): boolean => {
    return size <= maxSize;
};

// Generate random string
export const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}; 