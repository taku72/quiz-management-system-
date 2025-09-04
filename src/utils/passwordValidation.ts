export interface PasswordStrength {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  score: number; // 0-5
}

export const validatePassword = (password: string): PasswordStrength => {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumbers, hasSymbols]
    .filter(Boolean).length;

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSymbols;

  return {
    isValid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSymbols,
    score
  };
};

export const getPasswordStrengthText = (strength: PasswordStrength): string => {
  if (strength.score === 5) return 'Very Strong';
  if (strength.score === 4) return 'Strong';
  if (strength.score === 3) return 'Medium';
  if (strength.score === 2) return 'Weak';
  return 'Very Weak';
};

export const getPasswordStrengthColor = (strength: PasswordStrength): string => {
  if (strength.score === 5) return 'text-green-600';
  if (strength.score === 4) return 'text-green-500';
  if (strength.score === 3) return 'text-yellow-500';
  if (strength.score === 2) return 'text-orange-500';
  return 'text-red-500';
};
