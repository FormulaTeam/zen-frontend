import { CustomError } from "./CustomError";

export class NoValidChangesError extends CustomError {
    constructor() {
        super("לא נמצאו שינויים תקינים לשמירה");
    }
}
