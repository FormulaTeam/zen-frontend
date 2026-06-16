import { comparator } from "formula-gear";

const OptionsComparator = {
  ONLY: comparator.Equals,
  OTHER_THAN: comparator.NotEquals,

  INCLUDES: comparator.Contains,
  NOT_INCLUDES: comparator.NotContains,

  NONE: comparator.IsEmpty,
  ANY: comparator.IsNotEmpty,
} as const;

export { OptionsComparator };
