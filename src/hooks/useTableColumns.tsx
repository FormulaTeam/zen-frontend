import React from "react";
import moment from "moment";
import { Box, Tooltip } from "@mui/material";
import cloudSync from "../images/cloud.png";
import { CustomIcon } from "../theme/icons";
import { FieldTypeIds } from "../utils/interfaces";
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_TIME_FORMAT } from "../utils/utils";
import CustomCarousel from "../components/FilePreview/CustomCarousel";
import ZoomCell from "../components/formInForm/ZoomCell";
import FormFieldRenderer from "../components/Responses/FormFieldRenderer";
import { ViewColumn } from "../types/interfaces/tableViews.types";
import type { FieldValidity } from "../hooks/useResponseState";

export const useTableColumns = (
  setColumns: (cols: any[]) => void,
  fileOnClickHandler: (file: any) => void,
  isSynchedToMetro: Function,
  sorting: any[], // kept for signature compatibility
  setLoadingInsideTable: (val: boolean) => void,
  responsesHaveParents: boolean,
  isQuickEditMode = false,
  onCellValueChange?: (rowId: string, fieldId: string, value: any) => void,
  validationErrors?: Record<string, Record<string, string>>,
  rowSelection?: Record<string, boolean>,
  editedData?: Record<string, Record<string, any>>,
  isRowInEditMode?: (rowId: string) => boolean,
  forceRenderCounter?: number,
  fieldOptions?: Record<string, any>,
) => {
  const makeFieldValidityFromError = (field: any, msg?: string): FieldValidity => {
    if (!msg) {
      if (field.typeId === FieldTypeIds.link) return { link: true, linkTxt: true };
      if (field.typeId === FieldTypeIds.location) return { x: true, y: true };
      return true;
    }

    if (field.typeId === FieldTypeIds.link) {
      return {
        link: false,
        linkTxt: false,
        linkMsg: msg,
        linkTxtMsg: msg,
      };
    }

    if (field.typeId === FieldTypeIds.location) {
      return {
        x: false,
        y: false,
        xMsg: msg,
        yMsg: msg,
      };
    }

    return { valid: false, message: msg };
  };

  const createTableColumns = (form: any, permissionTypes: any, viewConfig?: ViewColumn[]) => {
    const timestamp = Date.now();

    if (!form || !form.fields) {
      setColumns([]);
      setLoadingInsideTable(false);
      return;
    }

    if (!permissionTypes) permissionTypes = [];

    const buildParentResponseColumn = () => ({
      id: "parentResponse",
      header: "תגובת אב",
      accessorKey: "parentResponse",
      enableFiltering: false,
      enableSorting: false,
      grow: false,
      enableResizing: false,
      size: 140,
      Cell: ({ row }: any) => {
        return <ZoomCell row={row} form={form} />;
      },
    });

    const buildIdColumn = () => ({
      id: "id",
      header: "מזהה",
      accessorKey: "id",
      enableColumnFilter: true,
      filterVariant: "number",
      filterFn: "equals",
      muiFilterTextFieldProps: { type: "number" },
      grow: false,
      enableResizing: false,
      size: 140,
    });

    const buildSyncColumn = () => ({
      id: "pushed_to_metro",
      header: "סטטוס סנכרון",
      Header: (
        <Box display={"flex"}>
          <img className="cloud-sync-img" width={25} src={cloudSync} alt="סטטוס סנכרון למטרו" />
        </Box>
      ),
      enableColumnActions: true,
      accessorKey: "pushed_to_metro",
      enableGrouping: false,
      grow: false,
      size: 125,
      renderColumnActionsMenuItems: ({ internalColumnMenuItems }: any) => {
        const arr: any[] = [];
        internalColumnMenuItems.forEach((element: any) => {
          const newLabel = element?.props?.label?.replace("[object Object]", "pushed_to_metro");
          arr.push({
            ...element,
            props: { ...element?.props, label: newLabel },
          });
        });
        return arr;
      },
      Cell: ({ row }: any) => (
        <Box>
          <Tooltip
            title={
              row?.original?.pushed_to_metro
                ? "סונכרן למטרו ב-" +
                  moment(row?.original?.pushed_to_metro).format(DEFAULT_DATE_FORMAT)
                : "לא סונכרן"
            }>
            <div>
              {isSynchedToMetro(row?.original?.pushed_to_metro, row?.original?.edited) ? (
                <CustomIcon iconName="metroSynced" />
              ) : (
                <CustomIcon iconName="metroUnsynced" />
              )}
            </div>
          </Tooltip>
        </Box>
      ),
      enableResizing: false,
    });

    const addSystemEditedByColumn = () => ({
      id: "edited_by_name",
      header: "השתנה ע״י",
      accessorKey: "edited_by_name",
      enableColumnFilter: true,
      filterVariant: "text",
      filterFn: "contains",
    });

    const addSystemEditedColumn = () => ({
      id: "edited",
      header: "השתנה",
      accessorKey: "edited",
      enableGrouping: false,
      grow: true,
      size: 150,
      Cell: ({ row }: any) => {
        const value = moment(row?.original?.edited).format(DEFAULT_DATE_FORMAT);
        return (
          <Box className="cell-box" component="span">
            <label title={value}>{value}</label>
          </Box>
        );
      },
      enableResizing: false,
    });

    const buildDynamicFieldColumn = (field: any) => {
      if (field.typeId === FieldTypeIds.form) return; // skip connected forms

      const displayName = String(field.displayName ?? "");
      const uniqueId = field?.uniqueId;

      const col: any = {
        id: uniqueId,
        header: displayName,
        accessorKey: uniqueId,
        enableGrouping: false,
        grow: true,
        innerName: field.name,
        Cell: ({ row }: any) => {
          const renderKey = `${
            row.original.id
          }-${uniqueId}-${isQuickEditMode}-${timestamp}-${JSON.stringify(rowSelection)}-${
            forceRenderCounter || 0
          }`;

          if (row?.original?.data) {
            const item = row.original.data?.find((f: any) => f.uniqueId === uniqueId);
            const value = ![undefined, null].includes(item?.value) ? item?.value : "";

            const shouldShowEditableField = isQuickEditMode && isRowInEditMode?.(row.original.id);

            if (shouldShowEditableField) {
              const handleCellValueChange = (newValue: any, fieldUniqueId: string) => {
                onCellValueChange?.(row.original.id, fieldUniqueId, newValue);
              };

              const editedValue = editedData?.[row.original.id]?.[uniqueId];
              const currentValue = editedValue !== undefined ? editedValue : value;

              const msg = validationErrors?.[row.original.id]?.[uniqueId];
              const fieldValidity = makeFieldValidityFromError(field, msg);

              const formFieldsByIdMap = new Map();
              const formFieldsValuesMap = new Map();
              const formFieldsValidMap = new Map();

              formFieldsByIdMap.set(uniqueId, field);
              formFieldsValuesMap.set(uniqueId, currentValue);
              formFieldsValidMap.set(uniqueId, fieldValidity);

              const cellFieldOptions = fieldOptions?.[uniqueId]
                ? { [uniqueId]: fieldOptions[uniqueId] }
                : {};

              return (
                <Box
                  key={renderKey}
                  sx={{
                    zoom: 0.9,
                    display: "flex",
                    alignItems: "center",
                    minHeight: "60px",
                    width: "100%",
                    cursor: "text",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                  }}>
                  <FormFieldRenderer
                    formId={form.id}
                    formField={field}
                    formFieldsByIdMap={formFieldsByIdMap}
                    formFieldsValuesMap={formFieldsValuesMap}
                    formFieldsValidMap={formFieldsValidMap}
                    touchedFields={{ [String(uniqueId)]: true }}
                    onBlurField={() => {}}
                    onChangeHandler={handleCellValueChange}
                    viewMode={false}
                    fieldOptions={cellFieldOptions}
                    formFields={[field]}
                    index={0}
                    isTabularEdit={true}
                  />
                </Box>
              );
            }

            // display modes
            if (field.typeId === FieldTypeIds.link) {
              return (
                <Box className="cell-box" component="span">
                  <label title={value?.link || ""}>
                    <a
                      href={/^https?:\/\//.test(value.link) ? value.link : `https://${value.link}`}
                      target="_blank"
                      rel="noreferrer">
                      {value.linkTxt}
                    </a>
                  </label>
                </Box>
              );
            }

            if (field.typeId === FieldTypeIds.file) {
              return value.files?.length > 0 ? (
                <CustomCarousel
                  formId={form.id}
                  items={value.files}
                  onItemClickHandler={fileOnClickHandler}
                />
              ) : (
                <></>
              );
            }

            if (field.typeId === FieldTypeIds.hour) {
              if (value && value !== "") {
                if (/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value)) {
                  return (
                    <Box className="cell-box-date" component="span">
                      <label>{value}</label>
                    </Box>
                  );
                }
                if (value instanceof Date) {
                  const hours = value.getHours().toString().padStart(2, "0");
                  const minutes = value.getMinutes().toString().padStart(2, "0");
                  const seconds = value.getSeconds().toString().padStart(2, "0");
                  return (
                    <Box className="cell-box-date" component="span">
                      <label>{`${hours}:${minutes}:${seconds}`}</label>
                    </Box>
                  );
                }
              }
              return (
                <Box className="cell-box-date" component="span">
                  <label></label>
                </Box>
              );
            }

            if (field.typeId === FieldTypeIds.date) {
              if (value && value !== "" && moment(value).isValid()) {
                const formatted = field.dateAndTime
                  ? moment(value).format(DEFAULT_DATE_TIME_FORMAT)
                  : moment(value).format(DEFAULT_DATE_FORMAT);
                return (
                  <Box className="cell-box-date" component="span">
                    <label>{formatted}</label>
                  </Box>
                );
              }
            }

            if (field.typeId === FieldTypeIds.location) {
              if (value?.x && value?.y) {
                return (
                  <div className="cell-box">
                    <div>
                      <label>{`x: ${value.x}`}</label>
                    </div>
                    <div>
                      <label>{`y: ${value.y}`}</label>
                    </div>
                  </div>
                );
              }
              return null;
            }

            if (field.typeId === FieldTypeIds.checkbox) return <div>{value ? "כן" : "לא"}</div>;
            if (field.typeId === FieldTypeIds.number) return <div dir="ltr">{String(value)}</div>;

            if (value && (typeof value === "string" || typeof value === "number")) {
              return (
                <Box className="cell-box" component="span">
                  <label>{value}</label>
                </Box>
              );
            }

            if (value && Array.isArray(value)) {
              return (
                <Box className="cell-box" component="span">
                  <label>{value.join(", ")}</label>
                </Box>
              );
            }
          }

          return <Box className="cell-box" component="span"></Box>;
        },
      };

      if (field.typeId === FieldTypeIds.options) {
        col.filterFn = "equals";
        col.filterSelectOptions =
          (fieldOptions?.[field.uniqueId] && [
            ...new Set(fieldOptions[field.uniqueId].map((option: any) => option.value)),
          ]) ||
          field.options ||
          [];
        col.filterVariant = "select";
      }

      if (field.typeId === FieldTypeIds.number) {
        col.filterVariant = "number";
        col.sortingFn = (rowA: any, rowB: any, columnId: string) => {
          const valueA = rowA.getValue(columnId);
          const valueB = rowB.getValue(columnId);
          return valueB - valueA;
        };
        col.muiFilterTextFieldProps = { type: "number" };
      }

      if (field.typeId === FieldTypeIds.file) col.grow = false;

      if (field.typeId === FieldTypeIds.checkbox) {
        col.filterVariant = "select";
        col.filterSelectOptions = [
          { value: true, label: "כן" },
          { value: false, label: "לא" },
        ];
      }

      return col;
    };

    const cols: any[] = [];

    if (viewConfig?.length) {
      const visibleConfigs = viewConfig
        .filter((vc) => vc.visible)
        .sort((a, b) => a.order - b.order);

      visibleConfigs.forEach((vc) => {
        switch (vc.columnId) {
          case "id":
            cols.push(buildIdColumn());
            break;
          case "pushed_to_metro":
            cols.push(buildSyncColumn());
            break;
          case "edited_by_name":
            cols.push(addSystemEditedByColumn());
            break;
          case "edited":
            cols.push(addSystemEditedColumn());
            break;
          default: {
            const f = form.fields.find((ff: any) => ff.uniqueId === vc.columnId);
            if (f) {
              const dyn = buildDynamicFieldColumn(f);
              if (dyn) cols.push(dyn);
            }
            break;
          }
        }
      });
    } else {
      cols.push(buildIdColumn());
      cols.push(buildSyncColumn());

      const sortedFormFields = [...form.fields].sort((a: any, b: any) => {
        const sectionOrderDiff = (a?.sectionOrder ?? 0) - (b?.sectionOrder ?? 0);
        if (sectionOrderDiff !== 0) return sectionOrderDiff;
        return a.index - b.index;
      });

      sortedFormFields.forEach((f: any) => {
        const dyn = buildDynamicFieldColumn(f);
        if (dyn) cols.push(dyn);
      });

      cols.push(addSystemEditedByColumn());
      cols.push(addSystemEditedColumn());
    }

    if (responsesHaveParents) cols.push(buildParentResponseColumn());

    setColumns(cols);
    setLoadingInsideTable(false);
  };

  return { createTableColumns };
};
