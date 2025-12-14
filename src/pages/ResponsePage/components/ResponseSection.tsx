import { Typography, Box } from "@mui/material";
import { useResponseStateContext } from "../context/ResponseStateProvider";
import FormFields from "./FormFields";
import { forwardRef } from "react";
import { Form } from "@utils/interfaces";
import { FormikProps } from "formik";
interface ResponseSectionProps {
  values: any;
  errors: any;
  setValues: (values: any) => void;
  setErrors: (errors: any) => void;
  isValid: boolean;
  isSubmitting: boolean;
  form: Form | null;
}
const ResponseSection = ({
  values,
  errors,
  setValues,
  setErrors,
  isValid,
  isSubmitting,
  form,
}: ResponseSectionProps) => {
  //orm } = useResponseStateContext();
  if (!form) return null;
  //console.log("form", form.fields);
  return (
    <Box
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box>
          <Typography variant="h6">{form.fields[0]?.sectionName}</Typography>
        </Box>
      </Box>
      <FormFields
        values={values}
        errors={errors}
        setValues={setValues}
        setErrors={setErrors}
        isValid={isValid}
        isSubmitting={isSubmitting}
        form={form}
      />
      {/* <FormInsideForm /> */}
    </Box>
  );
};

export default ResponseSection;
