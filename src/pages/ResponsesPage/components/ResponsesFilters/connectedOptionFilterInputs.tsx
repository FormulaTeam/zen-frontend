import React from "react";

import {
  FilterInputProps,
  MultiOptionFilterInput,
  SingleOptionFilterInput,
} from "./responseFilterInputs";
import { useLinkedFieldValueOptions } from "@src/hooks/useLinkedFieldValueOptions";

type ConnectedOptionFilterInputProps = FilterInputProps & {
  linkedOptionsFieldId: string;
};

const useConnectedFilterOptions = (linkedOptionsFieldId: string) => {
  const { options, isLoading, isFetchingNextPage, loadMore, hasNextPage } =
    useLinkedFieldValueOptions(linkedOptionsFieldId);

  return {
    options,
    loading: isLoading,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore: loadMore,
  };
};

export const ConnectedSingleOptionFilterInput: React.FC<ConnectedOptionFilterInputProps> = ({
  linkedOptionsFieldId,
  ...props
}) => {
  const { options, loading, isFetchingNextPage, hasNextPage, onLoadMore } =
    useConnectedFilterOptions(linkedOptionsFieldId);

  return (
    <SingleOptionFilterInput
      {...props}
      options={options}
      loading={loading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onLoadMore={onLoadMore}
    />
  );
};

export const ConnectedMultiOptionFilterInput: React.FC<ConnectedOptionFilterInputProps> = ({
  linkedOptionsFieldId,
  ...props
}) => {
  const { options, loading, isFetchingNextPage, hasNextPage, onLoadMore } =
    useConnectedFilterOptions(linkedOptionsFieldId);

  return (
    <MultiOptionFilterInput
      {...props}
      options={options}
      loading={loading}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      onLoadMore={onLoadMore}
    />
  );
};
