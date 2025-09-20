import Box from "@mui/material/Box";

import { FieldPreviewWrapper, PreviewFormContainer } from "./styled";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import { ExpandMore } from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import FormFieldsPreviewRenderer from "../FormFieldsPreviewRenderer/FormFieldsPreviewRenderer";

// todo: will probably be changed (for the better) due to the new refactor
export function FormFieldsPreview({ form }) {
  return (
    <Box>
      <Accordion disableGutters>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">תצוגה מקדימה</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <PreviewFormContainer>
            {form?.fields
              ?.sort((i, i2) => i.index - i2.index)
              ?.map((formField, index) => {
                return (
                  formField && (
                    <FieldPreviewWrapper key={index}>
                      <FormFieldsPreviewRenderer formField={formField} />
                    </FieldPreviewWrapper>
                  )
                );
              })}
          </PreviewFormContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
