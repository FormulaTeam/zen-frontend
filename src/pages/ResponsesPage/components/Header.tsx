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
    return IconComponent ? <IconComponent sx={{ fontSize: 32 }} color="primary" /> : name;
  };

  const getIcon = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return (
        <FormIconWrapper sx={{ width: 44, height: 44 }}>
          <img src={iconSrc} alt={iconName ?? "form icon"} style={{ width: 32, height: 32 }} />
        </FormIconWrapper>
      );
    }

    if (iconSrc) {
      const IconComponent = iconSrc;

      return (
        <FormIconWrapper sx={{ width: 44, height: 44 }}>
          <IconComponent color="primary" sx={{ fontSize: 32 }} />
        </FormIconWrapper>
      );
    }

    if (!iconName)
      return (
        <FormIconWrapper sx={{ width: 44, height: 44 }}>
          <img src={formX} alt="form icon" style={{ width: 32, height: 32 }} />
        </FormIconWrapper>
      );

    return <FormIconWrapper sx={{ width: 44, height: 44 }}>{renderDynamicIcon(iconName)}</FormIconWrapper>;
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
    <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
      {getIcon(form.icon ?? null)}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FormNameTypography variant="h5" sx={{ fontSize: "1.6rem", fontWeight: 700 }}>
            {form.name}
          </FormNameTypography>
          <Tooltip
            title={infoTooltipContent}
            placement="bottom"
            slotProps={formInfoTooltipSlotProps}
            arrow>
            <InfoIconButton size="small" sx={{ p: 0.5 }}>
              <InfoOutlinedIcon sx={{ fontSize: "20px", color: "#62748E" }} />
            </InfoIconButton>
          </Tooltip>
        </Box>
        <Typography variant="caption" sx={{ color: "#62748E", fontWeight: 600, fontSize: "0.9rem" }}>
          מזהה: {form.id}
        </Typography>
      </Box>
    </Box>
  );
};

export default Header;
