import { Box, Grid } from "@mui/material";
import { FieldTypeIds, Form } from "utils/interfaces";
import { useResponseStateContext } from "../context/ResponseStateProvider";
import { useFormik } from "formik";
import { buildSchema, getInitialValues } from "../utils/validationSchema";
import { z } from "zod";
import CustomGenericField from "./custom-ui-element/CustomGenericField";
import useResponsePage from "../hooks/useResponsePage";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { FormikProps } from "formik";

export type FormFieldsHandle = {
  onSubmit: () => void;
};

interface FormFieldsProps {
  values: any;
  errors: any;
  setValues: (values: any) => void;
  setErrors: (errors: any) => void;
  isValid: boolean;
  isSubmitting: boolean;
  form: Form | null;
}
const FormFields = ({
  values,
  errors,
  setValues,
  setErrors,
  isValid,
  isSubmitting,
  form,
}: FormFieldsProps) => {
  const { responseData } = useResponseStateContext();
  const [connectedForm, setConnectedForm] = useState<Form | null>(null);
  //const { onSaveAndClose } = useResponsePage({ viewMode: false, copyMode: false });
  //const schema = buildSchema(form?.fields || []);
  // const formik = useFormik<z.infer<typeof schema>>({
  //   initialValues: getInitialValues(form?.fields || [], responseData),
  //   validateOnChange: false,
  //   validateOnBlur: false,
  //   validateOnMount: false,
  //   validate: (values) => {
  //     const result = schema.safeParse(values);
  //     if (result.success) return {};

  //     return result.error.issues.reduce((acc, issue) => {
  //       const [fieldName, subField] = issue.path as [string, string?];

  //       if (subField === "files") {
  //         acc[fieldName] = issue.message;
  //         return acc;
  //       }

  //       if (subField) {
  //         acc[fieldName] = {
  //           ...(acc[fieldName] as any),
  //           [subField]: issue.message,
  //         };
  //       } else {
  //         acc[fieldName] = issue.message;
  //       }

  //       return acc;
  //     }, {} as Record<string, any>);
  //   },
  //   onSubmit: (values) => {
  //     console.log("onSubmit", values);

  //     onSaveAndClose(values);
  //   },
  // });

  // useImperativeHandle(
  //   ref,
  //   () =>
  //     ({
  //       onSubmit: () => formik.handleSubmit(),
  //     } as FormFieldsHandle),
  // );

  // useEffect(() => {
  //   if (responseData && responseData.length > 0) {
  //     formik.setValues(getInitialValues(form?.fields || [], responseData));
  //   }
  // }, [responseData, form?.fields]);

  const validateSingleField = async (fieldName: string, value: any, isLinkField: boolean) => {
    const singleFieldSchema = buildSchema(form?.fields || []);
    if (!singleFieldSchema) return;

    const result = singleFieldSchema.safeParse(value);

    if (result.success) {
      setErrors({ ...errors, [fieldName]: undefined });
      return;
    }

    if (!isLinkField) {
      setErrors({ ...errors, [fieldName]: result.error.issues[0].message });
      return;
    }

    const fieldErrors: any = {};
    result.error.issues.forEach((issue) => {
      const [, subField] = issue.path as [string, string?];
      if (subField) {
        fieldErrors[subField] = issue.message;
      }
    });

    setErrors({ ...errors, [fieldName]: fieldErrors });
  };

  return (
    <Box>
      {/* <form onSubmit={formik.handleSubmit} noValidate dir="rtl" autoComplete="off"> */}
      <Grid container spacing={{ xs: 4, md: 6 }}>
        {form?.fields?.map((field) => {
          if (field.typeId !== FieldTypeIds.form) {
            return (
              <Grid key={field.uniqueId} size={{ xs: 12, md: 4 }}>
                <CustomGenericField
                  field={field}
                  value={values[field.uniqueId] as unknown as string}
                  onChange={(value) => {
                    setValues({ ...values, [field.uniqueId]: value });
                    // validateSingleField(field.uniqueId, value, field.typeId === FieldTypeIds.link);
                  }}
                  error={!!errors[field.uniqueId]}
                  helperText={(errors[field.uniqueId] as string) || ""}
                  errors={errors}
                  //onBlur={formik.handleBlur}
                  //formik={formik}
                />
              </Grid>
            );
          }
          //else {
          //   return (
          //     // <FormInsideForm
          //     //   formik={formik}
          //     //   form={form}
          //     //   connectedForm={connectedForm}
          //     //   setConnectedForm={setConnectedForm}
          //     // />
          //   );
          // }
        })}
      </Grid>

      {/* {connectedForms.map((connectedForm) => (
          <Box key={connectedForm.uniqueId} py={2}>
            <Button
              variant="text"
              size="small"
              startIcon={<Add />}
              sx={{ minWidth: "auto", padding: "8px" }}
              onClick={() => {}}>
              <Tooltip title={"הוספת תגובה - " + connectedForm.displayName}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {"הוספת תגובה - " + connectedForm.displayName}dd
                </Typography>
              </Tooltip>
            </Button>
          </Box>
        ))} */}
      {/* </form> */}
    </Box>
  );
};

export default FormFields;
