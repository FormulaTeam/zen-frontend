import { comparator } from "formula-gear";

const DateComparator = {
  EQUAL: comparator.Equals,
  NOT_EQUAL: comparator.NotEquals,

  BEFORE: comparator.Before,
  AFTER: comparator.After,

  BEFORE_OR_EQUAL: comparator.BeforeOrEqual,
  AFTER_OR_EQUAL: comparator.AfterOrEqual,

  EMPTY: comparator.IsEmpty,
  NOT_EMPTY: comparator.IsNotEmpty,
} as const;

export { DateComparator };
