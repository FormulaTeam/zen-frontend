import { CustomError } from "./CustomError";

export class NoUnsavedChangesError extends CustomError {
    constructor() {
        super("אין שינויים לשמירה");
    }
}
