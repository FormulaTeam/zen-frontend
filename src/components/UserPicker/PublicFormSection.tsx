import React, { useState } from "react";
import { Tooltip, IconButton, Switch, Box, Typography, TextField, InputAdornment, Button } from "@mui/material";
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

  const publicLink = `${window.location.origin}/response/create/${form?.id}`;

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
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: isPublic ? `${theme.palette.primary.main}14` : '#f1f5f9',
                color: isPublic ? theme.palette.primary.main : '#94a3b8',
                transition: 'all 0.3s ease'
              }}
            >
              <LanguageIcon sx={{ fontSize: '1.2rem' }} />
            </Box>
            <Box>
              <LabelText>גישה פומבית לטופס</LabelText>
              <Typography variant="caption" sx={{ color: "#94a3b8", display: "block", mt: -0.5 }}>
                {isPublic ? 'הטופס זמין לכל מי שברשותו הקישור, בהתאם להרשאה הנבחרת' : 'הטופס חסום למילוי ללא הרשאה אישית'}
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
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={publicLink}
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip title={copied ? "הועתק!" : "העתק קישור"}>
                      <Button 
                        onClick={handleCopyLink} 
                        variant="contained"
                        disableElevation
                        size="small"
                        sx={{ 
                          minWidth: '80px', // Larger fixed width
                          height: '40px',   // Match the standard small TextField height
                          px: 2,
                          py: 0,
                          ml: -1.8,         // Pull it all the way to the right edge (RTL)
                          mr: 1,
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          borderRadius: '10px 0 0 10px', // Rounded corners on the outer side only
                          backgroundColor: copied ? "#10b981" : theme.palette.primary.main,
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: copied ? "#059669" : theme.palette.primary.dark,
                          },
                          "& .MuiSvgIcon-root": {
                            fontSize: '1.2rem'
                          }
                        }}
                      >
                        {copied ? <CheckIcon /> : 'העתק'}
                      </Button>
                    </Tooltip>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: "#fff",
                  borderRadius: "10px",
                  fontSize: "0.8rem",
                  color: "#64748b",
                  fontWeight: 500,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                    borderWidth: '1.5px',
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cbd5e0",
                  },
                }
              }}
            />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mt: 2,
            pt: 2,
            borderTop: '1px solid #e2e8f0'
          }}>
            <PermissionsText $color="#475569">
              הרשאה למשתמשים פומביים:
            </PermissionsText>
            <RolesAutocomplete
              isDisabled={false}
              handleRoleChange={handleLocalFormPermissionChange}
              width="140px"
              excludeRoleIds={[role.FormAdmin]}
              initialValue={formPermission}
            />
          </Box>
        </PermissionsWrapper>
      )}
    </Wrapper>
  );
};

export default PublicFormSection;
