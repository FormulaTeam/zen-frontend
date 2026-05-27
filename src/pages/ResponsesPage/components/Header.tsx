import { Box, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import * as MuiIcons from "@mui/icons-material";

import { getCreatorName } from "../../../utils/formFieldsResponses";
import { getFormIconByName } from "../../../utils/utils";
import formX from "../../../images/form_x.png";
import { useFormStore } from "../stores/form.store";

import {
  FormInfoContentBox,
  FormInfoSectionBox,
  CreatorInfoBox,
  FormNameTypography,
  InfoIconButton,
  FormDescriptionTypography,
  formInfoTooltipSlotProps,
  FormIconWrapper,
} from "../styled";

const Header = () => {
  const { form } = useFormStore();
  if (!form) return null;

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];
    return IconComponent ? <IconComponent sx={{ fontSize: 32 }} color="primary" /> : name;
  };

  const getIconContent = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (!iconName || !iconSrc) {
      return <img src={formX} alt="form icon" style={{ width: 32, height: 32 }} />;
    }

    if (typeof iconSrc === "string") {
      return <img src={iconSrc} alt={iconName} style={{ width: 32, height: 32 }} />;
    }

    const IconComponent = iconSrc;
    if (IconComponent) {
      return <IconComponent color="primary" sx={{ fontSize: 32 }} />;
    }

    return renderDynamicIcon(iconName);
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
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        gap: "16px",
        color: "#020618",
      }}>
      {/* Icon */}
      <FormIconWrapper
        sx={{
          width: 44,
          height: 44,
          display: "inline-flex",
          verticalAlign: "baseline",
        }}>
        {getIconContent(form.icon ?? null)}
      </FormIconWrapper>

      {/* Name */}
      <FormNameTypography
        variant="h5"
        sx={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "inherit",
          lineHeight: 1,
          display: "inline",
        }}>
        {form.name}
      </FormNameTypography>

      {/* ID */}
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "2rem",
          lineHeight: 1,
          display: "inline",
        }}>
        {form.id}
      </Typography>

      {/* Info */}
      <Tooltip
        title={infoTooltipContent}
        placement="bottom"
        slotProps={formInfoTooltipSlotProps}
        arrow>
        <InfoIconButton size="small" sx={{ p: 0.5, color: "inherit" }}>
          <InfoOutlinedIcon sx={{ fontSize: "24px" }} />
        </InfoIconButton>
      </Tooltip>
    </Box>
  );
};

export default Header;
