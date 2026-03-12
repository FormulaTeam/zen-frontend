import { CustomError } from "./CustomError";

export class NoResponsesFoundError extends CustomError {
    constructor() {
        super("לא נמצאו תגובות לעדכון");
    }
}
