import React, { useEffect, useState } from "react";
import { DragDropContext, DraggableLocation, DropResult } from "@hello-pangea/dnd";
import { Box } from "@mui/material";
import ConfirmPopup from "../../popups/ConfirmPopup/ConfirmPopup";
import {
  connectionTypes,
  CustomFormField,
  DEFAULT_FIELDS,
  DRAGGED_ITEM_ID,
  FieldTypeIds,
  Form,
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
import {
  generateNewFormFieldData,
  getUserName,
  showErrorNotification,
  showSuccessNotification,
  getInitialNewForm,
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
import queryClient from "../../api/queryClient";

interface FormProps {
  formToEdit: any;
  currentUser: any;
}

const FieldsVisual: React.FC<FormProps> = ({ formToEdit, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initCustomFields, customFields } = useCustomFormFields();

  const [loading, setLoading] = useState<boolean>(false);
  const [currentFormId, setCurrentFormId] = useState<number>(formToEdit.id);
  const [isFormCreated, setIsFormCreated] = useState(!!formToEdit?.id);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [title, setTitle] = useState("");
  const [showTitleRedText, setShowTitleRedText] = useState(false);
  const [titleInvalid, setTitleInvalid] = useState(false);
  const [description, setDescription] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([] as FormField[]);
  const [showCustomFieldsDialog, setShowCustomFieldsDialog] = useState<boolean>(false);
  const [confirmBtnText, setConfirmBtnText] = useState<string>("מחק עמודה");
  const [items, setItems] = useState<Partial<CustomFormField>[]>(DEFAULT_FIELDS);
  const [formIconName, setFormIconName] = useState<any>(formToEdit.icon);
  const [parentFieldId, setParentFieldId] = useState<any>("");
  const [showConditionsPopup, setShowConditionsPopup] = useState(false);
  const [formFieldsInnerErrors, setFormFieldsInnerErrors] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [formFieldsDisplayErrors, setFormFieldsDisplayErrors] = useState<Map<string, string[]>>(
    new Map(),
  );

  const { mutateAsync: mutateCreateFormAsync } = useCreateForm();
  const { mutateAsync: mutateUpdateFormAsync } = useUpdateForm(currentFormId || 0);

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalIcon, setOriginalIcon] = useState("");
  const [originalFormFields, setOriginalFormFields] = useState<FormField[]>([]);
  const [originalParentFieldId, setOriginalParentFieldId] = useState("");
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
  /** when formToEdit changes - set popup title, form title and description, original form
   *  and maps of fields valid */
  useEffect(() => {
    initCustomFields();
    getNumOfResponses(formToEdit.id);
    populateFormData();
    return () => {
      setSavedSuccess(false);
    };
  }, [formToEdit]);

  const populateFormData = () => {
    setLoading(true);
    setTitle(formToEdit.name);
    setDescription(formToEdit.description);
    setFormFields(formToEdit.fields);
    const hasSectionIds = formToEdit.fields?.some((f) => !!f.sectionId);
    const isNewForm = formToEdit.fields?.length === 0;
    if (isNewForm) {
      setSections([
        { id: NOT_A_SECTION_ID, name: texts.heb.mainSection, collapsed: false, order: 0 },
      ]);
    } else if (!hasSectionIds) {
      setSections([]);
    } else {
      orderSections(formToEdit.fields);
    }
    setCurrentFormId(formToEdit.id);
    setParentFieldId(formToEdit.parentFieldId);
    if (formToEdit.fields) {
      formToEdit.fields.forEach((field) => {
        formFieldsNamesValidMap.set(field.name, true);
        formFieldsDisplayNamesValidMap.set(field.displayName, true);
        if (!field.sectionId) {
          field.sectionId = NOT_A_SECTION_ID;
        }
      });
      orderSections(formToEdit.fields);
    }
    setOriginalTitle(formToEdit.name);
    setOriginalDescription(formToEdit.description);
    setOriginalIcon(formToEdit.icon);
    setOriginalFormFields(JSON.parse(JSON.stringify(formToEdit.fields)));
    setOriginalParentFieldId(formToEdit.parentFieldId);
    setLoading(false);
  };

  const getNumOfResponses = async (formId) => {
    try {
      if (!formId) return;
      const ans: ResponseCount = await getResponsesCount(formId);
      const responsesCount: number = ans?.count || 0;
      setResponsesCount(responsesCount);
    } catch (error) {
      showErrorNotification("שליפת כמות התגובות נכשלה");
    }
  };

  const revalidateFormFieldsNames = (newFormFields: FormField[]) => {
    let newFormFieldsNamesValidMap = new Map();
    let newFormFieldsDisplayNamesValidMap = new Map();
    newFormFields.forEach((field) => {
      newFormFieldsNamesValidMap.set(field.index, true);
      newFormFieldsDisplayNamesValidMap.set(field.index, true);
    });
    setFormFieldsNamesValidMap(newFormFieldsNamesValidMap);
    setFormFieldsDisplayNamesValidMap(newFormFieldsDisplayNamesValidMap);
  };

  const deleteField = (formField: FormField) => {
    let newFormFields = [...formFields];
    let indexToRemove = formField.index;
    newFormFields.splice(indexToRemove, 1);
    newFormFields.forEach((element, i) => {
      element.index = i;
    });
    revalidateFormFieldsNames(newFormFields);
    setFormFields(newFormFields);
  };

  const handleErrorMessage = (message: string, fieldType: string, fieldId: string) => {
    if (!message) return;

    setErrors((prevErrors) => {
      const filteredErrors = prevErrors.filter(
        (e) => !(e.key === fieldType && e.fieldId === fieldId),
      );
      return [...filteredErrors, { key: fieldType, message, fieldId }];
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
      } catch (error) {
        showErrorNotification("שמירת הטופס נכשלה");
      }
    }
    setLoading(false);
    setShowButtonsOnPopup(false);
  };

  /** save updated form to db */
  const saveFormToDb = async (
    newFormFields: FormField[],
    options?: { isUpdateMetro?: boolean; formIcon?: string },
  ) => {
    setLoading(true);
    const defaultOptions = { formIcon: formIconName, isUpdateMetro: false };
    const mergedOptions = { ...defaultOptions, ...(options && options) };
    const { isUpdateMetro, formIcon } = mergedOptions;
    const currentUserLowerCaseUpn = currentUser?.upn?.toLowerCase();
    const userName = getUserName(currentUser.firstName, currentUser.lastName);

    // Check if this is a new form (no ID or no fields initially)
    const isNewForm = !isFormCreated;
    let formId = formToEdit?.id || currentFormId;

    if (isNewForm) {
      const newFormStructure = getInitialNewForm(currentUser, title, description);

      try {
        const createdForm = await mutateCreateFormAsync(newFormStructure);
        // Update the form ID and formToEdit with the newly created form data
        formId = createdForm.id;
        setCurrentFormId(createdForm.id);

        // Update formToEdit with the created form data for the updateForm call
        Object.assign(formToEdit, createdForm);
        setIsFormCreated(true);
      } catch (error) {
        showErrorNotification("יצירת הטופס נכשלה");
        return;
      }
    }

    const form: Partial<Form> = {
      ...formToEdit,
      fields: newFormFields,
      name: title,
      description,
      icon: formIcon,
      edited_by: currentUserLowerCaseUpn,
      edited_by_name: userName,
    };

    try {
      await mutateUpdateFormAsync({ id: formId, formData: form, isUpdateMetro });
    } catch (error) {
      showErrorNotification("עידכון הטופס נכשל");
    } finally {
      setLoading(false);
    }
  };

  const getFormPropertyTitleTextField = (formField: FormField, index: number) => {
    const isNameValid =
      formFieldsNamesValidMap.get(index) !== undefined &&
        formFieldsUniqueNamesValidMap.get(formField.name) !== undefined
        ? formFieldsNamesValidMap.get(index) && !formFieldsUniqueNamesValidMap.get(formField.name)
        : formFieldsNamesValidMap.get(index) !== undefined
          ? formFieldsNamesValidMap.get(index)
          : formFieldsUniqueNamesValidMap.get(formField.name) !== undefined
            ? !formFieldsUniqueNamesValidMap.get(formField.name)
            : true;

    const isDisplayNameValid =
      formFieldsDisplayNamesValidMap.get(index) !== undefined &&
        formFieldsUniqueDisplayNamesValidMap.get(formField.displayName) !== undefined
        ? formFieldsDisplayNamesValidMap.get(index) &&
        !formFieldsUniqueDisplayNamesValidMap.get(formField.displayName)
        : formFieldsDisplayNamesValidMap.get(index) !== undefined
          ? formFieldsDisplayNamesValidMap.get(index)
          : formFieldsUniqueDisplayNamesValidMap.get(formField.displayName) !== undefined
            ? !formFieldsUniqueDisplayNamesValidMap.get(formField.displayName)
            : true;

    const showNameError = !isNameValid;
    const showDisplayNameError = !isDisplayNameValid;

    const innerErrorMessages: string[] = formFieldsInnerErrors.get(formField.uniqueId) || [];
    const displayErrorMessages: string[] = formFieldsDisplayErrors.get(formField.uniqueId) || [];

    if (showNameError && innerErrorMessages.length === 0) {
      if (!formField.name) {
        innerErrorMessages.push("יש להזין שם פנימי");
      } else if (!/^[a-zA-Z_]+$/.test(formField.name)) {
        innerErrorMessages.push("שם פנימי חייב להכיל רק אותיות באנגלית ו־_");
      } else if (formField.name && RESERVED_FIELD_NAMES.includes(formField.name.toLowerCase())) {
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
        fieldNameError={!!formFieldsNamesRedTextMap.get(formField?.uniqueId)}
        handleNameKeyDown={(event) => {
          if (event.ctrlKey || event.metaKey) {
            // Allow shortcuts like Ctrl+V, Ctrl+C, etc.
            return;
          }

          let newMap = new Map(formFieldsNamesRedTextMap);

          if (!ABC_AND_DASH_REGEX.test(event.key)) {
            event.preventDefault();
            newMap.set(formField?.uniqueId, true);
          } else {
            newMap.set(formField?.uniqueId, false);
          }
          setFormFieldsNamesRedTextMap(newMap);
        }}
      />
    );
  };

  const addErrorIf = (
    condition: boolean,
    message: string,
    fieldType: string = "general",
    uniqueId: string = "",
  ): boolean => {
    if (condition) {
      handleErrorMessage(message, fieldType, uniqueId);
      setShowAlertMsg(true);
      return true;
    }
    return false;
  };

  const validateTitleFields = (): boolean => {
    let hasError = false;

    if (!title.match(HEBREW_REGEX)) {
      setTitleInvalid(true);
      if (addErrorIf(true, "לתשומת ליבך! שם הטופס מורכב מאותיות שאינן עברית.", "title")) {
        hasError = true;
      }
    }

    if (title.length < 5) {
      setTitleInvalid(true);
      if (addErrorIf(true, "לתשומת ליבך! שם הטופס פחות מ5 אותיות.", "title")) {
        hasError = true;
      }
    }

    if (!title || title === "") {
      setTitleInvalid(true);
      if (addErrorIf(true, "לתשומת ליבך! שם הטופס ריק", "title")) {
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

    // reserved names map
    const reservedFlags = new Map<ReservedFieldName, boolean>();
    RESERVED_FIELD_NAMES.forEach((name) => reservedFlags.set(name, false));

    const nameDupMap = new Map<string, boolean>();
    const displayNameDupMap = new Map<string, boolean>();
    const nameValidMap = new Map<number, boolean>();
    const displayNameValidMap = new Map<number, boolean>();
    const redTextMap = new Map<string, boolean>();
    const optionsValidMap = new Map<string, boolean>();

    const nameCount = new Map<string, number>();
    const displayNameCount = new Map<string, number>();

    for (const field of formFields) {
      if (!field) continue;
      redTextMap.set(field.uniqueId, false);

      if (field.name && field.shouldSyncToMetro !== false) {
        nameCount.set(field.name, (nameCount.get(field.name) || 0) + 1);
      }
      if (field.displayName) {
        displayNameCount.set(field.displayName, (displayNameCount.get(field.displayName) || 0) + 1);
      }

      if (field.shouldSyncToMetro === false) {
        nameValidMap.set(field.index, true);
      } else if (!field.name || field.name === "") {
        nameValidMap.set(field.index, false);
        hasEmptyColumnName = false;
      } else if (!field.name.match(ABC_AND_DASH_REGEX)) {
        nameValidMap.set(field.index, false);
        hasEmptyColumnName = false;
        addErrorIf(true, "השם הפנימי לא עומד בתקן", "general", field.uniqueId);
      } else {
        nameValidMap.set(field.index, true);
      }

      if (!field.displayName || field.displayName === "") {
        displayNameValidMap.set(field.index, false);
        hasEmptyColumnDisplayName = false;
      } else {
        displayNameValidMap.set(field.index, true);
      }

      // reserved names check
      if (
        field.name &&
        RESERVED_FIELD_NAMES.includes(field.name.toLowerCase() as ReservedFieldName)
      ) {
        const lower = field.name.toLowerCase() as ReservedFieldName;
        nameValidMap.set(field.index, false);
        reservedFlags.set(lower, true);
        addErrorIf(true, `אסור לקרוא לשדה בשם "${field.name}"`, "general", field.uniqueId);
      }

      if (field.connectionType === connectionTypes.form) {
        if (!field.connectedFormId) {
          hasEmptyFormConnection = true;
          addErrorIf(true, "שדה לא מחובר לטופס", "options", field.uniqueId);
        }
        if (!field.connectedFieldId) {
          hasEmptyFieldConnection = true;
          addErrorIf(true, "שדה לא מחובר לשדה בטופס היעד", "options", field.uniqueId);
        }
      }

      if (field.typeId === FieldTypeIds.form && !field.connectedFormId) {
        hasEmptyFormInFormConnection = true;
        addErrorIf(true, "שדה לא מחובר לטופס", "form", field.uniqueId);
      }

      if ((field.options ?? []).length > 0 && field.connectionType !== connectionTypes.form) {
        for (const option of field.options ?? []) {
          if (!option) {
            optionsValidMap.set(option, false);
            hasEmptyOptionName = false;
            addErrorIf(true, "לא ניתן להשאיר אפשרות ריקה", "options", field.uniqueId);
          } else {
            optionsValidMap.set(option, true);
          }
        }
      }

      // בדיקת שדות מספר
      if (field.typeId === FieldTypeIds.number) {
        const { minValue, maxValue, initialNumberValue } = field;
        const hasInvalidRange =
          minValue !== undefined && maxValue !== undefined && minValue > maxValue;
        const defaultOutOfRange =
          initialNumberValue !== undefined &&
          ((minValue !== undefined && initialNumberValue < minValue) ||
            (maxValue !== undefined && initialNumberValue > maxValue));

        if (hasInvalidRange) {
          addErrorIf(true, "טווח ערכים לא תקין", "number", field.uniqueId);
        }
        if (defaultOutOfRange) {
          addErrorIf(true, "ערך ברירת המחדל חייב להיות בתוך טווח הערכים", "number", field.uniqueId);
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
      addErrorIf(true, "לתשומת ליבך! ישנן עמודות בטופס עם אותו שם פנימי...", "general");
      setShowAlertMsg(true);
    }

    if (fieldErrors.has2FieldsSameDisplayNames) {
      addErrorIf(true, "לתשומת ליבך! ישנן עמודות בטופס עם אותו שם תצוגה...", "general");
      setShowAlertMsg(true);
    }

    if (!fieldErrors.hasEmptyColumnName) {
      addErrorIf(true, "לתשומת ליבך! ישנן עמודות ללא שם פנימי...", "general");
      setShowAlertMsg(true);
    }

    if (!fieldErrors.hasEmptyColumnDisplayName) {
      addErrorIf(true, "לתשומת ליבך! ישנן עמודות ללא שם תצוגה...", "general");
      setShowAlertMsg(true);
    }

    if (!fieldErrors.hasEmptyOptionName) {
      addErrorIf(true, "לתשומת ליבך! ישנן אפשרויות ריקות בטופס...", "general");
      setShowAlertMsg(true);
    }

    // מעבר על כל השדות השמורים
    for (const [name, found] of fieldErrors.reservedFlags.entries()) {
      if (found) {
        addErrorIf(true, `לתשומת ליבך! יש עמודה עם שם פנימי שמור "${name}"`, "general");
        setShowAlertMsg(true);
      }
    }

    if (fieldErrors.hasInvalidNumberField) {
      addErrorIf(
        true,
        "לתשומת ליבך! יש שדות מספר עם טווחים לא תקינים או ערכי ברירת מחדל לא חוקיים...",
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
    const item = formFields[index];

    if (item) {
      item.name = val;
      setFormFields((prev) => [...prev]);
      const newMap = new Map(formFieldsInnerErrors);
      const errors: string[] = [];

      if (!val) {
        errors.push("יש להזין שם פנימי");
      } else if (!/^[a-zA-Z_]+$/.test(val)) {
        errors.push("שם פנימי חייב להכיל רק אותיות באנגלית ו־_");
      } else if (RESERVED_FIELD_NAMES.includes(val.toLowerCase())) {
        errors.push(`אסור להשתמש בשם פנימי "${val}"`);
      }

      if (errors.length > 0) {
        newMap.set(item.uniqueId, errors);
      } else {
        newMap.delete(item.uniqueId);
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
    const arr = [...formFields];
    const item = arr.find((i) => i.index === index);

    if (item) {
      item.displayName = val;
      setFormFields(arr);
      const newMap = new Map(formFieldsDisplayErrors);
      const errors: string[] = [];

      if (!val) {
        errors.push("יש להזין שם תצוגה");
      }

      if (errors.length > 0) {
        newMap.set(item.uniqueId, errors);
      } else {
        newMap.delete(item.uniqueId);
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
    if (!item.sectionId || !item.sectionId.includes(FORM_FIELDS_PREFIX)) {
      item.sectionId = "formFields_section_0";
    }

    const sectionIdNoPrefix = item.sectionId.replace(FORM_FIELDS_PREFIX, "");
    item.sectionOrder = sections.find((s) => s.id === sectionIdNoPrefix)?.order || 0;

    const newFormField = generateNewFormFieldData(item);

    // Apply section-wide conditions if they exist
    const fieldWithConditions = handleFieldAddedToSection(formFields, newFormField, item.sectionId);

    setFormFields((prevFormFields) => {
      const updated = [...prevFormFields];
      updated.splice(destinationIndex, 0, fieldWithConditions);
      updated.forEach((f, i) => (f.index = i));
      revalidateFormFieldsNames(updated);
      return updated;
    });

    validateUnsavedChanges();
  };

  const removeDuplicateItemFromItemsList = () => {
    const itemsWithoutDuplicate = items.filter((item) => item.typeId !== DRAGGED_ITEM_ID);
    setItems(itemsWithoutDuplicate);
  };

  const moveFieldBetweenSections = (source: DraggableLocation, destination: DraggableLocation) => {
    const updated = [...formFields];
    const [moved] = updated.splice(source.index, 1);

    // Get the source section ID for condition management
    const sourceSectionId = moved.sectionId;

    // Extract section ID without prefix and find the section order
    const sectionIdNoPrefix = destination.droppableId.replace(FORM_FIELDS_PREFIX, "");
    const targetSection = sections.find((s) => s.id === sectionIdNoPrefix);

    // Handle condition inheritance and removal when moving between sections
    const fieldWithManagedConditions = handleFieldMovedBetweenSections(
      updated, // Use updated array without the moved field for accurate condition checking
      moved,
      sourceSectionId,
      destination.droppableId,
    );

    // Update both sectionId and sectionOrder
    fieldWithManagedConditions.sectionId = destination.droppableId;
    fieldWithManagedConditions.sectionOrder = targetSection?.order || 0;

    updated.splice(destination.index, 0, fieldWithManagedConditions);
    updated.forEach((f, i) => (f.index = i));
    revalidateFormFieldsNames(updated);
    setFormFields(updated);
    validateUnsavedChanges();
  };

  const addNewFieldToForm = (source, destination) => {
    const draggedItem =
      source.droppableId === "items" ? items[source.index] : customFields[source.index];
    if (draggedItem) {
      // Extract section ID without prefix and find the section order
      const sectionIdNoPrefix = destination.droppableId.replace(FORM_FIELDS_PREFIX, "");
      const targetSection = sections.find((s) => s.id === sectionIdNoPrefix);

      // Create the item with section information
      const itemWithSection = {
        ...draggedItem,
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
              getFormProperty={(formField, dragHandleProps) => (
                <FormPropertyRenderer
                  errors={errors}
                  formField={formFields.find((f) => f.uniqueId === formField.uniqueId) ?? formField}
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
              )}
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
                  // Allow shortcuts like Ctrl+V, Ctrl+C, etc.
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
                if (val && val !== "") {
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
            setFormFields(updatedFields);
          }}
        />
      )}
    </Box>
  );
};

export default FieldsVisual;
