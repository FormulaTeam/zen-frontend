import { Autocomplete, Box, FormControl, FormHelperText, MenuItem, Select, TextField } from "@mui/material";
import { dateType, fieldType, timePrecision } from "formula-gear";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import CustomDateTime from "../../../components/FormFields/CustomDateTime/CustomDateTime";
import CustomTimePicker from "../../../components/FormFields/CustomTimePicker/CustomTimePicker";
import { PaginatedAutocompleteListbox } from "../../../components/PaginatedAutocompleteListbox";
import { basePopperSx } from "../../../components/FormFields/CustomDropDownAutocomplete/styled";
import { useLinkedFieldValueOptions } from "../../../hooks/useLinkedFieldValueOptions";
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import { OptionResponseValue } from "../../../utils/optionResponseValue";
import { getRangeValue, isRangeComparator } from "../utils/colorRules";
import {
  combineDateAndTime,
  createFallbackOption,
  getFieldExtra,
  getLinkedOptionsFieldId,
  getManualOptionItems,
  isConnectedOptionsField,
  isDateTimeField,
  normalizeTargetValue,
  requiresTargetValue,
  splitDateTimeIso,
  ISRAEL_TZ,
} from "../utils/colorRulesModal.helpers";
import {
  ColorRulePickerWrapper,
  DateTimeDateSlot,
  DateTimeSplitRow,
  DateTimeTimeSlot,
  RangeErrorColumn,
  RangeInput,
  RangeInputsWrapper,
  RangePrefix,
} from "./ColorRulesModalStyled";

dayjs.extend(utc);
dayjs.extend(timezone);

type ColorRuleDateTimeSplitInputProps = {
  value: string;
  timePrecision: "minutes" | "seconds";
  canManage: boolean;
  error?: string;
  hasError?: boolean;
  onChange: (value: string) => void;
  onTouch: () => void;
};

export const ColorRuleDateTimeSplitInput = ({
  value,
  timePrecision: precision,
  canManage,
  error,
  hasError,
  onChange,
  onTouch,
}: ColorRuleDateTimeSplitInputProps): JSX.Element => {
  const { datePart, timePart } = splitDateTimeIso(value, precision);

  const handleDateChange = (nextDateIso: string) => {
    if (!nextDateIso) {
      onChange("");
      return;
    }
    const nextTime = timePart || (precision === "seconds" ? "00:00:00" : "00:00");
    onChange(combineDateAndTime(nextDateIso, nextTime));
  };

  const handleTimeChange = (nextTime: string) => {
    if (!nextTime) {
      onChange("");
      return;
    }
    const baseDate =
      datePart || dayjs().tz(ISRAEL_TZ).startOf("day").utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
    onChange(combineDateAndTime(baseDate, nextTime));
  };

  return (
    <DateTimeSplitRow>
      <DateTimeTimeSlot>
        <ColorRulePickerWrapper $timeAlignRight>
          <CustomTimePicker
            value={timePart}
            timePrecision={precision}
            isTabularEdit
            label=""
            isRequired={false}
            isDisabled={!canManage}
            onChangeHandler={handleTimeChange}
            onBlurHandler={onTouch}
            validationMessage={error ?? null}
            hasError={hasError}
          />
        </ColorRulePickerWrapper>
      </DateTimeTimeSlot>
      <DateTimeDateSlot>
        <ColorRulePickerWrapper>
          <CustomDateTime
            value={datePart || null}
            dateType={dateType.Date}
            isTabularEdit
            label=""
            isRequired={false}
            isDisabled={!canManage}
            onChangeHandler={handleDateChange}
            onBlurHandler={onTouch}
            validationMessage={error ?? null}
            hasError={hasError}
          />
        </ColorRulePickerWrapper>
      </DateTimeDateSlot>
    </DateTimeSplitRow>
  );
};

type ColorRuleTargetValueInputProps = {
  rule: ResponsesTableColorRuleDto;
  fields: FormFieldDto[];
  selectedField?: FormFieldDto;
  error?: string;
  rangeSideErrors?: { from?: string; to?: string };
  canManage: boolean;
  onTouch: (ruleId: string) => void;
  onTouchRangeSide?: (ruleId: string, side: "from" | "to") => void;
  onFillRangeSide?: (ruleId: string, side: "from" | "to") => void;
  onChange: (ruleId: string, targetValue: ResponsesTableColorRuleDto["targetValue"]) => void;
  onTrim: (rule: ResponsesTableColorRuleDto) => void;
};

export const ColorRuleTargetValueInput = ({
  rule,
  fields,
  selectedField,
  error,
  rangeSideErrors,
  canManage,
  onTouch,
  onTouchRangeSide,
  onFillRangeSide,
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

  if (isRangeComparator(rule.comparatorId)) {
    const { from, to } = getRangeValue(rule.targetValue);

    const handleRangeChange = (key: "from" | "to", nextValue: string) => {
      onTouchRangeSide?.(rule.id, key);
      if (normalizeTargetValue(nextValue) !== "") {
        onFillRangeSide?.(rule.id, key);
      }
      const current = getRangeValue(rule.targetValue);
      onChange(rule.id, { ...current, [key]: nextValue });
    };

    const renderRangeField = (key: "from" | "to", currentValue: string) => {
      const sideError = rangeSideErrors?.[key];
      const showError = !!error || !!sideError;
      const touchSide = () => {
        onTouch(rule.id);
        onTouchRangeSide?.(rule.id, key);
      };
      if (rule.fieldType === fieldType.Date) {
        const currentDateType = fieldExtra.dateType ?? dateType.Date;
        if (isDateTimeField(fieldExtra)) {
          return (
            <ColorRuleDateTimeSplitInput
              value={currentValue}
              timePrecision={fieldExtra.timePrecision ?? timePrecision.Minutes}
              canManage={canManage}
              error={undefined}
              hasError={showError}
              onChange={(value) => handleRangeChange(key, value)}
              onTouch={touchSide}
            />
          );
        }
        return (
          <ColorRulePickerWrapper>
            <CustomDateTime
              value={currentValue || null}
              dateType={currentDateType}
              isTabularEdit
              label=""
              isRequired={false}
              isDisabled={!canManage}
              onChangeHandler={(value) => handleRangeChange(key, value)}
              onBlurHandler={touchSide}
              validationMessage={null}
              hasError={showError}
            />
          </ColorRulePickerWrapper>
        );
      }

      if (rule.fieldType === fieldType.Time) {
        const currentTimePrecision = fieldExtra.timePrecision ?? timePrecision.Minutes;
        return (
          <ColorRulePickerWrapper>
            <CustomTimePicker
              value={currentValue}
              timePrecision={currentTimePrecision}
              isTabularEdit
              label=""
              isRequired={false}
              isDisabled={!canManage}
              onChangeHandler={(value) => handleRangeChange(key, value)}
              onBlurHandler={touchSide}
              validationMessage={null}
              hasError={showError}
            />
          </ColorRulePickerWrapper>
        );
      }

      return (
        <TextField
          size="small"
          type="number"
          value={currentValue}
          onBlur={touchSide}
          onChange={(event) => handleRangeChange(key, event.target.value)}
          error={showError}
          disabled={!canManage}
          fullWidth
        />
      );
    };

    const isDateTimeRange = rule.fieldType === fieldType.Date && isDateTimeField(fieldExtra);
    const isDateOrTime = rule.fieldType === fieldType.Date || rule.fieldType === fieldType.Time;
    const sideHelperSx = {
      textAlign: isDateOrTime ? ("left" as const) : ("right" as const),
      paddingInlineStart: isDateOrTime ? "27px" : 0,
      mx: 0,
      mt: "2px",
    };

    const renderRangeCell = (key: "from" | "to", prefix: string, currentValue: string) => (
      <Box sx={{ display: "flex", flexDirection: "column", flex: "1 1 0", minWidth: 0 }}>
        <RangeInput>
          <RangePrefix>{prefix}</RangePrefix>
          {renderRangeField(key, currentValue)}
        </RangeInput>
        {rangeSideErrors?.[key] && (
          <FormHelperText error sx={sideHelperSx}>
            {rangeSideErrors[key]}
          </FormHelperText>
        )}
      </Box>
    );

    return (
      <RangeErrorColumn>
        <RangeInputsWrapper $stacked={isDateTimeRange}>
          {renderRangeCell("from", "מ-", from)}
          {renderRangeCell("to", "עד", to)}
        </RangeInputsWrapper>
        {error && (
          <FormHelperText error sx={sideHelperSx}>
            {error}
          </FormHelperText>
        )}
      </RangeErrorColumn>
    );
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

    if (isDateTimeField(fieldExtra)) {
      return (
        <ColorRuleDateTimeSplitInput
          value={typeof rule.targetValue === "string" ? rule.targetValue : ""}
          timePrecision={fieldExtra.timePrecision ?? timePrecision.Minutes}
          canManage={canManage}
          error={error}
          onChange={(value) => onChange(rule.id, value)}
          onTouch={() => onTouch(rule.id)}
        />
      );
    }

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

export default ColorRuleTargetValueInput;
