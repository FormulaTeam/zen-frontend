const TextConditionType = {
  EQUAL: 1,
  NOT_EQUAL: 2,

  CONTAINS: 3,
  NOT_CONTAINS: 4,

  EMPTY: 5,
  NOT_EMPTY: 6,
} as const;

export { TextConditionType };