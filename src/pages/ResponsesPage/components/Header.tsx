import { useEffect, useRef, useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import * as MuiIcons from "@mui/icons-material";

import { getCreatorName } from "../../../utils/formFieldsResponses";
import { getFormIconByName } from "../../../utils/utils";
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
  const nameRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (!form) return;

    const checkTruncation = () => {
      if (nameRef.current) {
        const { scrollWidth, clientWidth } = nameRef.current;
        setIsTruncated(scrollWidth > clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [form?.name]);

  if (!form) return null;

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];
    return IconComponent ? <IconComponent sx={{ fontSize: 32 }} color="primary" /> : name;
  };

  const getIconContent = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (typeof iconSrc === "string") {
      return <img src={iconSrc} alt={iconName ?? "form icon"} style={{ width: 32, height: 32 }} />;
    }

    const IconComponent = iconSrc;
    if (IconComponent) {
      return <IconComponent color="primary" sx={{ fontSize: 32 }} />;
    }

    return renderDynamicIcon(iconName ?? "grid_view");
  };

  const infoTooltipContent = (
    <FormInfoContentBox>
      {isTruncated && (
        <FormInfoSectionBox sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.08)", pb: 1, mb: 1 }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: "#020618",
              lineHeight: 1.3,
              fontFamily: "Heebo, sans-serif",
            }}>
            {form.name}
          </Typography>
        </FormInfoSectionBox>
      )}

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
        ref={nameRef}
        sx={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "inherit",
          lineHeight: 1,
          display: "inline-block",
        }}>
        {form.name}
      </FormNameTypography>

      {/* ID */}
      <Tooltip title={"מזהה הטופס"}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "2rem",
            lineHeight: 1,
            display: "inline",
          }}>
          {form.id}
        </Typography>
      </Tooltip>

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
