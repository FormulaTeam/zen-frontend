import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Popover,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { comparator, dateType, fieldType, timePrecision } from "formula-gear";

import { useSaveResponsesTableColorRules } from "../../../api/responsesApi";
import CustomDateTime from "../../../components/FormFields/CustomDateTime/CustomDateTime";
import CustomTimePicker from "../../../components/FormFields/CustomTimePicker/CustomTimePicker";
import { PaginatedAutocompleteListbox } from "../../../components/PaginatedAutocompleteListbox";
import { basePopperSx } from "../../../components/FormFields/CustomDropDownAutocomplete/styled";
import { useLinkedFieldValueOptions } from "../../../hooks/useLinkedFieldValueOptions";
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import { OptionResponseValue, formatOptionLabel } from "../../../utils/optionResponseValue";
import {
  COLOR_RULE_PALETTE,
  createEmptyColorRule,
  getComparatorOptions,
} from "../utils/colorRules";
import { showErrorNotification, showSuccessNotification } from "../../../utils/utils";
import {
  ActionButtons,
  AddRuleButton,
  AddRuleRow,
  CancelButton,
  CloseButton,
  ColorMenuSwatch,
  ColorRulePickerWrapper,
  ColorRulesDialog,
  ColorSelectValue,
  ColorSwatch,
  DeleteCancelButton,
  DeleteConfirmActions,
  DeleteConfirmButton,
  DeleteConfirmContent,
  DeleteConfirmText,
  DeleteRuleButton,
  DeleteRuleIcon,
  DragHandle,
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateIconWrapper,
  EmptyStateTitle,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalTitle,
  OverlapNotice,
  RuleRow,
  RulesHeader,
  RulesScrollbarRail,
  RulesScrollbarThumb,
  RulesTableContainer,
  RulesTableScrollArea,
  SaveButton,
  TitleContent,
} from "./ColorRulesModalStyled";

type ColorRulesModalProps = {
  open: boolean;
  formId: number;
  fields: FormFieldDto[];
  rules: ResponsesTableColorRuleDto[];
  canManage: boolean;
  onClose: () => void;
};

type ValidationErrors = Record<string, Partial<Record<keyof ResponsesTableColorRuleDto, string>>>;

const comparableFieldTypes = new Set<number>([
  fieldType.LongText,
  fieldType.ShortText,
  fieldType.Options,
  fieldType.Date,
  fieldType.Time,
  fieldType.Boolean,
  fieldType.Number,
]);

type ColorRuleFieldExtra = {
  dateType?: "date" | "datetime";
  timePrecision?: "minutes" | "seconds";
  linkedOptionsFieldId?: string | null;
  inactiveOptionIds?: string[];
};

type ColorRuleOptionsField = FormFieldDto & {
  options?: OptionResponseValue[];
};

type RawOptionValue =
  | string
  | OptionResponseValue
  | { id?: string | number; text?: string; value?: string; isActive?: boolean };

const stableRulesValue = (rules: ResponsesTableColorRuleDto[]) => JSON.stringify(rules);

const requiresTargetValue = (rule: ResponsesTableColorRuleDto): boolean =>
  !!getComparatorOptions(rule.fieldType).find((option) => option.value === rule.comparatorId)
    ?.requiresValue;

const normalizeTargetValue = (
  targetValue: ResponsesTableColorRuleDto["targetValue"],
): ResponsesTableColorRuleDto["targetValue"] =>
  typeof targetValue === "string" ? targetValue.trim() : targetValue;

const normalizeRuleBeforeSave = (rule: ResponsesTableColorRuleDto): ResponsesTableColorRuleDto => ({
  ...rule,
  targetValue: requiresTargetValue(rule) ? normalizeTargetValue(rule.targetValue) : null,
});

const getFieldExtra = (field?: FormFieldDto): ColorRuleFieldExtra =>
  (field?.extra as ColorRuleFieldExtra | undefined) ?? {};

const getLinkedOptionsFieldId = (field?: FormFieldDto): string | undefined => {
  const linkedOptionsFieldId = getFieldExtra(field).linkedOptionsFieldId;

  return typeof linkedOptionsFieldId === "string" && linkedOptionsFieldId.trim() !== ""
    ? linkedOptionsFieldId
    : undefined;
};

const isConnectedOptionsField = (field?: FormFieldDto, fields: FormFieldDto[] = []): boolean => {
  const linkedOptionsFieldId = getLinkedOptionsFieldId(field);
  if (!linkedOptionsFieldId) return false;

  return !fields.some((formField) => String(formField.id) === String(linkedOptionsFieldId));
};

const normalizeOptionItem = (option: RawOptionValue): OptionResponseValue | null => {
  if (typeof option === "string") {
    return {
      id: option,
      text: formatOptionLabel(option),
    };
  }

  const optionId = option.id ?? ("value" in option ? option.value : undefined) ?? option.text;
  if (optionId === undefined || optionId === null) return null;

  return {
    id: String(optionId),
    text: formatOptionLabel(option.text ?? String(optionId)),
    isActive: option.isActive,
  };
};

const getRawFieldOptions = (field?: FormFieldDto): RawOptionValue[] => {
  const extra = field?.extra as (ColorRuleFieldExtra & {
    options?: { items?: RawOptionValue[] } | RawOptionValue[];
    items?: RawOptionValue[];
    values?: RawOptionValue[];
  }) | undefined;
  const optionsField = field as ColorRuleOptionsField | undefined;
  const extraOptions = Array.isArray(extra?.options) ? extra.options : extra?.options?.items;

  return extraOptions ?? extra?.items ?? extra?.values ?? optionsField?.options ?? [];
};

const getManualOptionItems = (field?: FormFieldDto, fields: FormFieldDto[] = []): OptionResponseValue[] => {
  const linkedOptionsFieldId = getLinkedOptionsFieldId(field);
  const sourceField = linkedOptionsFieldId
    ? fields.find((formField) => String(formField.id) === String(linkedOptionsFieldId)) ?? field
    : field;
  const inactiveOptionIds = new Set((getFieldExtra(sourceField).inactiveOptionIds ?? []).map(String));
  const options = getRawFieldOptions(sourceField);

  return options
    .map(normalizeOptionItem)
    .filter((option): option is OptionResponseValue => !!option)
    .filter((option) => !inactiveOptionIds.has(String(option.id)) && option.isActive !== false);
};

const createFallbackOption = (
  value: ResponsesTableColorRuleDto["targetValue"],
): OptionResponseValue | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  return {
    id: value,
    text: formatOptionLabel(value),
  };
};

type ColorRuleTargetValueInputProps = {
  rule: ResponsesTableColorRuleDto;
  fields: FormFieldDto[];
  selectedField?: FormFieldDto;
  error?: string;
  canManage: boolean;
  onTouch: (ruleId: string) => void;
  onChange: (ruleId: string, targetValue: ResponsesTableColorRuleDto["targetValue"]) => void;
  onTrim: (rule: ResponsesTableColorRuleDto) => void;
};

const ColorRuleTargetValueInput = ({
  rule,
  fields,
  selectedField,
  error,
  canManage,
  onTouch,
  onChange,
  onTrim,
}: ColorRuleTargetValueInputProps): JSX.Element => {
  const fieldExtra = getFieldExtra(selectedField);
  const linkedOptionsFieldId = getLinkedOptionsFieldId(selectedField);
  const isLinkedOptionsField = rule.fieldType === fieldType.Options && isConnectedOptionsField(selectedField, fields);
  const {
    options: linkedOptions,
    isLoading: isLinkedOptionsLoading,
    isFetchingNextPage,
    loadMore,
    hasNextPage,
  } = useLinkedFieldValueOptions(linkedOptionsFieldId, isLinkedOptionsField);

  if (!requiresTargetValue(rule)) {
    return <TextField size="small" value="" disabled placeholder="ללא ערך" fullWidth />;
  }

  if (rule.fieldType === fieldType.Boolean) {
    return (
      <FormControl size="small" fullWidth error={!!error}>
        <Select
          value={rule.targetValue === true || rule.targetValue === "true" ? "true" : rule.targetValue === false || rule.targetValue === "false" ? "false" : ""}
          onBlur={() => onTouch(rule.id)}
          onChange={(event) => onChange(rule.id, event.target.value === "true")}
          disabled={!canManage}>
          <MenuItem value="true">כן</MenuItem>
          <MenuItem value="false">לא</MenuItem>
        </Select>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }

  if (rule.fieldType === fieldType.Options) {
    const manualOptions = getManualOptionItems(selectedField, fields);
    const options = isLinkedOptionsField ? linkedOptions : manualOptions;
    const fallbackOption = createFallbackOption(rule.targetValue);
    const selectedOption =
      options.find((option) => String(option.id) === String(rule.targetValue)) ??
      fallbackOption;

    return (
      <Autocomplete<OptionResponseValue, false, false, false>
        fullWidth
        options={options}
        value={selectedOption}
        loading={isLinkedOptionsLoading}
        loadingText="בטעינה..."
        noOptionsText="אין אפשרויות"
        getOptionLabel={(option) => option.text ?? ""}
        isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
        onBlur={() => onTouch(rule.id)}
        onChange={(_, newValue) => onChange(rule.id, newValue?.id ?? "")}
        openOnFocus
        disablePortal
        disabled={!canManage}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontWeight: '400 !important',
          },
        }}
        slotProps={{
          popper: { sx: basePopperSx },
        }}
        ListboxComponent={PaginatedAutocompleteListbox}
        slots={{
          listbox: PaginatedAutocompleteListbox,
        }}
        ListboxProps={
          {
            onLoadMore: isLinkedOptionsField ? loadMore : undefined,
            hasNextPage: isLinkedOptionsField ? hasNextPage : false,
            isFetchingNextPage,
          } as any
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            error={!!error}
            helperText={error}
            fullWidth
          />
        )}
      />
    );
  }

  if (rule.fieldType === fieldType.Date) {
    const currentDateType = fieldExtra.dateType ?? dateType.Date;

    return (
      <ColorRulePickerWrapper>
        <CustomDateTime
          value={typeof rule.targetValue === "string" ? rule.targetValue : null}
          dateType={currentDateType}
          isTabularEdit
          label=""
          isRequired={false}
          isDisabled={!canManage}
          onChangeHandler={(value) => onChange(rule.id, value)}
          onBlurHandler={() => onTouch(rule.id)}
          validationMessage={error ?? null}
        />
      </ColorRulePickerWrapper>
    );
  }

  if (rule.fieldType === fieldType.Time) {
    const currentTimePrecision = fieldExtra.timePrecision ?? timePrecision.Minutes;

    return (
      <ColorRulePickerWrapper>
        <CustomTimePicker
          value={typeof rule.targetValue === "string" ? rule.targetValue : ""}
          timePrecision={currentTimePrecision}
          isTabularEdit
          label=""
          isRequired={false}
          isDisabled={!canManage}
          onChangeHandler={(value) => onChange(rule.id, value)}
          onBlurHandler={() => onTouch(rule.id)}
          validationMessage={error ?? null}
        />
      </ColorRulePickerWrapper>
    );
  }

  return (
    <TextField
      size="small"
      type={rule.fieldType === fieldType.Number ? "number" : "text"}
      value={String(rule.targetValue ?? "")}
      onBlur={() => onTrim(rule)}
      onChange={(event) => onChange(rule.id, event.target.value)}
      error={!!error}
      helperText={error}
      disabled={!canManage}
      fullWidth
    />
  );
};

const MIN_SCROLL_THUMB_HEIGHT = 36;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const ColorRulesModal = ({
  open,
  formId,
  fields,
  rules,
  canManage,
  onClose,
}: ColorRulesModalProps): JSX.Element => {
  const manageableFields = useMemo(
    () => fields.filter((field) => comparableFieldTypes.has(field.fieldType)),
    [fields],
  );
  const [draftRules, setDraftRules] = useState<ResponsesTableColorRuleDto[]>(rules);
  const [touchedTargetValueRuleIds, setTouchedTargetValueRuleIds] = useState<Set<string>>(new Set());
  const [draggedRuleId, setDraggedRuleId] = useState<string | null>(null);
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLElement | null>(null);
  const [pendingDeleteRuleId, setPendingDeleteRuleId] = useState<string | null>(null);
  const [scrollThumb, setScrollThumb] = useState({ top: 0, height: MIN_SCROLL_THUMB_HEIGHT });
  const [isScrollable, setIsScrollable] = useState(false);
  const rulesTableRef = useRef<HTMLDivElement | null>(null);
  const rulesScrollbarRailRef = useRef<HTMLDivElement | null>(null);
  const { mutateAsync, isPending } = useSaveResponsesTableColorRules();

  useEffect(() => {
    if (open) {
      setDraftRules(rules);
      setTouchedTargetValueRuleIds(new Set());
      setDraggedRuleId(null);
      setDeleteAnchorEl(null);
      setPendingDeleteRuleId(null);
    }
  }, [open, rules]);

  useEffect(() => {
    if (!draggedRuleId) return;

    const previousBodyCursor = document.body.style.cursor;
    const previousBodyUserSelect = document.body.style.userSelect;
    const previousRootCursor = document.documentElement.style.cursor;
    const cursorStyle = document.createElement("style");

    cursorStyle.textContent = `
      body.color-rule-row-dragging,
      body.color-rule-row-dragging * {
        cursor: grabbing !important;
      }
    `;
    document.head.appendChild(cursorStyle);
    document.body.classList.add("color-rule-row-dragging");
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    document.documentElement.style.cursor = "grabbing";

    return () => {
      document.body.classList.remove("color-rule-row-dragging");
      cursorStyle.remove();
      document.body.style.cursor = previousBodyCursor;
      document.body.style.userSelect = previousBodyUserSelect;
      document.documentElement.style.cursor = previousRootCursor;
    };
  }, [draggedRuleId]);

  const updateScrollThumb = () => {
    const table = rulesTableRef.current;
    if (!table) return;

    const { clientHeight, scrollHeight, scrollTop } = table;

    if (scrollHeight <= clientHeight) {
      setIsScrollable(false);
      setScrollThumb({ top: 0, height: clientHeight });
      return;
    }

    setIsScrollable(true);
    const thumbHeight = Math.max(MIN_SCROLL_THUMB_HEIGHT, (clientHeight / scrollHeight) * clientHeight);
    const maxThumbTop = clientHeight - thumbHeight;
    const maxScrollTop = scrollHeight - clientHeight;
    const thumbTop = (scrollTop / maxScrollTop) * maxThumbTop;

    setScrollThumb({ top: thumbTop, height: thumbHeight });
  };

  useEffect(() => {
    updateScrollThumb();

    const table = rulesTableRef.current;
    if (!table) return;

    table.addEventListener("scroll", updateScrollThumb);

    return () => {
      table.removeEventListener("scroll", updateScrollThumb);
    };
  }, [draftRules.length, open]);

  const scrollRulesTableToThumbTop = (thumbTop: number) => {
    const table = rulesTableRef.current;
    const rail = rulesScrollbarRailRef.current;
    if (!table || !rail) return;

    const maxThumbTop = rail.clientHeight - scrollThumb.height;
    const maxScrollTop = table.scrollHeight - table.clientHeight;

    if (maxThumbTop <= 0 || maxScrollTop <= 0) return;

    table.scrollTop = (clamp(thumbTop, 0, maxThumbTop) / maxThumbTop) * maxScrollTop;
  };

  const handleRulesScrollbarRailMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    const rail = rulesScrollbarRailRef.current;
    if (!rail) return;

    const railRect = rail.getBoundingClientRect();
    const nextThumbTop = event.clientY - railRect.top - scrollThumb.height / 2;

    scrollRulesTableToThumbTop(nextThumbTop);
  };

  const handleRulesScrollbarThumbMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    const table = rulesTableRef.current;
    const rail = rulesScrollbarRailRef.current;
    if (!table || !rail) return;

    const startY = event.clientY;
    const startScrollTop = table.scrollTop;
    const maxThumbTop = rail.clientHeight - scrollThumb.height;
    const maxScrollTop = table.scrollHeight - table.clientHeight;

    if (maxThumbTop <= 0 || maxScrollTop <= 0) return;

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const scrollDelta = ((moveEvent.clientY - startY) / maxThumbTop) * maxScrollTop;
      table.scrollTop = startScrollTop + scrollDelta;
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const hasChanges = stableRulesValue(draftRules) !== stableRulesValue(rules);

  const validationErrors = useMemo<ValidationErrors>(() => {
    const errors: ValidationErrors = {};

    draftRules.forEach((rule) => {
      const ruleErrors: ValidationErrors[string] = {};

      if (!rule.fieldId) ruleErrors.fieldId = "יש לבחור שדה";
      if (!rule.color) ruleErrors.color = "יש לבחור צבע";
      if (rule.comparatorId === undefined || rule.comparatorId === null) ruleErrors.comparatorId = "יש לבחור תנאי";
      if (!rule.targetType) ruleErrors.targetType = "יש לבחור סוג צביעה";
      if (
        requiresTargetValue(rule) &&
        (rule.targetValue === undefined ||
          rule.targetValue === null ||
          normalizeTargetValue(rule.targetValue) === "")
      ) {
        ruleErrors.targetValue = "יש להזין ערך";
      }

      if (Object.keys(ruleErrors).length > 0) errors[rule.id] = ruleErrors;
    });

    return errors;
  }, [draftRules]);

  const hasErrors = Object.keys(validationErrors).length > 0;

  const updateRule = (ruleId: string, patch: Partial<ResponsesTableColorRuleDto>) => {
    setDraftRules((prev) =>
      prev.map((rule) => {
        if (rule.id !== ruleId) return rule;
        return { ...rule, ...patch };
      }),
    );
  };

  const markTargetValueTouched = (ruleId: string) => {
    setTouchedTargetValueRuleIds((prev) => {
      if (prev.has(ruleId)) return prev;
      const next = new Set(prev);
      next.add(ruleId);
      return next;
    });
  };

  const resetTargetValueTouched = (ruleId: string) => {
    setTouchedTargetValueRuleIds((prev) => {
      if (!prev.has(ruleId)) return prev;
      const next = new Set(prev);
      next.delete(ruleId);
      return next;
    });
  };

  const updateRuleTargetValue = (ruleId: string, targetValue: ResponsesTableColorRuleDto["targetValue"]) => {
    markTargetValueTouched(ruleId);
    updateRule(ruleId, { targetValue });
  };

  const trimRuleTargetValue = (rule: ResponsesTableColorRuleDto) => {
    markTargetValueTouched(rule.id);
    updateRule(rule.id, { targetValue: normalizeTargetValue(rule.targetValue) });
  };

  const handleFieldChange = (rule: ResponsesTableColorRuleDto, fieldId: string) => {
    const selectedField = manageableFields.find((field) => field.id === fieldId);
    if (!selectedField) return;

    const nextComparator = getComparatorOptions(selectedField.fieldType)[0]?.value ?? comparator.Equals;

    updateRule(rule.id, {
      fieldId,
      fieldType: selectedField.fieldType,
      comparatorId: nextComparator,
      targetValue: "",
    });
    resetTargetValueTouched(rule.id);
  };

  const handleAddRule = () => {
    setDraftRules((prev) => [
      ...prev,
      { ...createEmptyColorRule(manageableFields[0]), order: prev.length },
    ]);
  };

  const handleDeleteRule = (ruleId: string) => {
    setDraftRules((prev) => prev.filter((rule) => rule.id !== ruleId));
  };

  const moveRuleBefore = (activeRuleId: string, overRuleId: string) => {
    setDraftRules((prev) => {
      const activeIndex = prev.findIndex((rule) => rule.id === activeRuleId);
      const overIndex = prev.findIndex((rule) => rule.id === overRuleId);

      if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) return prev;

      const next = [...prev];
      const [movedRule] = next.splice(activeIndex, 1);
      next.splice(overIndex, 0, movedRule);

      return next.map((rule, index) => ({ ...rule, order: index }));
    });
  };

  const handleRuleDragMouseDown = (event: MouseEvent<HTMLDivElement>, ruleId: string) => {
    if (!canManage) return;

    event.preventDefault();
    setDraggedRuleId(ruleId);

    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      const rowElement = document
        .elementFromPoint(moveEvent.clientX, moveEvent.clientY)
        ?.closest<HTMLElement>("[data-color-rule-id]");
      const overRuleId = rowElement?.dataset.colorRuleId;

      if (!overRuleId || overRuleId === ruleId) return;

      moveRuleBefore(ruleId, overRuleId);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setDraggedRuleId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const requestClose = () => {
    onClose();
  };

  const handleDialogClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") return;
    requestClose();
  };

  const openDeletePopover = (event: MouseEvent<HTMLElement>, ruleId: string) => {
    setDeleteAnchorEl(event.currentTarget);
    setPendingDeleteRuleId(ruleId);
  };

  const closeDeletePopover = () => {
    setDeleteAnchorEl(null);
    setPendingDeleteRuleId(null);
  };

  const confirmDeleteRule = () => {
    if (pendingDeleteRuleId) {
      handleDeleteRule(pendingDeleteRuleId);
    }
    closeDeletePopover();
  };

  const handleSave = async () => {
    if (hasErrors) return;

    try {
      const normalizedRules = draftRules.map(normalizeRuleBeforeSave);
      await mutateAsync({
        formId,
        previousRules: rules,
        nextRules: normalizedRules.map((rule, index) => ({ ...rule, order: index })),
      });
      showSuccessNotification("התגובה עודכנה: הטבלה נצבעה לפי החוקים שנקבעו", {
        duration: 5000,
        style: {
          minWidth: "380px",
          whiteSpace: "nowrap",
        },
      });
      onClose();
    } catch (error) {
      console.error("Failed to save color rules", error);
      showErrorNotification("שמירת חוקי הצבע נכשלה");
    }
  };

  const modalTitle: JSX.Element = (
    <ModalTitle>
      <TitleContent>
        <span>צבעים בטבלת תגובות</span>
      </TitleContent>
      <CloseButton onClick={requestClose}>
        <CloseIcon />
      </CloseButton>
    </ModalTitle>
  );

  const modalDescription: JSX.Element = (
    <ModalDescription>
      הגדרת חוקים לצביעת תגובות לפי תנאים.
    </ModalDescription>
  );

  const emptyState: JSX.Element = (
    <EmptyStateContainer>
      <EmptyStateContent>
        <EmptyStateIconWrapper>
          <EmptyStateIcon aria-hidden="true" />
        </EmptyStateIconWrapper>
        <EmptyStateTitle>אין חוקים עדיין</EmptyStateTitle>
        <EmptyStateDescription>
          יש להוסיף חוק כדי לצבוע נתונים בטבלה
        </EmptyStateDescription>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRule}>
            חוק חדש
          </Button>
        )}
      </EmptyStateContent>
    </EmptyStateContainer>
  );

  const rulesHeader: JSX.Element = (
    <RulesHeader>
      <span />
      <span>שדה תגובה</span>
      <span>תנאי</span>
      <span>ערך</span>
      <span>סוג צביעה</span>
      <span>צבע</span>
      <span>הפעלה</span>
      <span />
    </RulesHeader>
  );

  const renderRuleRow = (rule: ResponsesTableColorRuleDto): JSX.Element => {
    const ruleErrors = validationErrors[rule.id] ?? {};
    const selectedField = manageableFields.find((field) => field.id === rule.fieldId);
    const targetValueError = touchedTargetValueRuleIds.has(rule.id)
      ? ruleErrors.targetValue
      : undefined;
    const isDragging = draggedRuleId === rule.id;
    const isDragLocked = !!draggedRuleId && !isDragging;

    return (
      <RuleRow
        key={rule.id}
        data-color-rule-id={rule.id}
        $isDragging={isDragging}
        $isDragLocked={isDragLocked}>
        <DragHandle
          $isDragging={isDragging}
          $canDrag={canManage}
          onMouseDown={(event) => handleRuleDragMouseDown(event, rule.id)}>
          <DragIndicatorIcon />
        </DragHandle>

        <FormControl size="small" error={!!ruleErrors.fieldId}>
          <Select
            value={rule.fieldId}
            onChange={(event) => handleFieldChange(rule, event.target.value)}
            disabled={!canManage}>
            {manageableFields.map((field) => (
              <MenuItem key={field.id} value={field.id}>
                {field.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" error={!!ruleErrors.comparatorId}>
          <Select
            value={rule.comparatorId}
            onChange={(event) => {
              const comparatorId = Number(event.target.value);
              const comparatorRequiresValue = !!getComparatorOptions(rule.fieldType).find(
                (option) => option.value === comparatorId,
              )?.requiresValue;

              updateRule(rule.id, {
                comparatorId,
                targetValue: comparatorRequiresValue ? "" : null,
              });
              resetTargetValueTouched(rule.id);
            }}
            disabled={!canManage}>
            {getComparatorOptions(rule.fieldType).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ColorRuleTargetValueInput
          rule={rule}
          fields={fields}
          selectedField={selectedField}
          error={targetValueError}
          canManage={canManage}
          onTouch={markTargetValueTouched}
          onChange={updateRuleTargetValue}
          onTrim={trimRuleTargetValue}
        />

        <FormControl size="small" error={!!ruleErrors.targetType}>
          <Select
            value={rule.targetType}
            onChange={(event) =>
              updateRule(rule.id, {
                targetType: event.target.value as ResponsesTableColorRuleDto["targetType"],
              })
            }
            disabled={!canManage}>
            <MenuItem value="cell">תא</MenuItem>
            <MenuItem value="row">שורה</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <Select
            value={rule.color}
            onChange={(event) =>
              updateRule(rule.id, { color: event.target.value as ResponsesTableColorRuleDto["color"] })
            }
            disabled={!canManage}
            renderValue={(value) => (
              <ColorSelectValue>
                <ColorSwatch $backgroundColor={COLOR_RULE_PALETTE[value].swatch} />
              </ColorSelectValue>
            )}>
            {Object.entries(COLOR_RULE_PALETTE).map(([color, meta]) => (
              <MenuItem key={color} value={color}>
                <ColorMenuSwatch $backgroundColor={meta.swatch} />
                {meta.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Switch
          checked={rule.isActive}
          onChange={(event) => updateRule(rule.id, { isActive: event.target.checked })}
          disabled={!canManage}
        />

        <span>
          <DeleteRuleButton
            disabled={!canManage}
            onClick={(event) => openDeletePopover(event, rule.id)}>
            <DeleteRuleIcon aria-hidden="true" />
          </DeleteRuleButton>
        </span>
      </RuleRow>
    );
  };


  const rulesTable: JSX.Element = (
    <RulesTableScrollArea>
      <RulesTableContainer ref={rulesTableRef}>
        {rulesHeader}
        {draftRules.map(renderRuleRow)}
        {canManage && (
          <AddRuleRow>
            <span />
            <AddRuleButton variant="contained" startIcon={<AddIcon />} onClick={handleAddRule}>
              חוק חדש
            </AddRuleButton>
          </AddRuleRow>
        )}
      </RulesTableContainer>
      {isScrollable && (
        <RulesScrollbarRail
          ref={rulesScrollbarRailRef}
          onMouseDown={handleRulesScrollbarRailMouseDown}>
          <RulesScrollbarThumb
            onMouseDown={handleRulesScrollbarThumbMouseDown}
            style={{
              height: scrollThumb.height,
              transform: `translateY(${scrollThumb.top}px)`,
            }}
          />
        </RulesScrollbarRail>
      )}
    </RulesTableScrollArea>
  );

  const modalMainContent: JSX.Element = draftRules.length === 0 ? emptyState : rulesTable;

  const overlapNotice: JSX.Element = (
    <OverlapNotice>
      <InfoOutlinedIcon />
      <Typography>במקרה של חפיפה בין חוקים, יוחל החוק הראשון ברשימה.</Typography>
    </OverlapNotice>
  );

  const modalActions: JSX.Element = (
    <ModalActions>
      <div />

      <ActionButtons>
        <CancelButton onClick={requestClose}>ביטול</CancelButton>
        {canManage && (
          <SaveButton variant="contained" onClick={handleSave} disabled={isPending || !hasChanges || hasErrors}>
            שמירה
          </SaveButton>
        )}
      </ActionButtons>
    </ModalActions>
  );

  const deleteConfirmationPopover: JSX.Element = (
    <Popover
      open={!!deleteAnchorEl}
      anchorEl={deleteAnchorEl}
      onClose={closeDeletePopover}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      PaperProps={{
        sx: {
          overflow: "visible",
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}>
      <DeleteConfirmContent>
        <DeleteConfirmText>האם ברצונך למחוק את החוק?</DeleteConfirmText>
        <DeleteConfirmText>החוק המחוק לא יהיה ניתן לשחזור.</DeleteConfirmText>
        <DeleteConfirmActions>
          <DeleteCancelButton onClick={closeDeletePopover}>ביטול</DeleteCancelButton>
          <DeleteConfirmButton onClick={confirmDeleteRule}>מחיקה</DeleteConfirmButton>
        </DeleteConfirmActions>
      </DeleteConfirmContent>
    </Popover>
  );

  const modalDialog: JSX.Element = (
    <ColorRulesDialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="lg"
      fullWidth
      dir="rtl"
      disableEscapeKeyDown>
      {modalTitle}
      <ModalContent>
        {modalDescription}
        {modalMainContent}
        {overlapNotice}
      </ModalContent>
      {modalActions}
      {deleteConfirmationPopover}
    </ColorRulesDialog>
  );

  return (
    <>
      {modalDialog}
    </>
  );
};
