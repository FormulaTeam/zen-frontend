import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GridFilterModel } from "@mui/x-data-grid-pro";

import { FormFieldDto, ResponseFiltersDto } from "../../../../types/shared";
import {
  buildResponseFiltersFromGridFilterModel,
  getGridFilterModelFromResponseFilters,
  normalizeGridFilterItemsForResponseFilters,
} from "./responseFilters.utils";
import { Filter } from "@src/utils/interfaces";

type UseResponsesTableFiltersParams = {
  filter: Filter | null;
  formFields: FormFieldDto[];
  setResponseFilters: (filters: ResponseFiltersDto | null) => void;
};

const stringifyResponseFilters = (responseFilters?: ResponseFiltersDto): string => {
  return JSON.stringify(responseFilters ?? null);
};

export const useResponsesTableFilters = ({
  filter,
  formFields,
  setResponseFilters,
}: UseResponsesTableFiltersParams) => {
  const externalFilterKey = stringifyResponseFilters(filter?.responseFilters);

  const externalFilterModel = useMemo<GridFilterModel>(() => {
    return getGridFilterModelFromResponseFilters(filter?.responseFilters);
  }, [filter?.responseFilters]);

  const [filterModel, setFilterModel] = useState<GridFilterModel>(externalFilterModel);
  const lastExternalFilterKey = useRef(externalFilterKey);

  useEffect(() => {
    if (lastExternalFilterKey.current === externalFilterKey) {
      return;
    }

    lastExternalFilterKey.current = externalFilterKey;
    setFilterModel(externalFilterModel);
  }, [externalFilterKey, externalFilterModel]);

  const handleFilterModelChange = useCallback(
    (nextFilterModel: GridFilterModel) => {
      const normalizedItems = normalizeGridFilterItemsForResponseFilters(nextFilterModel.items);
      const normalizedFilterModel: GridFilterModel = {
        ...nextFilterModel,
        items: normalizedItems,
      };

      setFilterModel(normalizedFilterModel);

      if (normalizedItems.length === 0) {
        setResponseFilters(null);
        return;
      }

      const { filters } = buildResponseFiltersFromGridFilterModel(normalizedItems, formFields);

      setResponseFilters(filters);
    },
    [formFields, setResponseFilters],
  );

  return {
    filterModel,
    handleFilterModelChange,
  };
};
