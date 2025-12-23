import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId, ConditionOperatorLabel } from "../../constants";
import { useFormStructureContext } from "../../../../../context/FormStructureContext";
import { ConditionTypeOptionsData } from "../FormConditionBuilder/utils";
import { Typography } from "@mui/material";
import { FormComponentType } from "../../../../../schemas/conditions";

function FormConditionsSummary() {
  const {
    conditionData: { groups, dependantComponents, name },
    setData,
  } = useFormConditionEditorContext(ConditionEditorStepId.SUMMARY);
  const { formStructure: { fields, sections } } = useFormStructureContext();

  const conditionsString = groups?.flatMap((group) => {
    const { conditions, operator = "" } = group ?? {};

    return (
      `${
        operator ? `${ConditionOperatorLabel[operator]} \n` : ""
      }${
        conditions?.map((condition) => {
          const { field, operator = "" } = condition ?? {};

          return (
            `${
              operator ? ConditionOperatorLabel[operator] : ""
            }\n${
              fields[field?.id ?? ""]?.data?.displayName ?? "שגיאה - שדה אינו קיים"
            } ${
              ConditionTypeOptionsData[field?.typeId ?? -1]?.[field?.conditionType].label ?? ""
            } ${
              field?.targetValue ?? ""
            }`
          );
        }).join("\n")
      }\n`
    );
  }).join("\n");

  return (
    <div>
      <div>
        התנאים שהוגדרו:
        <Typography sx={{ whiteSpace: "pre-line" }}>
          {conditionsString}
        </Typography>
      </div>
      <br />
      <br />
      <div>
        במידה ויתקיימו יוצגו:
        <div>
          מקטעים:
          <div>
            {dependantComponents[FormComponentType.SECTION]?.map((componentId) => sections[componentId ?? ""]?.title).join(", ")}
          </div>
        </div>
        <div>
          שדות:
          <div>
            {dependantComponents[FormComponentType.FIELD]?.map((componentId) => fields[componentId ?? ""]?.data?.displayName).join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
}

export { FormConditionsSummary };