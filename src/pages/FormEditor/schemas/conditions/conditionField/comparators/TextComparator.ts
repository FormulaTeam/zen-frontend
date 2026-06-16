import { comparator } from "formula-gear";

const TextComparator = {
  EQUAL: comparator.Equals,
  NOT_EQUAL: comparator.NotEquals,

  CONTAINS: comparator.Contains,
  NOT_CONTAINS: comparator.NotContains,

  EMPTY: comparator.IsEmpty,
  NOT_EMPTY: comparator.IsNotEmpty,
} as const;

export { TextComparator };