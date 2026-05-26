import { Box, Tooltip, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import * as MuiIcons from "@mui/icons-material";
import { getCreatorName } from "../../../utils/formFieldsResponses";
import { getFormIconByName } from "../../../utils/utils";
import formX from "../../../images/form_x.png";
import { useFormStore } from "../stores/form.store";
import {
  TitleWrapper,
  FormInfoContentBox,
  FormInfoSectionBox,
  CreatorInfoBox,
  FormNameTypography,
  InfoIconButton,
  FormDescriptionTypography,
  formInfoTooltipSlotProps,
  FormIdTypography,
  FormIconWrapper,
} from "../styled";

const Header = () => {
  const { form } = useFormStore();
  if (!form) return null;

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];
    return IconComponent ? <IconComponent color="primary" /> : name;
  };

  const getIcon = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return (
        <FormIconWrapper>
          <img src={iconSrc} alt={iconName ?? "form icon"} />
        </FormIconWrapper>
      );
    }

    if (iconSrc) {
      const IconComponent = iconSrc;

      return (
        <FormIconWrapper>
          <IconComponent color="primary" />
        </FormIconWrapper>
      );
    }

    if (!iconName)
      return (
        <FormIconWrapper>
          <img src={formX} alt="form icon" />
        </FormIconWrapper>
      );

    return <FormIconWrapper>{renderDynamicIcon(iconName)}</FormIconWrapper>;
  };

  const infoTooltipContent = (
    <FormInfoContentBox>
      {form.description && (
        <FormInfoSectionBox>
          <FormDescriptionTypography variant="body2">{form.description}</FormDescriptionTypography>
        </FormInfoSectionBox>
      )}
      <CreatorInfoBox>
        <AccountCircleOutlinedIcon fontSize="small" />
        <Typography variant="body2">{`נוצר ע״י ${getCreatorName(form)}`}</Typography>
      </CreatorInfoBox>
    </FormInfoContentBox>
  );

  return (
    <Box>
      <TitleWrapper>
        {getIcon(form.icon ?? null)}
        <FormNameTypography variant="h5">{form.name}</FormNameTypography>
        <Tooltip title="מזהה הטופס">
          <FormIdTypography>{form.id}</FormIdTypography>
        </Tooltip>

        <Tooltip
          title={infoTooltipContent}
          placement="left"
          slotProps={formInfoTooltipSlotProps}
          arrow>
          <InfoIconButton size="small">
            <InfoOutlinedIcon fontSize="medium" />
          </InfoIconButton>
        </Tooltip>
      </TitleWrapper>
    </Box>
  );
};

export default Header;
