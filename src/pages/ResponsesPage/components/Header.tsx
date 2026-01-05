import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { getCreatorName } from "../../../utils/formFieldsResponses";
import { useFormStore } from "../stores/form.store";
import {
  TitleWrapper,
  FormInfoContentBox,
  FormInfoSectionBox,
  CreatorInfoBox,
  FormNameTypography,
  InfoIconButton,
  FormNameInTooltipTypography,
  FormDescriptionTypography,
  formInfoTooltipSlotProps,
} from "../styled";


const Header = () => {
  const { form } = useFormStore();

  const infoTooltipContent = (
    <FormInfoContentBox>
      <FormInfoSectionBox>
        <FormNameInTooltipTypography variant="body1">
          {form.name}
        </FormNameInTooltipTypography>
      </FormInfoSectionBox>

      <FormInfoSectionBox>
        <FormDescriptionTypography variant="body2">
          {form.description || "ללא תיאור"}
        </FormDescriptionTypography>
      </FormInfoSectionBox>

      <CreatorInfoBox>
        <AccountCircleOutlinedIcon fontSize="small" />
        <Typography variant="body2">
          {`נוצר ע״י ${getCreatorName(form)}`}
        </Typography>
      </CreatorInfoBox>
    </FormInfoContentBox>
  );

  return (
    <Box>
      <TitleWrapper>
        <FormNameTypography variant="h5">
          {form.name}
        </FormNameTypography>
        <Tooltip title="מזהה הטופס">
          <Typography variant="h5">
            {form.id}
          </Typography>
        </Tooltip>

        <Tooltip
          title={infoTooltipContent}
          placement="left"
          slotProps={formInfoTooltipSlotProps}
          arrow
        >
          <InfoIconButton size="small">
            <InfoOutlinedIcon fontSize="medium" />
          </InfoIconButton>
        </Tooltip>
      </TitleWrapper>
    </Box>
  );
};

export default Header;
