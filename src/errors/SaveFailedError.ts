import { CustomError } from "./CustomError";

export class SaveFailedError extends CustomError {
    constructor() {
        super("שגיאה בשמירת השינויים");
    }
}
