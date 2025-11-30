import { $ZodErrorTree } from "zod/v4/core";

type SpecificDiscriminatedUnionObject<DiscriminatedUnion extends object | undefined, DiscriminatorKey extends string, DiscriminatorValue> =
  DiscriminatedUnion & { [K in DiscriminatorKey]: DiscriminatorValue };

type SpecificDiscriminatedUnionSubObject<DiscriminatedUnion extends object | undefined, DiscriminatorKey extends string, DiscriminatorValue, SubObjectKey extends keyof DiscriminatedUnion> =
  SpecificDiscriminatedUnionObject<DiscriminatedUnion, DiscriminatorKey, DiscriminatorValue>[SubObjectKey] & object;

type SpecificDiscriminatedUnionSubObjectErrorTree<DiscriminatedUnion extends object | undefined, DiscriminatorKey extends string, DiscriminatorValue, SubObjectKey extends keyof DiscriminatedUnion> = $ZodErrorTree<SpecificDiscriminatedUnionSubObject<DiscriminatedUnion, DiscriminatorKey, DiscriminatorValue, SubObjectKey>>;

export type {
  SpecificDiscriminatedUnionObject,
  SpecificDiscriminatedUnionSubObject,
  SpecificDiscriminatedUnionSubObjectErrorTree,
};