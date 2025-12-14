// import { Form } from "@utils/interfaces";
// import FormFields, { FormFieldsHandle } from "./FormFields";
// import { Box, Button, Typography } from "@mui/material";
// import { useRef } from "react";
// import useResponsePage from "../hooks/useResponsePage";
// import { FormikProps } from "formik";

// const ChildResponseSection = ({
//   parentForm,
//   form,
//   formik,
//   setConnectedForm,
// }: {
//   form: Form;
//   setConnectedForm: (form: Form | null) => void;
//   parentForm: Form | null;
//   formik: FormikProps<any>;
// }) => {
//   const { onSaveAndClose } = useResponsePage({ viewMode: false, copyMode: false });
//   return (
//     <Box
//       style={{
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         gap: 2,
//       }}>
//       <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
//         <Box>
//           <Typography variant="h6">{form.name} - תגובה משנה</Typography>
//         </Box>
//       </Box>
//       <FormFields formik={formik as FormikProps<any>} form={form} />
//       <Box display="flex" justifyContent="flex-end">
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => {
//             setConnectedForm(null);
//           }}>
//           ביטול
//         </Button>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => {
//             //onSaveAndClose({ parentForm: parentForm, childForm: form });
//             formik.handleSubmit();
//           }}>
//           שמור
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default ChildResponseSection;
