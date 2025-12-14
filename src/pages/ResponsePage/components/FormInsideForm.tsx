import { Box, Button, Tooltip, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useResponseStateContext } from "../context/ResponseStateProvider";
import { useState } from "react";
import { getFormById } from "api/formsApi";
import { Form } from "@utils/interfaces";
import { FormikProps, useFormik } from "formik";
import FormFields from "./FormFields";
import { buildSchema, getInitialValues } from "../utils/validationSchema";
import { z } from "zod";
import useResponsePage from "../hooks/useResponsePage";
interface FormInsideFormProps {
  form: Form | null;
  formik: FormikProps<any>;
  values: any;
  errors: any;
  setValues: (values: any) => void;
  setErrors: (errors: any) => void;
  isValid: boolean;
  isSubmitting: boolean;
}

const FormInsideForm = ({
  form,
  //formik,
  values,
  errors,
  setValues,
  setErrors,
  isValid,
  isSubmitting,
}: FormInsideFormProps) => {
  const { connectedForms } = useResponseStateContext();
  const { onSaveAndClose } = useResponsePage({ viewMode: false, copyMode: false });
  const [connectedForm, setConnectedForm] = useState<Form | null>(null);
  const handleAddResponse = (formId: number) => {
    console.log("formId", formId);
    formId &&
      getFormById(formId).then((form) => {
        console.log("form!!!!", form);
        setConnectedForm(form);
      });
  };

  const schema = buildSchema(connectedForm?.fields || []);
  const formik = useFormik<z.infer<typeof schema>>({
    initialValues: getInitialValues(connectedForm?.fields || []),
    validateOnChange: false,
    validateOnBlur: false,
    validateOnMount: false,
    validate: (values) => {
      console.log("validate", values);
      console.log("schema", schema);

      const result = schema.safeParse(values);
      console.log("result", result);

      if (result.success) return {};

      return result.error.issues.reduce((acc, issue) => {
        const [fieldName, subField] = issue.path as [string, string?];

        if (subField === "files") {
          acc[fieldName] = issue.message;
          return acc;
        }

        if (subField) {
          acc[fieldName] = {
            ...(acc[fieldName] as any),
            [subField]: issue.message,
          };
        } else {
          acc[fieldName] = issue.message;
        }

        return acc;
      }, {} as Record<string, any>);
    },
    onSubmit: (values) => {
      console.log("onSubmit", values);
      console.log("formik", formik);
      onSaveAndClose(values);
    },
  });

  return (
    <Box>
      {connectedForms.map((connectedForm) => (
        <Box key={connectedForm.uniqueId} py={2}>
          <Button
            variant="text"
            size="small"
            startIcon={<Add />}
            sx={{ minWidth: "auto", padding: "8px" }}
            onClick={() => {
              connectedForm.connectedFormId && handleAddResponse(connectedForm.connectedFormId);
            }}>
            <Tooltip title={"הוספת תגובה - " + connectedForm.displayName}>
              <Typography variant="subtitle2" fontWeight={600}>
                {"הוספת תגובה - " + connectedForm.displayName}
              </Typography>
            </Tooltip>
          </Button>
        </Box>
      ))}
      {connectedForm && (
        <Box
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Box>
              <Typography variant="h6">{connectedForm?.name} - תגובה משנה</Typography>
            </Box>
          </Box>
          <FormFields
            values={formik.values}
            errors={formik.errors}
            setValues={setValues}
            setErrors={setErrors}
            isValid={formik.isValid}
            isSubmitting={isSubmitting}
            form={connectedForm}
          />
          {/* <FormFields formik={formik} form={connectedForm} /> */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setConnectedForm(null);
              }}>
              ביטול
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                formik.validateForm(formik.values);
                if (formik.isValid) {
                  formik.handleSubmit();
                }
                //onSaveAndClose({ parentForm: parentForm, childForm: form });
              }}>
              שמור
            </Button>
          </Box>
        </Box>
        // <ChildResponseSection
        //   formik={formik}
        //   parentForm={form}
        //   form={connectedForm}
        //   setConnectedForm={setConnectedForm}
        // />
      )}
    </Box>
  );
};

export default FormInsideForm;
