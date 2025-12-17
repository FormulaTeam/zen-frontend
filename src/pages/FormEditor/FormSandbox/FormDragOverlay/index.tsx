import { DraggableElementType, DraggingElement } from "../context/FormSandboxContext";
import { FunctionComponent } from "react";
import CatalogItemDragOverlay from "./CatalogItemDragOverlay";
import SectionDragOverlay from "./SectionDragOverlay";
import FieldDragOverlay from "./FieldDragOverlay";

const DRAG_OVERLAYS: Record<DraggableElementType, FunctionComponent<{ draggingElement: DraggingElement }>> = {
  catalogItem: CatalogItemDragOverlay,
  section: SectionDragOverlay,
  field: FieldDragOverlay,
} as const;

export { DRAG_OVERLAYS };