import React, { createContext, useContext, ReactNode } from "react";
import { DeletedFormWithResponses } from "../types";

interface TrashContextType {
  restoringFormId: number | null;
  restoringResponseId: string | null;
  isBulkRestoring: boolean;
  expandedForms: Record<number, boolean>;
  selectedFormIds: Set<number>;
  selectedResponseIds: Set<string>;
  hasFilters: boolean;
  onToggleSelectForm: (id: number) => void;
  onToggleSelectResponse: (id: string) => void;
  onToggleExpand: (id: number) => void;
  onRestoreForm: (id: number) => Promise<void>;
  onRestoreResponse: (formId: number, responseId: string) => Promise<void>;
  onClearFilters: () => void;
  getIconContent: (icon: string | null) => React.ReactNode;
}

const TrashContext = createContext<TrashContextType | undefined>(undefined);

export const TrashProvider: React.FC<{ value: TrashContextType; children: ReactNode }> = ({
  value,
  children,
}) => <TrashContext.Provider value={value}>{children}</TrashContext.Provider>;

export const useTrash = () => {
  const context = useContext(TrashContext);
  if (!context) {
    throw new Error("useTrash must be used within a TrashProvider");
  }
  return context;
};
