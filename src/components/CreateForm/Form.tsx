import React, { useEffect, useState } from "react";
import { DragDropContext, DraggableLocation, DropResult } from "@hello-pangea/dnd";
import { Box } from "@mui/material";
import ConfirmPopup from "../../popups/ConfirmPopup/ConfirmPopup";
import {
  connectionTypes,
  CustomFormField,
  DRAGGED_ITEM_ID,
  FORM_ELEMENTS,
  FormElements,
  FormField,
} from "../../utils/interfaces";
import AlertMsg from "../AlertMsg/AlertMsg";
import FormItemList from "../FormItemList/FormItemList";
import TitleTextField from "../TitleTextField/TitleTextField";
import Layout from "./Layout";
import TopToolbar from "./TopToolbar";
import { CustomFieldsDialog } from "../../popups/CustomFieldsDialog/CustomFieldsDialog";
import useCustomFormFields from "../../hooks/Forms/useCustomFormFields";
import FormSectionsList from "./FormSectionsList";
import FormPropertyRenderer from "./FormPropertyRenderer";
import { ResponseCount } from "../../types/interfaces/responses.types";
import { useCreateForm, getResponsesCount, useUpdateForm } from "../../api";
import { CreateFormDto } from "../../api/formsApi";
import {
  generateNewFormFieldData,
  getInitialNewForm,
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/utils";
import { ABC_AND_DASH_REGEX, HEBREW_REGEX } from "../../utils/formRegex";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorMessageType, ReservedFieldName } from "../../types/interfaces/forms.types";
import { useSectionManagement } from "../../hooks/Forms/useSectionManagement";
import {
  FORM_FIELD_PREFIX,
  FORM_FIELDS_PREFIX,
  NOT_A_SECTION_ID,
} from "../../utils/sections/consts";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { IPath } from "../../types/enums/global.enums";
import { texts } from "../../utils/texts";
import ConditionalPopup from "../ConditionalPopup/ConditionalPopup";
import {
  handleFieldAddedToSection,
  handleFieldMovedBetweenSections,
} from "../../utils/sectionConditionUtils";
import { RESERVED_FIELD_NAMES } from "../../consts/form";
import { FormDto, FormFieldDto, FormSectionDto } from "../../types/shared";
import { fieldType } from "formula-gear";

type EditorFieldExtra = {
  options?: string[];
  multiSelect?: boolean;
  defaultValue?: unknown;
  validationRegex?: string;
  linkedFormId?: number;
  connectedFieldId?: string;
  parentFieldId?: string;
  parentFieldName?: string;
  parentDependencies?: Array<{
    parentOptionIndex: number;
    childOptionIndices: number[];
  }>;
  coordinateType?: string;
  minValue?: number;
  maxValue?: number;
  numberType?: string;
  initialNumberValue?: number;
  conditions?: unknown[];
  sectionDescription?: string;
  dateAndTime?: boolean;
  initialValType?: unknown;
  showSeconds?: boolean;
  connectionType?: string | number;
  shouldSyncToMetro?: boolean;
  fieldIcon?: string;
  fieldName?: string;
  sectionId?: string;
  sectionOrder?: number;
};

type EditorFormField = FormFieldDto & {
  extra?: EditorFieldExtra;
};

interface FormProps {
  formToEdit: Partial<FormDto> | null;
  currentUser: any;
}

const getFieldExtra = (field?: EditorFormField | null): EditorFieldExtra =>
  (field?.extra as EditorFieldExtra | undefined) ?? {};

const updateFieldExtra = (
  field: EditorFormField,
  patch: Partial<EditorFieldExtra>,
): EditorFormField => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

const getSectionId = (field: EditorFormField) => getFieldExtra(field).sectionId ?? NOT_A_SECTION_ID;

const getFieldOptions = (field: EditorFormField) => getFieldExtra(field).options ?? [];

const isEditorFormField = (field: unknown): field is EditorFormField => {
  return !!field && typeof field === "object" && "id" in field && "fieldType" in field;
};

const legacyTypeToDtoFieldType = (typeId: number): FormFieldDto["fieldType"] => {
  switch (typeId) {
    case 1:
      return fieldType.LongText;
    case 2:
      return fieldType.ShortText;
    case 3:
      return fieldType.Options;
    case 4:
      return fieldType.Link;
    case 5:
      return fieldType.Date;
    case 6:
      return fieldType.Time;
    case 7:
      return fieldType.Location;
    case 8:
      return fieldType.Boolean;
    case 9:
      return fieldType.List;
    case 10:
      return fieldType.Number;
    case 11:
      return fieldType.File;
    case 12:
      return fieldType.Form;
    default:
      return fieldType.ShortText;
  }
};

const coerceToEditorField = (field: EditorFormField | FormField): EditorFormField => {
  if (isEditorFormField(field)) {
    return field;
  }

  return {
    id: field.uniqueId,
    index: field.index,
    name: field.name,
    fieldType: legacyTypeToDtoFieldType(field.typeId),
    displayName: field.displayName,
    isRequired: Boolean(field.required),
    extra: {
      options: field.options,
      multiSelect: field.multiSelect,
      defaultValue: field.defaultValue,
      validationRegex: field.validationRegex,
      linkedFormId: field.linkedFormId,
      connectedFieldId: field.connectedFieldId,
      parentFieldId: field.parentFieldId,
      parentFieldName: (field as any).parentFieldName,
      parentDependencies: field.parentDependencies,
      coordinateType: field.coordinateType,
      minValue: field.minValue,
      maxValue: field.maxValue,
      numberType: field.numberType,
      initialNumberValue: field.initialNumberValue,
      conditions: field.conditions,
      sectionDescription: field.sectionDescription,
      dateAndTime: field.dateAndTime,
      initialValType: field.initialValType,
      showSeconds: field.showSeconds,
      connectionType: field.connectionType,
      shouldSyncToMetro: field.shouldSyncToMetro,
      fieldIcon: (field as any).fieldIcon,
      fieldName: (field as any).fieldName,
      sectionId: field.sectionId,
      sectionOrder: field.sectionOrder,
    },
  };
};

const flattenFormFields = (form: Partial<FormDto> | null | undefined): EditorFormField[] => {
  const sections = [...(form?.sections ?? [])].sort((a, b) => a.index - b.index);

  return sections.flatMap((section) =>
    [...(section.fields ?? [])]
      .sort((a, b) => a.index - b.index)
      .map((field) =>
        updateFieldExtra(field as EditorFormField, {
          sectionId: section.id,
          sectionOrder: section.index,
        }),
      ),
  );
};

const buildSectionsFromFields = (
  fields: EditorFormField[],
  sections: Array<{ id: string; name: string; order: number }>,
): FormSectionDto[] => {
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return sortedSections.map((section) => ({
    id: section.id,
    name: section.name,
    index: section.order,
    fields: fields
      .filter((field) => getSectionId(field) === section.id)
      .sort((a, b) => a.index - b.index)
      .map((field, fieldIndex) => ({
        id: field.id,
        name: field.name,
        index: fieldIndex,
        fieldType: field.fieldType,
        displayName: field.displayName,
        isRequired: field.isRequired,
        extra: (() => {
          const extra = { ...getFieldExtra(field) };
          delete extra.sectionId;
          delete extra.sectionOrder;
          return extra;
        })(),
      })),
  }));
};

const mapGeneratedFieldToDto = (
  generatedField: any,
  fallbackSectionId: string,
  fallbackSectionOrder: number,
): EditorFormField => ({
  id: generatedField.uniqueId,
  index: generatedField.index ?? 0,
  name: generatedField.name ?? "",
  fieldType: legacyTypeToDtoFieldType(generatedField.typeId),
  displayName: generatedField.displayName ?? "",
  isRequired: Boolean(generatedField.required),
  extra: {
    options: generatedField.options,
    multiSelect: generatedField.multiSelect,
    defaultValue: generatedField.defaultValue,
    validationRegex: generatedField.validationRegex,
    linkedFormId: generatedField.linkedFormId,
    connectedFieldId: generatedField.connectedFieldId,
    parentFieldId: generatedField.parentFieldId,
    parentFieldName: generatedField.parentFieldName,
    parentDependencies: generatedField.parentDependencies,
    coordinateType: generatedField.coordinateType,
    minValue: generatedField.minValue,
    maxValue: generatedField.maxValue,
    numberType: generatedField.numberType,
    initialNumberValue: generatedField.initialNumberValue,
    conditions: generatedField.conditions,
    sectionDescription: generatedField.sectionDescription,
    dateAndTime: generatedField.dateAndTime,
    initialValType: generatedField.initialValType,
    showSeconds: generatedField.showSeconds,
    connectionType: generatedField.connectionType,
    shouldSyncToMetro: generatedField.shouldSyncToMetro,
    fieldIcon: generatedField.fieldIcon,
    fieldName: generatedField.fieldName,
    sectionId: generatedField.sectionId ?? fallbackSectionId,
    sectionOrder: generatedField.sectionOrder ?? fallbackSectionOrder,
  },
});

const FieldsVisual: React.FC<FormProps> = ({ formToEdit, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initCustomFields, customFields } = useCustomFormFields();

  const initialForm = getInitialNewForm(currentUser);

  const [loading, setLoading] = useState<boolean>(false);
  const [currentFormId, setCurrentFormId] = useState<number>(formToEdit?.id ?? 0);
  const [isFormCreated, setIsFormCreated] = useState(Boolean(formToEdit?.id));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [showTitleRedText, setShowTitleRedText] = useState(false);
  const [titleInvalid, setTitleInvalid] = useState(false);
  const [description, setDescription] = useState("");
  const [formFields, setFormFields] = useState<EditorFormField[]>([]);
  const [showCustomFieldsDialog, setShowCustomFieldsDialog] = useState<boolean>(false);
  const [confirmBtnText, setConfirmBtnText] = useState<string>("מחק עמודה");
  const [items, setItems] = useState<Partial<FormElements>>({ ...FORM_ELEMENTS });
  const [formIconName, setFormIconName] = useState<any>(formToEdit?.icon ?? initialForm.icon);
  const [parentFieldId, setParentFieldId] = useState<string | undefined>(undefined);
  const [showConditionsPopup, setShowConditionsPopup] = useState(false);
  const [formFieldsInnerErrors, setFormFieldsInnerErrors] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [formFieldsDisplayErrors, setFormFieldsDisplayErrors] = useState<Map<string, string[]>>(
    new Map(),
  );

  const { mutateAsync: mutateCreateFormAsync } = useCreateForm();
  const { mutateAsync: mutateUpdateFormAsync } = useUpdateForm();

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalIcon, setOriginalIcon] = useState("");
  const [originalFormFields, setOriginalFormFields] = useState<EditorFormField[]>([]);
  const [originalParentFieldId, setOriginalParentFieldId] = useState<string | undefined>(undefined);
  const [formFieldsNamesValidMap, setFormFieldsNamesValidMap] = useState<Map<number, boolean>>(
    new Map(),
  );
  const [formFieldsDisplayNamesValidMap, setFormFieldsDisplayNamesValidMap] = useState<
    Map<number, boolean>
  >(new Map());
  const [formFieldsNamesRedTextMap, setFormFieldsNamesRedTextMap] = useState<Map<string, boolean>>(
    new Map(),
  );
  const [formFieldsUniqueNamesValidMap, setFormFieldsUniqueNamesValidMap] = useState<
    Map<string, boolean>
  >(new Map());
  const [formFieldsUniqueDisplayNamesValidMap, setFormFieldsUniqueDisplayNamesValidMap] = useState<
    Map<string, boolean>
  >(new Map());
  const [responsesCount, setResponsesCount] = useState(0);
  const [showAlertMsg, setShowAlertMsg] = useState<boolean>(false);
  const [alertMsgs, setAlertMsgs] = useState<string[]>([]);
  const [showConfirmMsg, setShowConfirmMsg] = useState<boolean>(false);
  const [confirmMsg, setConfirmMsg] = useState<string>("");
  const [confirmOkFunc, setConfirmOkFunc] = useState<any>(null);
  const [showButtonsOnPopup, setShowButtonsOnPopup] = useState<boolean>(true);
  const [errors, setErrors] = useState<ErrorMessageType[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const validateUnsavedChanges = () => {
    const hasChanges = checkHasUnsavedChanges();
    setHasUnsavedChanges(hasChanges);
    return hasChanges;
  };

  const {
    sections,
    setSections,
    addSection,
    removeSection,
    renameSection,
    toggleCollapse,
    changeSectionDescription,
    anounceRemoveSection,
    moveSection,
    orderSections,
    handleScrollToLastSection,
  } = useSectionManagement({
    formFields,
    setFormFields,
    validateUnsavedChanges,
    setAlertMsgs,
    setShowAlertMsg,
    setCurrentSectionId,
    setShowButtonsOnPopup,
  });

  useEffect(() => {
    validateUnsavedChanges();
  }, [title, description, formFields, formIconName]);

  const checkHasUnsavedChanges = (): boolean => {
    if (savedSuccess) {
      return false;
    }

    const isTitleSame = title === originalTitle;
    const isDescriptionSame = description === originalDescription;
    const isIconSame = formIconName === originalIcon;
    const sortedCurrent = [...formFields].sort((a, b) => a.index - b.index);
    const sortedOriginal = [...originalFormFields].sort((a, b) => a.index - b.index);
    const isParentFieldIdSame = parentFieldId === originalParentFieldId;
    const isFieldsSame = JSON.stringify(sortedCurrent) === JSON.stringify(sortedOriginal);

    return !(isTitleSame && isDescriptionSame && isFieldsSame && isIconSame && isParentFieldIdSame);
  };

  useEffect(() => {
    setHasUnsavedChanges(checkHasUnsavedChanges());
    setSavedSuccess(false);
  }, [title, description, formFields, formIconName]);

  const clearErrors = (key: string, fieldId: string) => {
    setErrors((prevErrors) =>
      prevErrors.filter(
        (error) => error.key !== key || (fieldId !== "" && error.fieldId !== fieldId),
      ),
    );

    if (key === "title") {
      setTitleInvalid(false);
      setShowTitleRedText(false);
    }
  };

  useEffect(() => {
    initCustomFields();
    getNumOfResponses(formToEdit?.id);
    populateFormData();
    return () => {
      setSavedSuccess(false);
    };
  }, [formToEdit]);

  const populateFormData = () => {
    setLoading(true);

    const nextTitle = formToEdit?.name ?? "";
    const nextDescription = formToEdit?.description ?? "";
    const nextFields = flattenFormFields(formToEdit);
    const nextSections = formToEdit?.sections ?? [];

    setTitle(nextTitle);
    setDescription(nextDescription);
    setFormFields(nextFields);

    const isNewForm = nextFields.length === 0;

    if (isNewForm) {
      setSections([
        { id: NOT_A_SECTION_ID, name: texts.heb.mainSection, collapsed: false, order: 0 },
      ]);
    } else if (nextSections.length === 0) {
      setSections([]);
    } else {
      orderSections(nextFields);
    }

    setCurrentFormId(formToEdit?.id ?? 0);
    setParentFieldId(undefined);

    nextFields.forEach((field) => {
      formFieldsNamesValidMap.set(field.index, true);
      formFieldsDisplayNamesValidMap.set(field.index, true);
    });

    setOriginalTitle(nextTitle);
    setOriginalDescription(nextDescription);
    setOriginalIcon(formToEdit?.icon ?? "");
    setOriginalFormFields(JSON.parse(JSON.stringify(nextFields)));
    setOriginalParentFieldId(undefined);
    setLoading(false);
  };

  const getNumOfResponses = async (formId?: number) => {
    try {
      if (!formId) return;
      const ans: ResponseCount = await getResponsesCount(formId);
      const nextResponsesCount: number = ans?.count || 0;
      setResponsesCount(nextResponsesCount);
    } catch {
      showErrorNotification("שליפת כמות התגובות נכשלה");
    }
  };

  const revalidateFormFieldsNames = (newFormFields: EditorFormField[]) => {
    const newFormFieldsNamesValidMap = new Map<number, boolean>();
    const newFormFieldsDisplayNamesValidMap = new Map<number, boolean>();

    newFormFields.forEach((field) => {
      newFormFieldsNamesValidMap.set(field.index, true);
      newFormFieldsDisplayNamesValidMap.set(field.index, true);
    });

    setFormFieldsNamesValidMap(newFormFieldsNamesValidMap);
    setFormFieldsDisplayNamesValidMap(newFormFieldsDisplayNamesValidMap);
  };

  const deleteField = (formField: EditorFormField) => {
    const newFormFields = formFields
      .filter((field) => field.id !== formField.id)
      .map((field, i) => ({ ...field, index: i }));

    revalidateFormFieldsNames(newFormFields);
    setFormFields(newFormFields);
  };

  const handleErrorMessage = (message: string, fieldTypeKey: string, fieldId: string) => {
    if (!message) return;

    setErrors((prevErrors) => {
      const filteredErrors = prevErrors.filter(
        (e) => !(e.key === fieldTypeKey && e.fieldId === fieldId),
      );
      return [...filteredErrors, { key: fieldTypeKey, message, fieldId }];
    });

    setAlertMsgs((prev) => [...prev, message]);
  };

  const exitForm = async () => {
    const from = location.state?.from || IPath.HOME;
    navigate(formFields.length > 0 && savedSuccess ? `/responses/${currentFormId}` : from);
    setSavedSuccess(false);
  };

  const saveForm = async (exit: boolean) => {
    setLoading(true);
    setHasUnsavedChanges(false);
    setShowAlertMsg(false);
    setAlertMsgs([]);

    if (validateRequiredFields()) {
      try {
        await saveFormToDb(formFields);
        setSavedSuccess(true);
        showSuccessNotification("הטופס נשמר בהצלחה!");
        setShowButtonsOnPopup(false);

        if (exit) {
          const from = location.state?.from || IPath.HOME;
          navigate(currentFormId && formFields.length > 0 ? `/responses/${currentFormId}` : from);
          setSavedSuccess(false);
        }
      } catch {
        showErrorNotification("שמירת הטופס נכשלה");
      }
    }

    setLoading(false);
    setShowButtonsOnPopup(false);
  };

  const saveFormToDb = async (
    newFormFields: EditorFormField[],
    options?: { isUpdateMetro?: boolean; formIcon?: string },
  ) => {
    setLoading(true);

    const defaultOptions = { formIcon: formIconName, isUpdateMetro: false };
    const mergedOptions = { ...defaultOptions, ...(options ?? {}) };
    const { isUpdateMetro, formIcon } = mergedOptions;
    const builtSections = buildSectionsFromFields(newFormFields, sections);

    if (!isFormCreated) {
      const createPayload: CreateFormDto = {
        name: title,
        description,
        icon: formIconName as CreateFormDto["icon"],
        sections: builtSections,
      };

      try {
        const createdForm = await mutateCreateFormAsync(createPayload);
        setCurrentFormId(createdForm.id);
        setIsFormCreated(true);
      } catch {
        showErrorNotification("יצירת הטופס נכשלה");
      } finally {
        setLoading(false);
      }

      return;
    }

    const updateId = formToEdit?.id ?? currentFormId;

    if (!updateId) {
      showErrorNotification("עידכון הטופס נכשל");
      setLoading(false);
      return;
    }

    const payload: Partial<FormDto> = {
      id: updateId,
      name: title,
      description,
      icon: formIcon,
      sections: builtSections,
    };

    try {
      await mutateUpdateFormAsync({
        id: updateId,
        formData: payload,
        isUpdateMetro,
      });
    } catch {
      showErrorNotification("עידכון הטופס נכשל");
    } finally {
      setLoading(false);
    }
  };

  const getFormPropertyTitleTextField = (formField: EditorFormField, index: number) => {
    const isNameValid =
      formFieldsNamesValidMap.get(index) !== undefined &&
      formFieldsUniqueNamesValidMap.get(formField.name) !== undefined
        ? Boolean(formFieldsNamesValidMap.get(index)) &&
          !formFieldsUniqueNamesValidMap.get(formField.name)
        : formFieldsNamesValidMap.get(index) !== undefined
          ? Boolean(formFieldsNamesValidMap.get(index))
          : formFieldsUniqueNamesValidMap.get(formField.name) !== undefined
            ? !formFieldsUniqueNamesValidMap.get(formField.name)
            : true;

    const isDisplayNameValid =
      formFieldsDisplayNamesValidMap.get(index) !== undefined &&
      formFieldsUniqueDisplayNamesValidMap.get(formField.displayName) !== undefined
        ? Boolean(formFieldsDisplayNamesValidMap.get(index)) &&
          !formFieldsUniqueDisplayNamesValidMap.get(formField.displayName)
        : formFieldsDisplayNamesValidMap.get(index) !== undefined
          ? Boolean(formFieldsDisplayNamesValidMap.get(index))
          : formFieldsUniqueDisplayNamesValidMap.get(formField.displayName) !== undefined
            ? !formFieldsUniqueDisplayNamesValidMap.get(formField.displayName)
            : true;

    const showNameError = !isNameValid;
    const showDisplayNameError = !isDisplayNameValid;

    const innerErrorMessages: string[] = formFieldsInnerErrors.get(formField.id) || [];
    const displayErrorMessages: string[] = formFieldsDisplayErrors.get(formField.id) || [];

    if (showNameError && innerErrorMessages.length === 0) {
      if (!formField.name) {
        innerErrorMessages.push("יש להזין שם פנימי");
      } else if (!/^[a-zA-Z_]+$/.test(formField.name)) {
        innerErrorMessages.push("שם פנימי חייב להכיל רק אותיות באנגלית ו־_");
      } else if (RESERVED_FIELD_NAMES.includes(formField.name.toLowerCase())) {
        innerErrorMessages.push(`אסור להשתמש בשם פנימי "${formField.name}"`);
      } else if (formFieldsUniqueNamesValidMap.get(formField.name)) {
        innerErrorMessages.push("שם פנימי כבר קיים");
      }
    }

    if (showDisplayNameError && displayErrorMessages.length === 0) {
      if (!formField.displayName) {
        displayErrorMessages.push("יש להזין שם תצוגה");
      } else {
        displayErrorMessages.push("שם תצוגה כבר קיים");
      }
    }

    return (
      <TitleTextField
        displayErrorMessages={displayErrorMessages}
        innerErrorMessages={innerErrorMessages}
        handleErrorMessage={handleErrorMessage}
        index={index}
        isNameValid={!showNameError}
        isDisplayNameValid={!showDisplayNameError}
        formField={formField}
        handleNameChange={changeFormPropertyName}
        handleDisplayNameChange={changeFormPropertyDisplayName}
        fieldNameError={!!formFieldsNamesRedTextMap.get(formField.id)}
        handleNameKeyDown={(event) => {
          if (event.ctrlKey || event.metaKey) {
            return;
          }

          const newMap = new Map(formFieldsNamesRedTextMap);

          if (!ABC_AND_DASH_REGEX.test(event.key)) {
            event.preventDefault();
            newMap.set(formField.id, true);
          } else {
            newMap.set(formField.id, false);
          }

          setFormFieldsNamesRedTextMap(newMap);
        }}
      />
    );
  };

  const addErrorIf = (
    condition: boolean,
    message: string,
    fieldTypeKey: string = "general",
    fieldId: string = "",
  ): boolean => {
    if (condition) {
      handleErrorMessage(message, fieldTypeKey, fieldId);
      setShowAlertMsg(true);
      return true;
    }
    return false;
  };

  const validateTitleFields = (): boolean => {
    let hasError = false;

    if (!title.match(HEBREW_REGEX)) {
      setTitleInvalid(true);
      if (addErrorIf(true, "שם הטופס מורכב מאותיות שאינן עברית.", "title")) {
        hasError = true;
      }
    }

    if (title.length < 5) {
      setTitleInvalid(true);
      if (addErrorIf(true, "שם הטופס פחות מ5 אותיות.", "title")) {
        hasError = true;
      }
    }

    if (!title) {
      setTitleInvalid(true);
      if (addErrorIf(true, "שם הטופס ריק", "title")) {
        hasError = true;
      }
    }

    if (hasError && validateUnsavedChanges()) {
      setShowAlertMsg(true);
    }

    return hasError;
  };

  const validateFormFields = () => {
    let hasEmptyColumnName = true;
    let hasEmptyColumnDisplayName = true;
    let hasEmptyOptionName = true;
    let has2FieldsSameNames = false;
    let has2FieldsSameDisplayNames = false;
    let hasEmptyFormConnection = false;
    let hasEmptyFieldConnection = false;
    let hasEmptyFormInFormConnection = false;
    let hasInvalidNumberField = false;

    const reservedFlags = new Map<ReservedFieldName, boolean>();
    RESERVED_FIELD_NAMES.forEach((name) => reservedFlags.set(name, false));

    const nameDupMap = new Map<string, boolean>();
    const displayNameDupMap = new Map<string, boolean>();
    const nameValidMap = new Map<number, boolean>();
    const displayNameValidMap = new Map<number, boolean>();
    const redTextMap = new Map<string, boolean>();

    const nameCount = new Map<string, number>();
    const displayNameCount = new Map<string, number>();

    for (const field of formFields) {
      const extra = getFieldExtra(field);
      redTextMap.set(field.id, false);

      if (field.name && extra.shouldSyncToMetro !== false) {
        nameCount.set(field.name, (nameCount.get(field.name) || 0) + 1);
      }

      if (field.displayName) {
        displayNameCount.set(field.displayName, (displayNameCount.get(field.displayName) || 0) + 1);
      }

      if (extra.shouldSyncToMetro === false) {
        nameValidMap.set(field.index, true);
      } else if (!field.name) {
        nameValidMap.set(field.index, false);
        hasEmptyColumnName = false;
      } else if (!field.name.match(ABC_AND_DASH_REGEX)) {
        nameValidMap.set(field.index, false);
        hasEmptyColumnName = false;
        addErrorIf(true, "השם הפנימי לא עומד בתקן", "general", field.id);
      } else {
        nameValidMap.set(field.index, true);
      }

      if (!field.displayName) {
        displayNameValidMap.set(field.index, false);
        hasEmptyColumnDisplayName = false;
      } else {
        displayNameValidMap.set(field.index, true);
      }

      if (
        field.name &&
        RESERVED_FIELD_NAMES.includes(field.name.toLowerCase() as ReservedFieldName)
      ) {
        const lower = field.name.toLowerCase() as ReservedFieldName;
        nameValidMap.set(field.index, false);
        reservedFlags.set(lower, true);
        addErrorIf(true, `אסור לקרוא לשדה בשם "${field.name}"`, "general", field.id);
      }

      if (extra.connectionType === connectionTypes.form) {
        if (!extra.linkedFormId) {
          hasEmptyFormConnection = true;
          addErrorIf(true, "שדה לא מחובר לטופס", "options", field.id);
        }

        if (!extra.connectedFieldId) {
          hasEmptyFieldConnection = true;
          addErrorIf(true, "שדה לא מחובר לשדה בטופס היעד", "options", field.id);
        }
      }

      if (field.fieldType === fieldType.Form && !extra.linkedFormId) {
        hasEmptyFormInFormConnection = true;
        addErrorIf(true, "שדה לא מחובר לטופס", "form", field.id);
      }

      if (getFieldOptions(field).length > 0 && extra.connectionType !== connectionTypes.form) {
        for (const option of getFieldOptions(field)) {
          if (!option) {
            hasEmptyOptionName = false;
          }
        }
      }

      if (field.fieldType === fieldType.Number) {
        const { minValue, maxValue, initialNumberValue } = extra;
        const hasInvalidRange =
          minValue !== undefined && maxValue !== undefined && minValue > maxValue;
        const defaultOutOfRange =
          initialNumberValue !== undefined &&
          ((minValue !== undefined && initialNumberValue < minValue) ||
            (maxValue !== undefined && initialNumberValue > maxValue));

        if (hasInvalidRange) {
          addErrorIf(true, "טווח ערכים לא תקין", "number", field.id);
        }

        if (defaultOutOfRange) {
          addErrorIf(true, "ערך ברירת המחדל חייב להיות בתוך טווח הערכים", "number", field.id);
        }

        if (hasInvalidRange || defaultOutOfRange) {
          nameValidMap.set(field.index, false);
          hasInvalidNumberField = true;
        }
      }
    }

    for (const [name, count] of nameCount.entries()) {
      if (count > 1) {
        has2FieldsSameNames = true;
        nameDupMap.set(name, true);
      }
    }

    for (const [displayName, count] of displayNameCount.entries()) {
      if (count > 1) {
        has2FieldsSameDisplayNames = true;
        displayNameDupMap.set(displayName, true);
      }
    }

    setFormFieldsNamesValidMap(nameValidMap);
    setFormFieldsDisplayNamesValidMap(displayNameValidMap);
    setFormFieldsUniqueNamesValidMap(nameDupMap);
    setFormFieldsUniqueDisplayNamesValidMap(displayNameDupMap);
    setFormFieldsNamesRedTextMap(redTextMap);

    return {
      hasEmptyColumnName,
      hasEmptyColumnDisplayName,
      hasEmptyOptionName,
      has2FieldsSameNames,
      has2FieldsSameDisplayNames,
      hasEmptyFormConnection,
      hasEmptyFieldConnection,
      reservedFlags,
      hasEmptyFormInFormConnection,
      hasInvalidNumberField,
    };
  };

  const validateRequiredFields = (): boolean => {
    setErrors([]);
    const hasTitleError = validateTitleFields();
    const fieldErrors = validateFormFields();

    if (fieldErrors.has2FieldsSameNames) {
      addErrorIf(true, "ישנן עמודות בטופס עם אותו שם פנימי...", "general");
      setShowAlertMsg(true);
    }

    if (fieldErrors.has2FieldsSameDisplayNames) {
      addErrorIf(true, "ישנן עמודות בטופס עם אותו שם תצוגה...", "general");
      setShowAlertMsg(true);
    }

    if (!fieldErrors.hasEmptyColumnName) {
      addErrorIf(true, "ישנן עמודות ללא שם פנימי...", "general");
      setShowAlertMsg(true);
    }

    if (!fieldErrors.hasEmptyColumnDisplayName) {
      addErrorIf(true, "ישנן עמודות ללא שם תצוגה...", "general");
      setShowAlertMsg(true);
    }

    if (!fieldErrors.hasEmptyOptionName) {
      addErrorIf(true, "ישנן אפשרויות ריקות בטופס...", "general");
      setShowAlertMsg(true);
    }

    for (const [name, found] of fieldErrors.reservedFlags.entries()) {
      if (found) {
        addErrorIf(true, `יש עמודה עם שם פנימי שמור "${name}"`, "general");
        setShowAlertMsg(true);
      }
    }

    if (fieldErrors.hasInvalidNumberField) {
      addErrorIf(
        true,
        "יש שדות מספר עם טווחים לא תקינים או ערכי ברירת מחדל לא חוקיים...",
        "general",
      );
      setShowAlertMsg(true);
    }

    return (
      !hasTitleError &&
      fieldErrors.hasEmptyColumnName &&
      fieldErrors.hasEmptyColumnDisplayName &&
      fieldErrors.hasEmptyOptionName &&
      !fieldErrors.has2FieldsSameNames &&
      !fieldErrors.has2FieldsSameDisplayNames &&
      !fieldErrors.hasEmptyFormConnection &&
      !fieldErrors.hasEmptyFieldConnection &&
      !fieldErrors.hasEmptyFormInFormConnection &&
      !fieldErrors.hasInvalidNumberField &&
      [...fieldErrors.reservedFlags.values()].every((v) => !v)
    );
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
  };

  const announceUnsavedChanges = () => {
    if (hasUnsavedChanges && !savedSuccess) {
      setAlertMsgs(["יש לך שינויים שלא נשמרו בטופס. האם ברצונך לשמור את השינויים?"]);
      setShowAlertMsg(true);
      setShowButtonsOnPopup(true);
    }
  };

  const changeFormPropertyName = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    prevName: string,
  ) => {
    const val = e.target.value;

    setFormFields((prev) =>
      prev.map((field) => (field.index === index ? { ...field, name: val } : field)),
    );

    const item = formFields.find((f) => f.index === index);
    if (item) {
      const newMap = new Map(formFieldsInnerErrors);
      const nextErrors: string[] = [];

      if (!val) {
        nextErrors.push("יש להזין שם פנימי");
      } else if (!/^[a-zA-Z_]+$/.test(val)) {
        nextErrors.push("שם פנימי חייב להכיל רק אותיות באנגלית ו־_");
      } else if (RESERVED_FIELD_NAMES.includes(val.toLowerCase())) {
        nextErrors.push(`אסור להשתמש בשם פנימי "${val}"`);
      }

      if (nextErrors.length > 0) {
        newMap.set(item.id, nextErrors);
      } else {
        newMap.delete(item.id);
      }

      setFormFieldsInnerErrors(newMap);
    }
  };

  const changeFormPropertyDisplayName = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    prevName: string,
  ) => {
    const val = e.target.value;

    setFormFields((prev) =>
      prev.map((field) => (field.index === index ? { ...field, displayName: val } : field)),
    );

    const item = formFields.find((f) => f.index === index);

    if (item) {
      const newMap = new Map(formFieldsDisplayErrors);
      const nextErrors: string[] = [];

      if (!val) {
        nextErrors.push("יש להזין שם תצוגה");
      }

      if (nextErrors.length > 0) {
        newMap.set(item.id, nextErrors);
      } else {
        newMap.delete(item.id);
      }

      setFormFieldsDisplayErrors(newMap);

      if (val) {
        formFieldsDisplayNamesValidMap.set(index, true);
        formFieldsUniqueDisplayNamesValidMap.set(val, false);
        formFieldsUniqueDisplayNamesValidMap.set(prevName, false);
      }
    }
  };

  const addItemToFormFields = (item: Partial<CustomFormField>, destinationIndex: number) => {
    const nextSectionId =
      item.sectionId && item.sectionId.includes(FORM_FIELDS_PREFIX)
        ? item.sectionId
        : `${FORM_FIELDS_PREFIX}${NOT_A_SECTION_ID}`;

    const sectionIdNoPrefix = nextSectionId.replace(FORM_FIELDS_PREFIX, "");
    const sectionOrder = sections.find((s) => s.id === sectionIdNoPrefix)?.order || 0;

    const generatedField = generateNewFormFieldData({
      ...item,
      sectionId: nextSectionId,
      sectionOrder,
    });

    const newFormField = mapGeneratedFieldToDto(generatedField, nextSectionId, sectionOrder);

    const fieldWithConditions = coerceToEditorField(
      handleFieldAddedToSection(formFields, newFormField as any, nextSectionId),
    );

    setFormFields((prevFormFields) => {
      const updated = [...prevFormFields];
      updated.splice(destinationIndex, 0, fieldWithConditions);
      const reindexed = updated.map((field, i) => ({ ...field, index: i }));
      revalidateFormFieldsNames(reindexed);
      return reindexed;
    });

    validateUnsavedChanges();
  };

  const removeDuplicateItemFromItemsList = () => {
    const res: Partial<FormElements> = {};

    Object.keys(items).forEach((typeId) => {
      if (+typeId !== DRAGGED_ITEM_ID) {
        res[typeId] = items[typeId];
      }
    });

    setItems(res);
  };

  const moveFieldBetweenSections = (source: DraggableLocation, destination: DraggableLocation) => {
    const updated = [...formFields];
    const [moved] = updated.splice(source.index, 1);

    const sourceSectionId = getSectionId(moved);
    const sectionIdNoPrefix = destination.droppableId.replace(FORM_FIELDS_PREFIX, "");
    const targetSection = sections.find((s) => s.id === sectionIdNoPrefix);

    const fieldWithManagedConditions = coerceToEditorField(
      handleFieldMovedBetweenSections(
        updated as any,
        moved as any,
        sourceSectionId,
        destination.droppableId,
      ),
    );

    const movedWithSection = updateFieldExtra(fieldWithManagedConditions, {
      sectionId: destination.droppableId,
      sectionOrder: targetSection?.order || 0,
    });

    updated.splice(destination.index, 0, movedWithSection);

    const reindexed = updated.map((field, i) => ({ ...field, index: i }));
    revalidateFormFieldsNames(reindexed);
    setFormFields(reindexed);
    validateUnsavedChanges();
  };

  const addNewFieldToForm = (source: DraggableLocation, destination: DraggableLocation) => {
    const draggedItemTypeId =
      source.droppableId === "items" ? Object.keys(items)[source.index] : null;

    const draggedItem =
      source.droppableId === "items" && draggedItemTypeId !== null
        ? items[draggedItemTypeId]
        : customFields[source.index];

    if (draggedItem) {
      const sectionIdNoPrefix = destination.droppableId.replace(FORM_FIELDS_PREFIX, "");
      const targetSection = sections.find((s) => s.id === sectionIdNoPrefix);

      const itemWithSection = {
        ...draggedItem,
        ...(draggedItemTypeId && { typeId: +draggedItemTypeId }),
        sectionId: destination.droppableId,
        sectionOrder: targetSection?.order || 0,
      };

      addItemToFormFields(itemWithSection, destination.index);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      removeDuplicateItemFromItemsList();
      return;
    }

    if (destination.droppableId === "SECTIONS") {
      moveSection(source, destination);
      return;
    }

    if (
      draggableId.includes(FORM_FIELD_PREFIX) &&
      destination.droppableId.startsWith("formFields_section_")
    ) {
      moveFieldBetweenSections(source, destination);
      removeDuplicateItemFromItemsList();
      return;
    }

    addNewFieldToForm(source, destination);
    removeDuplicateItemFromItemsList();
  };

  return (
    <Box
      sx={{
        position: "relative",
      }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Layout
          main={
            <FormSectionsList
              handleScrollToLastSection={handleScrollToLastSection}
              anounceRemoveSection={anounceRemoveSection}
              renameSection={renameSection}
              changeSectionDescription={changeSectionDescription}
              toggleCollapse={toggleCollapse}
              formFields={formFields}
              sections={sections}
              getFormProperty={(incomingFormField, dragHandleProps) => {
                const normalizedIncoming = coerceToEditorField(
                  incomingFormField as FormField | EditorFormField,
                );
                const currentField =
                  formFields.find((f) => f.id === normalizedIncoming.id) ?? normalizedIncoming;

                return (
                  <FormPropertyRenderer
                    errors={errors}
                    formField={currentField}
                    formFields={formFields}
                    setFormFields={setFormFields}
                    setParentFieldId={setParentFieldId}
                    getFormPropertyTitleTextField={getFormPropertyTitleTextField}
                    dragHandleProps={dragHandleProps}
                    responsesCount={responsesCount}
                    deleteField={deleteField}
                    setConfirmMsg={setConfirmMsg}
                    setConfirmOkFunc={setConfirmOkFunc}
                    setConfirmBtnText={setConfirmBtnText}
                    setShowConfirmMsg={setShowConfirmMsg}
                  />
                );
              }}
            />
          }
          sidebar={
            <FormItemList
              items={items}
              addItemToFormFields={addItemToFormFields}
              customFields={customFields}
              addSection={addSection}
              openConditionsPopup={() => setShowConditionsPopup(true)}
            />
          }
          toolbar={
            <TopToolbar
              savedSuccess={savedSuccess}
              announceUnsavedChanges={announceUnsavedChanges}
              errorMessage={errors.find((error) => error.key === "title")}
              hasUnsavedChanges={hasUnsavedChanges}
              exit={exitForm}
              setShowTitleRedText={setShowTitleRedText}
              title={title}
              description={description}
              formIconName={formIconName}
              validateTitle={(event) => {
                if (event.ctrlKey || event.metaKey) {
                  return;
                }

                if (event.key === "Enter") {
                  return;
                }

                if (event.code !== "Backspace") {
                  if (!HEBREW_REGEX.test(event.key)) {
                    event.preventDefault();
                    setShowTitleRedText(true);
                  } else {
                    setShowTitleRedText(false);
                  }
                }
              }}
              onTitleChange={(e) => {
                clearErrors("title", "");
                const val = e.target.value;
                if (val) {
                  setTitleInvalid(false);
                }
                handleTitleChange(val);
              }}
              showTitleError={showTitleRedText}
              onIconChange={(iconName: string | null) => {
                setFormIconName(iconName ?? "");
              }}
              onDescriptionChange={(event) => setDescription(event.target.value)}
              saveForm={saveForm}
            />
          }
        />
      </DragDropContext>

      <CustomFieldsDialog
        open={showCustomFieldsDialog}
        items={customFields}
        onItemSelect={addItemToFormFields}
        onClose={() => setShowCustomFieldsDialog(false)}
      />

      {showAlertMsg && (
        <AlertMsg
          msg={alertMsgs}
          closePopup={() => setShowAlertMsg(false)}
          onOk={
            currentSectionId
              ? () => removeSection(currentSectionId)
              : hasUnsavedChanges && showButtonsOnPopup
                ? () => saveForm(true)
                : undefined
          }
          onClose={
            hasUnsavedChanges && showButtonsOnPopup && !currentSectionId ? exitForm : undefined
          }
          sectionId={currentSectionId}
        />
      )}

      {showConfirmMsg && (
        <ConfirmPopup
          msg={confirmMsg}
          okFunc={confirmOkFunc}
          okBtnText={confirmBtnText}
          cancelBtnText="ביטול"
          closePopup={() => {
            setShowConfirmMsg(false);
          }}
        />
      )}

      {loading && <LoadingOverlay />}

      {showConditionsPopup && (
        <ConditionalPopup
          onClose={() => setShowConditionsPopup(false)}
          formFields={formFields}
          onSave={(updatedFields) => {
            setFormFields(updatedFields.map((field: any) => coerceToEditorField(field)));
          }}
        />
      )}
    </Box>
  );
};

export default FieldsVisual;
