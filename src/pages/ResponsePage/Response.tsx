import ResponseHeader from "./components/ResponseHeader";
import "./Response.scss";
import { Container } from "@mui/material";
import useResponsePage from "./hooks/useResponsePage";
import ResponseSection from "./components/ResponseSection";
import {
  ResponseStateContextProvider,
  useResponseStateContext,
} from "./context/ResponseStateProvider";
import { useEffect, useRef } from "react";
import { FormFieldsHandle } from "./components/FormFields";
import { FormikValues, useFormik } from "formik";
import z from "zod";
import { buildSchema, getInitialValues } from "./utils/validationSchema";
import { Formik } from "formik";
import { useState } from "react";
import FormInsideForm from "./components/FormInsideForm";

type ResponsePageProps = {
  viewMode?: boolean;
  copyMode?: boolean;
};

const ResponsePageInner = ({ viewMode = false, copyMode = false }: ResponsePageProps) => {
  const { permissionTypes, onEdit, onBack, saveDisabled, isLoading } = useResponsePage({
    viewMode,
    copyMode,
  });
  const { responseData, form } = useResponseStateContext();
  const [initialValues, setInitialValues] = useState<any>(getInitialValues(form?.fields || []));
  //const ref = useRef<FormFieldsHandle | null>(null);
  const { onSaveAndClose } = useResponsePage({ viewMode: false, copyMode: false });
  const schema = buildSchema(form?.fields || []);
  const formik = useFormik<z.infer<typeof schema>>({
    initialValues: getInitialValues(form?.fields || [], responseData),
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
      onSaveAndClose(values);
    },
  });
  useEffect(() => {
    //formik.setValues(getInitialValues(form?.fields || []));
    form?.fields && setInitialValues(getInitialValues(form?.fields || []));
  }, [form?.fields]);
  // useEffect(() => {
  //   console.log("initialValues", initialValues);
  // }, [initialValues]);

  return (
    <div className="response-page">
      <Formik
        //validationSchema={schema}
        initialValues={initialValues}
        onSubmit={(values: FormikValues) => console.log("onSubmit", values)}>
        {({ isSubmitting, isValid, handleSubmit, values, errors, setValues, setErrors }) => (
          <>
            <Container disableGutters maxWidth={false}>
              <ResponseHeader
                viewMode={false}
                permissionTypes={permissionTypes}
                onEdit={onEdit}
                onBack={onBack}
                onSaveAndClose={() => {
                  console.log("values", values);

                  // console.log("onSaveAndClose", formik.values);
                  // formik.validateForm(formik.values);
                  // console.log("isValid", formik.isValid);
                  // console.log("errors", formik.errors);
                  // if (formik.isValid) {
                  //   console.log("isValid");
                  //   //onSaveAndClose(formik.values);
                  // }
                  //onSaveAndClose(formik.values);
                }}
                saveDisabled={saveDisabled}
                isLoading={isLoading}
              />
              <div className="response-content">
                <ResponseSection
                  values={values}
                  errors={errors}
                  setValues={setValues}
                  setErrors={setErrors}
                  isValid={isValid}
                  isSubmitting={isSubmitting}
                  form={form}
                />
              </div>
            </Container>
            <FormInsideForm
              form={form}
              formik={formik}
              values={values}
              errors={errors}
              setValues={setValues}
              setErrors={setErrors}
              isValid={isValid}
              isSubmitting={isSubmitting}
            />
          </>
        )}
      </Formik>
    </div>
  );
};

const ResponsePage = (props: ResponsePageProps) => {
  return (
    <ResponseStateContextProvider>
      <ResponsePageInner {...props} />
    </ResponseStateContextProvider>
  );
};

export default ResponsePage;
