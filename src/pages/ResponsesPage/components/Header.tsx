import { Box, Tooltip, Typography } from "@mui/material";
import { getCreatorName } from "../../../utils/formFieldsResponses";
import { useFormStore } from "../stores/form.store";
import { TitleWrapper } from "../styled";


const Header = () => {
  const { form, rows } = useFormStore();

  return (
    <Box>
      <TitleWrapper>
        <Typography variant="h4">{form.name}</Typography>
        <Tooltip title="מזהה הטופס">
          <Typography variant="h6">
            {form.id}
          </Typography>
        </Tooltip>
      </TitleWrapper>
      <Typography variant="subtitle1">{form.description || "ללא תיאור"}</Typography>
      <Typography variant="subtitle1" color="text.primary">{`נוצר על ידי ${getCreatorName(form)}`}</Typography>
      <Typography variant="h6" color="text.secondary">{`כמות תגובות לטופס - ${rows.length}`}</Typography>
    </Box>
  );
};

export default Header;
