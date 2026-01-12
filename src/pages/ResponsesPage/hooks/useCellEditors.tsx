import { useCallback } from "react";
import { GridApiPro } from "@mui/x-data-grid-pro/models/gridApiPro";
import { GridRenderEditCellParams } from "@mui/x-data-grid-pro";
import { TextField } from "@mui/material";
import { FormField, FieldTypeIds } from "../../../utils/interfaces";
import {
    TextCellEditor,
    OptionsCellEditor,
    NumberCellEditor,
    DateCellEditor,
    TimeCellEditor,
    CheckboxCellEditor,
    ListCellEditor,
    LinkCellEditor,
    LocationCellEditor,
    FileCellEditor,
} from "../components/CellEditors";

interface UseCellEditorsParams {
    apiRef: React.MutableRefObject<GridApiPro | null>;
    formFields: FormField[] | undefined;
}

interface UseCellEditorsReturn {
    renderEditCell: (params: GridRenderEditCellParams) => React.ReactElement;
}

export const useCellEditors = ({ apiRef, formFields }: UseCellEditorsParams): UseCellEditorsReturn => {
    const updateCellValue = useCallback(
        (params: GridRenderEditCellParams, newValue: unknown): void => {
            apiRef.current?.setEditCellValue({
                id: params.id,
                field: params.field,
                value: newValue,
            });
        },
        [apiRef],
    );

    const renderFallbackTextField = useCallback(
        (params: GridRenderEditCellParams): React.ReactElement => (
            <TextField
                variant="standard"
                fullWidth
                value={String(params.value ?? "")}
                onChange={(e) => updateCellValue(params, e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ px: 1 }}
            />
        ),
        [updateCellValue],
    );

    const findFormFieldByColumnName = useCallback(
        (columnName: string): FormField | undefined => {
            return formFields?.find((field) => field.displayName === columnName);
        },
        [formFields],
    );

    const renderEditCell = useCallback(
        (params: GridRenderEditCellParams): React.ReactElement => {
            const formField = findFormFieldByColumnName(params.field);

            if (!formField) {
                return renderFallbackTextField(params);
            }

            const { typeId, validationRegex, required, options, multiSelect, numberType, minValue, maxValue, dateAndTime, coordinateType, showSeconds } = formField;

            const handleChange = (newValue: unknown) => updateCellValue(params, newValue);

            switch (typeId) {
                case FieldTypeIds.shortText:
                    return (
                        <TextCellEditor
                            value={params.value as string}
                            onChange={handleChange}
                            validationRegex={validationRegex}
                            isRequired={required}
                            multiline={false}
                        />
                    );

                case FieldTypeIds.longText:
                    return (
                        <TextCellEditor
                            value={params.value as string}
                            onChange={handleChange}
                            validationRegex={validationRegex}
                            isRequired={required}
                            multiline={true}
                        />
                    );

                case FieldTypeIds.options:
                    return (
                        <OptionsCellEditor
                            value={params.value as string | string[]}
                            onChange={handleChange}
                            options={options || []}
                            multiSelect={multiSelect}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.number:
                    return (
                        <NumberCellEditor
                            value={params.value as number | string}
                            onChange={handleChange}
                            numberType={numberType}
                            minValue={minValue}
                            maxValue={maxValue}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.date:
                    return (
                        <DateCellEditor
                            value={params.value as string | null}
                            onChange={handleChange}
                            dateAndTime={dateAndTime}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.time:
                    return (
                        <TimeCellEditor
                            value={params.value as string | null}
                            showSeconds={showSeconds || false}
                            onChange={handleChange}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.checkbox:
                    return (
                        <CheckboxCellEditor
                            value={params.value as boolean}
                            onChange={handleChange}
                            label=""
                        />
                    );

                case FieldTypeIds.list:
                    return (
                        <ListCellEditor
                            value={params.value as string[]}
                            onChange={handleChange}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.link:
                    return (
                        <LinkCellEditor
                            value={params.value}
                            onChange={handleChange}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.location:
                    return (
                        <LocationCellEditor
                            value={params.value}
                            onChange={handleChange}
                            coordinateType={coordinateType}
                            isRequired={required}
                        />
                    );

                case FieldTypeIds.file:
                    return (
                        <FileCellEditor
                            value={params.value}
                            onChange={handleChange}
                            isRequired={required}
                        />
                    );

                default:
                    return renderFallbackTextField(params);
            }
        },
        [findFormFieldByColumnName, updateCellValue, renderFallbackTextField],
    );

    return { renderEditCell };
};
