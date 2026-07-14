import {
  Button,
  Dialog,
  FormControl,
  MenuItem,
  Popover,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { DragEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { comparator, fieldType } from "formula-gear";
import brushIcon from "../../../icons/brush.svg";

import { useSaveResponsesTableColorRules } from "../../../api/responsesApi";
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
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
  ColorSelectValue,
  ColorSwatch,
  DeleteCancelButton,
  DeleteConfirmActions,
  DeleteConfirmButton,
  DeleteConfirmContent,
  DeleteConfirmText,
  DeleteRuleButton,
  DragHandle,
  EmptyStateContainer,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalTitle,
  OverlapNotice,
  RuleRow,
  RulesHeader,
  RulesTableContainer,
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
  fieldType.List,
  fieldType.Number,
]);

const stableRulesValue = (rules: ResponsesTableColorRuleDto[]) => JSON.stringify(rules);

const requiresTargetValue = (rule: ResponsesTableColorRuleDto): boolean =>
  !!getComparatorOptions(rule.fieldType).find((option) => option.value === rule.comparatorId)
    ?.requiresValue;

const normalizeRuleBeforeSave = (rule: ResponsesTableColorRuleDto): ResponsesTableColorRuleDto => ({
  ...rule,
  targetValue: requiresTargetValue(rule) ? rule.targetValue : null,
});

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

  const hasChanges = stableRulesValue(draftRules) !== stableRulesValue(rules);

  const validationErrors = useMemo<ValidationErrors>(() => {
    const errors: ValidationErrors = {};

    draftRules.forEach((rule) => {
      const ruleErrors: ValidationErrors[string] = {};

      if (!rule.fieldId) ruleErrors.fieldId = "יש לבחור שדה";
      if (!rule.color) ruleErrors.color = "יש לבחור צבע";
      if (!rule.comparatorId) ruleErrors.comparatorId = "יש לבחור תנאי";
      if (!rule.targetType) ruleErrors.targetType = "יש לבחור סוג צביעה";
      if (requiresTargetValue(rule) && (rule.targetValue === undefined || rule.targetValue === "")) {
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

  const markTargetValueTouched = (ruleId: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;

    setTouchedTargetValueRuleIds((prev) => {
      if (prev.has(ruleId)) return prev;
      const next = new Set(prev);
      next.add(ruleId);
      return next;
    });
  };

  const updateRuleTargetValue = (ruleId: string, targetValue: ResponsesTableColorRuleDto["targetValue"]) => {
    markTargetValueTouched(ruleId, targetValue);
    updateRule(ruleId, { targetValue });
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

  const handleRuleDragStart = (ruleId: string) => {
    setDraggedRuleId(ruleId);
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

  const handleRuleDragOver = (
    event: DragEvent<HTMLDivElement>,
    overRuleId: string,
  ) => {
    event.preventDefault();
    if (!draggedRuleId || draggedRuleId === overRuleId) return;

    moveRuleBefore(draggedRuleId, overRuleId);
  };

  const handleRuleDragEnd = () => {
    setDraggedRuleId(null);
  };

  const requestClose = () => {
    onClose();
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
      showSuccessNotification("התגובה עודכנה: הטבלה נצבעה לפי החוקים שנקבעו");
      onClose();
    } catch (error) {
      console.error("Failed to save color rules", error);
      showErrorNotification("שמירת חוקי הצבע נכשלה");
    }
  };

  const renderValueInput = (rule: ResponsesTableColorRuleDto): JSX.Element => {
    const targetValueError = validationErrors[rule.id]?.targetValue;
    const error = touchedTargetValueRuleIds.has(rule.id) ? targetValueError : undefined;
    const selectedField = manageableFields.find((field) => field.id === rule.fieldId);

    if (!requiresTargetValue(rule)) {
      return <TextField size="small" value="" disabled placeholder="ללא ערך" fullWidth />;
    }

    if (rule.fieldType === fieldType.Boolean) {
      return (
        <FormControl size="small" fullWidth error={!!error}>
          <Select
            value={rule.targetValue === true || rule.targetValue === "true" ? "true" : rule.targetValue === false || rule.targetValue === "false" ? "false" : ""}
            onChange={(event) => updateRuleTargetValue(rule.id, event.target.value === "true")}>
            <MenuItem value="true">כן</MenuItem>
            <MenuItem value="false">לא</MenuItem>
          </Select>
        </FormControl>
      );
    }

    const selectedFieldOptions = (selectedField as FormFieldDto & {
      options?: { id?: string; text: string }[];
    } | undefined)?.options;

    if (rule.fieldType === fieldType.Options && selectedFieldOptions?.length) {
      return (
        <FormControl size="small" fullWidth error={!!error}>
          <Select
            value={String(rule.targetValue ?? "")}
            onChange={(event) => updateRuleTargetValue(rule.id, event.target.value)}>
            {selectedFieldOptions.map((option) => (
              <MenuItem key={option.id ?? option.text} value={option.id ?? option.text}>
                {option.text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    return (
      <TextField
        size="small"
        type={rule.fieldType === fieldType.Number ? "number" : rule.fieldType === fieldType.Date ? "date" : "text"}
        value={String(rule.targetValue ?? "")}
        onChange={(event) => updateRuleTargetValue(rule.id, event.target.value)}
        error={!!error}
        helperText={error}
        fullWidth
      />
    );
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
        <EmptyStateIcon src={brushIcon} alt="" />
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

    return (
      <RuleRow
        key={rule.id}
        onDragOver={(event) => handleRuleDragOver(event, rule.id)}
        onDragEnd={handleRuleDragEnd}>
        <DragHandle
          draggable={canManage}
          onDragStart={() => handleRuleDragStart(rule.id)}
          onDragEnd={handleRuleDragEnd}>
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
            onChange={(event) =>
              updateRule(rule.id, { comparatorId: Number(event.target.value), targetValue: "" })
            }
            disabled={!canManage}>
            {getComparatorOptions(rule.fieldType).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {renderValueInput(rule)}

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
            <DeleteOutlineIcon />
          </DeleteRuleButton>
        </span>
      </RuleRow>
    );
  };


  const rulesTable: JSX.Element = (
    <RulesTableContainer>
      {rulesHeader}
      {draftRules.map(renderRuleRow)}
      {canManage && (
        <AddRuleRow>
          <AddRuleButton variant="contained" startIcon={<AddIcon />} onClick={handleAddRule}>
            חוק חדש
          </AddRuleButton>
        </AddRuleRow>
      )}
    </RulesTableContainer>
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
      transformOrigin={{ vertical: "top", horizontal: "center" }}>
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
    <Dialog open={open} onClose={requestClose} maxWidth="lg" fullWidth dir="rtl">
      {modalTitle}
      <ModalContent>
        {modalDescription}
        {modalMainContent}
        {overlapNotice}
      </ModalContent>
      {modalActions}
      {deleteConfirmationPopover}
    </Dialog>
  );

  return (
    <>
      {modalDialog}
    </>
  );
};
