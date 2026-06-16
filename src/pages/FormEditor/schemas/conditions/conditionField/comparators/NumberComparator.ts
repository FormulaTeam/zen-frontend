import { comparator } from "formula-gear";

const NumberComparator = {
  EQUAL: comparator.Equals,
  NOT_EQUAL: comparator.NotEquals,

  LARGER: comparator.GreaterThan,
  SMALLER: comparator.LessThan,

  LARGER_OR_EQUAL: comparator.GreaterThanOrEqual,
  SMALLER_OR_EQUAL: comparator.LessThanOrEqual,

  EMPTY: comparator.IsEmpty,
  NOT_EMPTY: comparator.IsNotEmpty,
} as const;

export { NumberComparator };
