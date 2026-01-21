import { CustomError } from "./CustomError";

export class ValidationError extends CustomError {
    constructor() {
        super("לא ניתן לשמור את השינויים. יש לתקן את השדות המסומנים.");
    }
}
