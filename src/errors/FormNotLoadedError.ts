import { CustomError } from "./CustomError";

export class FormNotLoadedError extends CustomError {
    constructor() {
        super("טופס לא נטען");
    }
}
