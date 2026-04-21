export type PasswordChecks = {
    minLength: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    symbol: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
    return {
        minLength: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    };
}

export function getPasswordPolicyError(password: string): string | null {
    const checks = getPasswordChecks(password);

    if (!checks.minLength) return 'Password must be at least 8 characters';
    if (!checks.uppercase) return 'Password must include at least 1 uppercase letter';
    if (!checks.lowercase) return 'Password must include at least 1 lowercase letter';
    if (!checks.number) return 'Password must include at least 1 number';
    if (!checks.symbol) return 'Password must include at least 1 symbol';

    return null;
}