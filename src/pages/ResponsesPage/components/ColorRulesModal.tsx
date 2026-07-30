import {
  Button,
  FormControl,
  FormHelperText,
  MenuItem,
  Popover,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import {
  COLOR_RULE_PALETTE,
  getComparatorOptions,
  getRangeValue,
  isRangeComparator,
} from "../utils/colorRules";
import { REQUIRED_VALUE_MESSAGE } from "../utils/colorRulesModal.helpers";
import { useColorRulesModal } from "../hooks/useColorRulesModal";
import { ColorRuleTargetValueInput } from "./ColorRuleTargetValueInput";
import { EllipsisTooltip } from "./EllipsisTooltip";
import {
  ActionButtons,
  AddRuleButton,
  AddRuleRow,
  CancelButton,
  CloseButton,
  ColorMenuSwatch,
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
  FieldMenuItemLabel,
  FieldPlaceholder,
  FieldValueLabel,
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalTitle,
  OverlapNotice,
  RuleRow,
  RulesHeader,
  RulesScrollbarRail,
  RulesScrollbarRailHorizontal,
  RulesScrollbarThumb,
  RulesScrollbarThumbHorizontal,
  RulesTableContainer,
  RulesTableOuter,
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

export const ColorRulesModal = ({
  open,
  formId,
  fields,
  rules,
  canManage,
  onClose,
}: ColorRulesModalProps): JSX.Element => {
  const {
    manageableFields,
    draftRules,
    touchedTargetValueRuleIds,
    filledRangeSideKeys,
    touchedFieldRuleIds,
    draggedRuleId,
    deleteAnchorEl,
    scrollThumb,
    isScrollable,
    scrollThumbX,
    isHorizontallyScrollable,
    rulesTableRef,
    rulesScrollbarRailRef,
    rulesScrollbarRailXRef,
    isPending,
    hasChanges,
    validationErrors,
    hasErrors,
    updateRule,
    markTargetValueTouched,
    markRangeSideTouched,
    markRangeSideFilled,
    markFieldTouched,
    updateRuleTargetValue,
    trimRuleTargetValue,
    handleFieldChange,
    handleComparatorChange,
    handleAddRule,
    handleRuleDragMouseDown,
    requestClose,
    handleDialogClose,
    openDeletePopover,
    closeDeletePopover,
    confirmDeleteRule,
    handleSave,
    handleRulesScrollbarRailMouseDown,
    handleRulesScrollbarThumbMouseDown,
    handleRulesScrollbarRailXMouseDown,
    handleRulesScrollbarThumbXMouseDown,
  } = useColorRulesModal({ open, formId, fields, rules, onClose });

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
    <ModalDescription>הגדרת חוקים לצביעת תגובות לפי תנאים.</ModalDescription>
  );

  const emptyState: JSX.Element = (
    <EmptyStateContainer>
      <EmptyStateContent>
        <EmptyStateIconWrapper>
          <EmptyStateIcon aria-hidden="true" />
        </EmptyStateIconWrapper>
        <EmptyStateTitle>אין חוקים עדיין</EmptyStateTitle>
        <EmptyStateDescription>יש להוסיף חוק כדי לצבוע נתונים בטבלה</EmptyStateDescription>
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
    let targetValueError = touchedTargetValueRuleIds.has(rule.id)
      ? ruleErrors.targetValue
      : undefined;
    let rangeSideErrors: { from?: string; to?: string } | undefined;

    if (isRangeComparator(rule.comparatorId) && targetValueError === REQUIRED_VALUE_MESSAGE) {
      const { from, to } = getRangeValue(rule.targetValue);
      const fromShow = from === "" && filledRangeSideKeys.has(`${rule.id}|from`);
      const toShow = to === "" && filledRangeSideKeys.has(`${rule.id}|to`);

      rangeSideErrors = {
        from: fromShow ? REQUIRED_VALUE_MESSAGE : undefined,
        to: toShow ? REQUIRED_VALUE_MESSAGE : undefined,
      };

      targetValueError = undefined;
    }

    const fieldError = touchedFieldRuleIds.has(rule.id) ? ruleErrors.fieldId : undefined;
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
          onMouseDown={(event) => handleRuleDragMouseDown(event, rule.id, canManage)}>
          <DragIndicatorIcon />
        </DragHandle>

        <FormControl size="small" error={!!fieldError}>
          <Select
            value={rule.fieldId}
            displayEmpty
            onBlur={() => markFieldTouched(rule.id)}
            onChange={(event) => handleFieldChange(rule, event.target.value)}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxWidth: "var(--color-rule-field-menu-width, 240px)",
                },
              },
              anchorOrigin: { vertical: "bottom", horizontal: "left" },
              transformOrigin: { vertical: "top", horizontal: "left" },
            }}
            ref={(node) => {
              const element = node as unknown as HTMLElement | null;
              const width = element?.getBoundingClientRect().width;

              if (width) {
                document.documentElement.style.setProperty(
                  "--color-rule-field-menu-width",
                  `${width}px`,
                );
              }
            }}
            renderValue={(value) => {
              const field = manageableFields.find((item) => item.id === value);

              return field ? (
                <EllipsisTooltip text={field.displayName}>
                  <FieldValueLabel>{field.displayName}</FieldValueLabel>
                </EllipsisTooltip>
              ) : (
                <FieldPlaceholder>בחירת שדה</FieldPlaceholder>
              );
            }}
            disabled={!canManage}>
            {manageableFields.map((field) => (
              <MenuItem key={field.id} value={field.id}>
                <EllipsisTooltip text={field.displayName}>
                  <FieldMenuItemLabel>{field.displayName}</FieldMenuItemLabel>
                </EllipsisTooltip>
              </MenuItem>
            ))}
          </Select>
          {fieldError && <FormHelperText>{fieldError}</FormHelperText>}
        </FormControl>

        <FormControl size="small" error={!!ruleErrors.comparatorId}>
          <Select
            value={rule.comparatorId}
            onChange={(event) => handleComparatorChange(rule, Number(event.target.value))}
            renderValue={(value) => {
              const option = getComparatorOptions(rule.fieldType).find(
                (item) => item.value === value,
              );

              return (
                <EllipsisTooltip text={option?.label ?? ""}>
                  <FieldValueLabel>{option?.label ?? ""}</FieldValueLabel>
                </EllipsisTooltip>
              );
            }}
            disabled={!canManage}>
            {getComparatorOptions(rule.fieldType).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <EllipsisTooltip text={option.label}>
                  <FieldMenuItemLabel>{option.label}</FieldMenuItemLabel>
                </EllipsisTooltip>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ColorRuleTargetValueInput
          rule={rule}
          fields={fields}
          selectedField={selectedField}
          error={targetValueError}
          rangeSideErrors={rangeSideErrors}
          canManage={canManage}
          onTouch={markTargetValueTouched}
          onTouchRangeSide={markRangeSideTouched}
          onFillRangeSide={markRangeSideFilled}
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
              updateRule(rule.id, {
                color: event.target.value as ResponsesTableColorRuleDto["color"],
              })
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
    <>
      <RulesTableOuter>
        <RulesTableScrollArea>
          <RulesTableContainer ref={rulesTableRef}>
            {rulesHeader}
            {draftRules.map(renderRuleRow)}
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
        {isHorizontallyScrollable && (
          <RulesScrollbarRailHorizontal
            ref={rulesScrollbarRailXRef}
            onMouseDown={handleRulesScrollbarRailXMouseDown}>
            <RulesScrollbarThumbHorizontal
              onMouseDown={handleRulesScrollbarThumbXMouseDown}
              style={{
                width: scrollThumbX.width,
                transform: `translateX(${scrollThumbX.left}px)`,
              }}
            />
          </RulesScrollbarRailHorizontal>
        )}
      </RulesTableOuter>
      {canManage && (
        <AddRuleRow>
          <span />
          <AddRuleButton variant="contained" startIcon={<AddIcon />} onClick={handleAddRule}>
            חוק חדש
          </AddRuleButton>
        </AddRuleRow>
      )}
    </>
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
          <SaveButton
            variant="contained"
            onClick={handleSave}
            disabled={isPending || !hasChanges || hasErrors}>
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

  return (
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
};

export default ColorRulesModal;
