import React, { useState } from "react";
import {
  Tooltip,
  IconButton,
  Switch,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useTheme } from "@mui/material/styles";
import { role } from "formula-gear";
import RolesAutocomplete from "./RolesAutocomplete";
import { ROLE_CATALOG } from "../../consts/roles";
import { FormOverview } from "@src/utils/interfaces";
import {
  Wrapper,
  LabelWrapper,
  LabelText,
  PermissionsWrapper,
  PermissionsText,
  NoteText,
} from "./publicForm.styled";

interface PublicFormSectionProps {
  isPublic: boolean;
  togglePublicForm: () => void;
  formPermission: any;
  setFormPermission: (val: any) => void;
  handleLocalFormPermissionChange: (event: any, newValue: any) => void;
  form: FormOverview | any;
}

const PublicFormSection: React.FC<PublicFormSectionProps> = ({
  isPublic,
  togglePublicForm,
  formPermission,
  setFormPermission,
  handleLocalFormPermissionChange,
  form,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const getRoleName = () => {
    if (!formPermission) return "";
    if (typeof formPermission === "object" && formPermission.roleName) {
      return formPermission.roleName;
    }
    const roleId = typeof formPermission === "object" ? formPermission.role_id : formPermission;
    const roleObj = ROLE_CATALOG.find((r) => r.role_id === roleId);
    return roleObj ? roleObj.roleName : "";
  };

  const roleName = getRoleName();

  const publicLink = `${window.location.origin}/responses/${form?.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Wrapper $isPublic={isPublic}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <LabelWrapper $color={theme.palette.text.primary} onClick={togglePublicForm}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: isPublic ? `${theme.palette.primary.main}14` : "#f1f5f9",
                color: isPublic ? theme.palette.primary.main : "#94a3b8",
                transition: "all 0.3s ease",
              }}>
              <LanguageIcon sx={{ fontSize: "1.2rem" }} />
            </Box>
            <Box>
              <LabelText>גישה פומבית לטופס</LabelText>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: -0.5 }}>
                {isPublic
                  ? "הגדרת גישה לטופס לכל מי שברשותו הקישור"
                  : "הטופס חסום לכל מי שאין לו הרשאה אישית"}
              </Typography>
            </Box>
          </Box>
        </LabelWrapper>
        <Switch
          checked={isPublic}
          onChange={togglePublicForm}
          color="primary"
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: theme.palette.primary.main,
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: theme.palette.primary.main,
            },
          }}
        />
      </Box>

      {isPublic && (
        <PermissionsWrapper>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}>
            {/* Link Area (on top, compact) */}
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "#fff",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
                p: "4px 12px",
                height: "38px",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
                "&:hover": {
                  borderColor: "#cbd5e0",
                },
              }}>
              {/* Copy Icon Button with Micro-Animation */}
              <Tooltip title={copied ? "הועתק!" : "העתק קישור"} placement="top">
                <IconButton
                  onClick={handleCopyLink}
                  size="small"
                  sx={{
                    color: copied ? "#10b981" : "#94a3b8",
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: copied ? "scale(1.15)" : "scale(1)",
                    p: 0.5,
                    "&:hover": {
                      color: copied ? "#059669" : theme.palette.primary.main,
                      backgroundColor: copied
                        ? "rgba(16, 185, 129, 0.08)"
                        : "rgba(30, 136, 229, 0.08)",
                    },
                  }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    {/* Copy Icon */}
                    <Box
                      sx={{
                        position: "absolute",
                        transition: "all 0.2s ease-in-out",
                        transform: copied ? "scale(0) rotate(-45deg)" : "scale(1) rotate(0)",
                        opacity: copied ? 0 : 1,
                        display: "flex",
                      }}>
                      <ContentCopyIcon sx={{ fontSize: "1.1rem" }} />
                    </Box>

                    {/* Check Icon */}
                    <Box
                      sx={{
                        position: "absolute",
                        transition: "all 0.2s ease-in-out",
                        transform: copied ? "scale(1) rotate(0)" : "scale(0) rotate(45deg)",
                        opacity: copied ? 1 : 0,
                        display: "flex",
                      }}>
                      <CheckIcon sx={{ fontSize: "1.1rem" }} />
                    </Box>
                  </Box>
                </IconButton>
              </Tooltip>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  fontWeight: 500,
                  fontSize: "0.75rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  userSelect: "all",
                  fontFamily: "Heebo, sans-serif",
                  direction: "ltr",
                  maxWidth: "calc(100% - 32px)",
                }}>
                {publicLink}
              </Typography>
            </Box>

            {/* Roles Area (on bottom) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}>
              <PermissionsText
                $color="#475569"
                style={{ whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                בחירת הרשאה עבור מחזיקי הקישור{" "}
              </PermissionsText>
              <RolesAutocomplete
                isDisabled={false}
                handleRoleChange={handleLocalFormPermissionChange}
                width="210px"
                excludeRoleIds={[role.FormAdmin]}
                initialValue={formPermission}
              />
            </Box>
          </Box>
        </PermissionsWrapper>
      )}
    </Wrapper>
  );
};

export default PublicFormSection;
