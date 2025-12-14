import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export const getFormat = (
  dateAndTime?: boolean,
  showSeconds?: boolean,
  type?: "date" | "time",
  value?: string,
) => {
  if (type === "time") {
    if (showSeconds) {
      return dayjs(value, "HH:mm:ss").isValid() ? dayjs(value, "HH:mm:ss").format("HH:mm:ss") : "";
    }
    return dayjs(value, "HH:mm").isValid() ? dayjs(value, "HH:mm").format("HH:mm") : "";
  }
  return dayjs(value).isValid()
    ? dayjs(value).format(dateAndTime ? "YYYY-MM-DD[T]HH:mm:ss.000" : "YYYY-MM-DD")
    : "";
};