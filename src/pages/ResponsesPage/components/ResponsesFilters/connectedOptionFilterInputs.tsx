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
  const { options, isLoading, loadMore } = useLinkedFieldValueOptions(linkedOptionsFieldId);

  return {
    options,
    loading: isLoading,
    onLoadMore: loadMore,
  };
};

export const ConnectedSingleOptionFilterInput: React.FC<ConnectedOptionFilterInputProps> = ({
  linkedOptionsFieldId,
  ...props
}) => {
  const { options, loading, onLoadMore } = useConnectedFilterOptions(linkedOptionsFieldId);

  return (
    <SingleOptionFilterInput
      {...props}
      options={options}
      loading={loading}
      onLoadMore={onLoadMore}
    />
  );
};

export const ConnectedMultiOptionFilterInput: React.FC<ConnectedOptionFilterInputProps> = ({
  linkedOptionsFieldId,
  ...props
}) => {
  const { options, loading, onLoadMore } = useConnectedFilterOptions(linkedOptionsFieldId);

  return (
    <MultiOptionFilterInput
      {...props}
      options={options}
      loading={loading}
      onLoadMore={onLoadMore}
    />
  );
};
