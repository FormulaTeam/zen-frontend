import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useMemo, useState } from "react";
import { comparator, fieldType } from "formula-gear";
import brushIcon from "../../../icons/brush.svg";

import { useSaveResponsesTableColorRules } from "../../../api/responsesApi";
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import UnsavedChangesDialog from "../../../components/BasePopup/UnsavedChangesDialog";
import {
  COLOR_RULE_PALETTE,
  createEmptyColorRule,
  getComparatorOptions,
} from "../utils/colorRules";
import { showErrorNotification, showSuccessNotification } from "../../../utils/utils";

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
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const { mutateAsync, isPending } = useSaveResponsesTableColorRules();

  useEffect(() => {
    if (open) {
      setDraftRules(rules);
      setShowDiscardWarning(false);
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

  const requestClose = () => {
    if (canManage && hasChanges) {
      setShowDiscardWarning(true);
      return;
    }

    onClose();
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

  const renderValueInput = (rule: ResponsesTableColorRuleDto) => {
    const error = validationErrors[rule.id]?.targetValue;
    const selectedField = manageableFields.find((field) => field.id === rule.fieldId);

    if (!requiresTargetValue(rule)) {
      return <TextField size="small" value="" disabled placeholder="ללא ערך" fullWidth />;
    }

    if (rule.fieldType === fieldType.Boolean) {
      return (
        <FormControl size="small" fullWidth error={!!error}>
          <Select
            value={rule.targetValue === true || rule.targetValue === "true" ? "true" : rule.targetValue === false || rule.targetValue === "false" ? "false" : ""}
            onChange={(event) => updateRule(rule.id, { targetValue: event.target.value === "true" })}>
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
            onChange={(event) => updateRule(rule.id, { targetValue: event.target.value })}>
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
        onChange={(event) => updateRule(rule.id, { targetValue: event.target.value })}
        error={!!error}
        helperText={error}
        fullWidth
      />
    );
  };

  return (
    <>
      <Dialog open={open} onClose={requestClose} maxWidth="lg" fullWidth dir="rtl">
        <DialogTitle sx={{ textAlign: "center", fontWeight: 800, pb: 0 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <Box component="img" src={brushIcon} alt="" sx={{ width: 32, height: 32 }} />
            <span>צבעים בטבלת תגובות</span>
          </Box>
          <IconButton onClick={requestClose} sx={{ position: "absolute", left: 12, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ minHeight: 430, pt: 3 }}>
          <Typography sx={{ color: "#64748b", mb: 3, textAlign: "right" }}>
            הגדר חוקים לצביעת תגובות לפי תנאים.
          </Typography>

          {draftRules.length === 0 ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center", gap: 2 }}>
              <Box sx={{ display: "grid", placeItems: "center", gap: 1.5 }}>
                <Box component="img" src={brushIcon} alt="" sx={{ width: 46, height: 46 }} />
                <Typography sx={{ fontWeight: 800 }}>אין חוקים עדיין</Typography>
                <Typography sx={{ color: "#475569" }}>יש להוסיף חוק כדי לצבוע נתונים בטבלה</Typography>
                {canManage && (
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddRule}>
                    חוק חדש
                  </Button>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "44px 190px 150px 190px 96px 120px 130px 72px", gap: 1, minWidth: 1000, alignItems: "center", mb: 1, fontWeight: 800 }}>
                <span />
                <span>שדה תגובה</span>
                <span>תנאי</span>
                <span>ערך</span>
                <span>צבע</span>
                <span>סוג צביעה</span>
                <span>תצוגה</span>
                <span>פעיל</span>
              </Box>

              {draftRules.map((rule) => {
                const ruleErrors = validationErrors[rule.id] ?? {};
                const colorMeta = COLOR_RULE_PALETTE[rule.color];

                return (
                  <Box key={rule.id} sx={{ display: "grid", gridTemplateColumns: "44px 190px 150px 190px 96px 120px 130px 72px", gap: 1, minWidth: 1000, alignItems: "start", mb: 1.5 }}>
                    <Tooltip title="מחיקה">
                      <span>
                        <IconButton disabled={!canManage} onClick={() => handleDeleteRule(rule.id)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

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
                        onChange={(event) => updateRule(rule.id, { comparatorId: Number(event.target.value), targetValue: "" })}
                        disabled={!canManage}>
                        {getComparatorOptions(rule.fieldType).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {renderValueInput(rule)}

                    <FormControl size="small">
                      <Select
                        value={rule.color}
                        onChange={(event) => updateRule(rule.id, { color: event.target.value as ResponsesTableColorRuleDto["color"] })}
                        disabled={!canManage}
                        renderValue={(value) => (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: COLOR_RULE_PALETTE[value].swatch }} />
                          </Box>
                        )}>
                        {Object.entries(COLOR_RULE_PALETTE).map(([color, meta]) => (
                          <MenuItem key={color} value={color}>
                            <Box sx={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: meta.swatch, ml: 1 }} />
                            {meta.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

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

                    <Box sx={{ px: 1, height: 32, display: "flex", alignItems: "center", borderRadius: 1, backgroundColor: colorMeta.background, fontWeight: 700 }}>
                      {colorMeta.label}
                    </Box>

                    <Switch
                      checked={rule.isActive}
                      onChange={(event) => updateRule(rule.id, { isActive: event.target.checked })}
                      disabled={!canManage}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
          <Box>
            {canManage && draftRules.length > 0 && (
              <Button startIcon={<AddIcon />} onClick={handleAddRule}>
                חוק חדש
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={requestClose}>ביטול</Button>
            {canManage && (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isPending || !hasChanges || hasErrors}>
                שמירה
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <UnsavedChangesDialog
        open={showDiscardWarning}
        onClose={() => setShowDiscardWarning(false)}
        onSave={handleSave}
        onDiscard={onClose}
        title="שינויים שלא נשמרו"
        message="ישנם שינויים שלא נשמרו. האם ברצונך לשמור לפני סגירת החלון?"
        saveText="שמירה"
        discardText="סגירה ללא שמירה"
      />
    </>
  );
};
