import { useFormStructureContext } from "../../../../../context/FormStructureContext";
import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../constants";
import { FORM_ELEMENTS } from "../../../../../../../utils/interfaces";
import { Autocomplete, Box, Checkbox, TextField, Tooltip, Typography } from "@mui/material";
import { FORM_ELEMENT_ICONS } from "../../../../../../../components/FORM_ELEMENT_ICONS";
import { FormComponentType } from "../../../../../schemas/conditions";
import { ValueOf } from "../../../../../../../types/utils";
import { ReactElement, useEffect, useMemo } from "react";
import styles from "./style.module.css";
import { Info } from "@mui/icons-material";

interface AvailableComponentsData {
  ids: string[];
  getLabel: (id: string) => string;

  getIcon?: (id: string) => ReactElement;
}

const ComponentTypeLabels: Record<ValueOf<typeof FormComponentType>, string> = {
  [FormComponentType.FIELD]: "שדות",
  [FormComponentType.SECTION]: "מקטעים",
};

const TooltipContent = () => (
  <div dir={"rtl"}>
    בחר את השדות והמקטעים <b>שיופיעו</b> כאשר התנאים יתקיימו
    במידה ושדה או מקטע מושפע מתנאים אחרים, הוא יוצג רק אם כל התנאים מתקיימים -
    <br />
    יש לוודא שהתנאים לא מתנגשים כדי להימנע ממצבים בהם הם לא יוצגו.
  </div>
);

function FormConditionsDependencyPicker() {
  const { formStructure: { fields, sections } } = useFormStructureContext();
  const {
    conditionData: { dependantComponents, groups },
    setData,
  } = useFormConditionEditorContext(ConditionEditorStepId.DEPENDENCY_PICKER);

  const availableComponents: Record<ValueOf<typeof FormComponentType>, AvailableComponentsData> = useMemo(() => {
    const conditionedFieldIds = groups?.flatMap((group) => group?.predicates).map((predicate) => predicate?.field?.id);
    const conditionedFieldsParentIds = conditionedFieldIds?.map((fieldId) => fields[fieldId ?? ""]?.parentSectionId);

    return {
      [FormComponentType.FIELD]: {
        ids: Object.keys(fields).filter((fieldId) => (
          fields[fieldId].data?.displayName &&
          !conditionedFieldIds?.includes(fieldId)
        )),
        getLabel: (id) => fields[id]?.data?.displayName,
        getIcon: (id) => FORM_ELEMENT_ICONS[FORM_ELEMENTS[fields[id]?.data?.typeId].icon],
      },
      [FormComponentType.SECTION]: {
        ids: Object.keys(sections).filter((sectionId) => (!conditionedFieldsParentIds?.includes(sectionId))),
        getLabel: (id) => sections[id]?.title,
      },
    };
  }, [fields, groups, sections]);

  useEffect(() => {
    setData((prev) => {
      return {
        ...prev,
        [FormComponentType.FIELD]: prev[FormComponentType.FIELD]?.filter((fieldId) => availableComponents[FormComponentType.FIELD].ids.includes(fieldId)),
      };
    });
  }, [fields, availableComponents[FormComponentType.FIELD]]);

  return (
    <div className={styles.content}>
      <div className={styles.contentDescription}>
        <Typography variant={"h6"} fontWeight={"bold"}>במידה והתנאים מתקיימים מה נדרש להציג:</Typography>
        <Tooltip title={<TooltipContent />}>
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>
      </div>
      <div className={styles.inputsContainer}>
        {
          Object.values(FormComponentType).map((componentType) => (
            <Autocomplete key={componentType}
              fullWidth
              multiple
              disableCloseOnSelect
              options={availableComponents[componentType].ids ?? []}
              value={dependantComponents[componentType] ?? []}
              getOptionLabel={(componentId) => componentId ? availableComponents[componentType].getLabel(componentId) : "שגיאה - שדה אינו קיים"}
              noOptionsText={`אין ${ComponentTypeLabels[componentType]} מתאימים בטופס`}
              onChange={
                (_, ids) => setData((prev) => {
                  return {
                    ...prev,
                    [componentType]: ids ?? [],
                  };
                })
              }
              renderOption={
                ({ key, ...restProps }, componentId, { selected }) => {
                  if (!componentId) return;

                  const icon = availableComponents[componentType].getIcon?.(componentId);
                  const label = availableComponents[componentType].getLabel(componentId);

                  return (
                    <Box key={key} component={"li"} sx={{ fontSize: 20 }} {...restProps}>
                      {icon && <div className={styles.fieldOptionIcon}>{icon}</div>}
                      {label}
                      <Checkbox
                        style={{ marginRight: "auto" }}
                        checked={selected}
                      />
                    </Box>
                  );
                }
              }
              renderInput={(params) => (
                <TextField {...params}
                  label={ComponentTypeLabels[componentType]}
                  slotProps={{
                    htmlInput: {
                      ...params.inputProps,
                      autoComplete: "new-password",
                      dir: "rtl",
                      style: {
                        ...params.inputProps.style,
                        height: 60,
                      },
                    },
                  }} />
              )}
            />
          ),
          )
        }
      </div>
    </div>
  );
}

export { FormConditionsDependencyPicker };