export type ValidationResult = {
    isValid: boolean;
    errorMessage: string | null;
}

export const VALIDATION_RESULT_OK: ValidationResult = {
    isValid: true,
    errorMessage: null,
};
