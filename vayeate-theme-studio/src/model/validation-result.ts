/**
 * Outcome of a domain validation check passed back to controllers.
 */
export type ValidationResult = {
    isValid: boolean;
    errorMessage: string | null;
}

/**
 * Successful validation result with no error message.
 */
export const VALIDATION_RESULT_OK: ValidationResult = {
    isValid: true,
    errorMessage: null,
};
