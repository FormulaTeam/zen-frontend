import React, { createContext, useContext, ReactNode } from "react";
import { RecycleBinItemWithResponses } from "../types";

interface RecycleBinContextType {
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
  onBulkRestore: () => void;
  onClearSelection: () => void;
  getIconContent: (icon: string | null) => React.ReactNode;
}

const RecycleBinContext = createContext<RecycleBinContextType | undefined>(undefined);

export const RecycleBinProvider: React.FC<{ value: RecycleBinContextType; children: ReactNode }> = ({
  value,
  children,
}) => <RecycleBinContext.Provider value={value}>{children}</RecycleBinContext.Provider>;

export const useRecycleBin = () => {
  const context = useContext(RecycleBinContext);
  if (!context) {
    throw new Error("useRecycleBin must be used within a RecycleBinProvider");
  }
  return context;
};
