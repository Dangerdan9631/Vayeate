import { singleton } from "tsyringe";

/**
 * Allowed characters for a template name: letters, digits, and hyphens.
 */
const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

/**
 * Checks that a template name is non-empty and matches the allowed character set.
 */
@singleton()
export class ValidateIsTemplateNameValid {
    /**
     * Validates draft or persisted template name input before create or rename.
     *
     * @param name - Proposed template name.
     * @returns `true` when the name is non-empty and matches {@link NAME_REGEX}.
     */
    test(name: string): boolean {
        return name.length > 0 && NAME_REGEX.test(name);
    }
}
