export const formsTabs = {
  currentUserCreated: 0,
  sharedWithUser: 1,
  allForms: 2,
} as const;

export interface SortOption {
  label: string;
  value: number;
}

export const sortByOptions: SortOption[] = [
  { value: 1, label: "מועד יצירה (חדש-ישן)" },
  { value: 2, label: "מועד יצירה (ישן-חדש)" },
  { value: 3, label: "שם הטופס (א-ת)" },
  { value: 4, label: "שם הטופס (ת-א)" },
];

export function getUserName(firstName: string, lastName: string) {
  if (firstName && lastName) {
    return firstName + " " + lastName;
  }

  return "";
}

export const preventEnterKeyNavigation = (
  event: React.KeyboardEvent,
  allowEnter: boolean = false,
) => {
  if (event.key === "Enter") {
    event.stopPropagation();
    if (!allowEnter) {
      event.preventDefault();
    }
  }
};

// using TextDecoder to interpret bytes as UTF-8 for proper display
export function decodeFileName(fileName: string) {
  const bytes = new Uint8Array(fileName.split("").map((char) => char.charCodeAt(0)));
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}
