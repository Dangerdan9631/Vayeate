import { singleton } from "tsyringe";

const NAME_REGEX = /^[a-zA-Z0-9-]+$/;

@singleton()
export class ValidateIsTemplateNameValid {
    test(name: string): boolean {
        return name.length > 0 && NAME_REGEX.test(name);
    }
}
