import React, { useState } from "react";

import * as MuiIcons from "@mui/icons-material";
import { Box, Divider, Tooltip, useTheme } from "@mui/material";

import type { FormDto } from "../../types/shared";
import { getFormById } from "../../api/formsApi";
import UserPicker from "../USerPicker/UserPicker";
import ShareIcon from "../../icons/share.svg";
import formX from "../../images/form_x.png";
import { FormOverview } from "../../utils/interfaces";
import { CustomIcon } from "../../theme/icons";
import { getFormIconByName, showErrorNotification, PERMISSION_TYPES } from "../../utils/utils";
import CardCreationDetails from "./CardCreationDetails";
import { PermissionGate } from "../PermissionGate";
import {
  DescriptionDiv,
  Img,
  ItemBottomDiv,
  ItemBtnsDiv,
  ItemButton,
  ItemDescription,
  ItemIconsDiv,
  ItemImgAndTitles,
  ItemResponsesNum,
  ItemTitle,
  ItemTitleAndNum,
  ItemTitles,
  StyledCard,
} from "./styled";
import { CustomStyledIcon, GrayShareIcon } from "./styled";

const FormCard = ({
  form,
  isSuperAdmin,
  navigate,
  resetSearchValue,
}: {
  form: FormOverview;
  isSuperAdmin: boolean | null;
  navigate: any;
  resetSearchValue: () => void;
}) => {
  const theme = useTheme();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [fullForm, setFullForm] = useState<FormDto | null>(null);

  const handleShareClick = async () => {
    try {
      const fetchedForm = await getFormById(form.id);
      setFullForm(fetchedForm);
      setShowSharePopup(true);
    } catch {
      showErrorNotification("טעינת הטופס נכשלה");
    }
  };

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];

    return IconComponent ? <IconComponent /> : name;
  };

  const getIcon = (iconName: string | null) => {
    const iconSrc = getFormIconByName(iconName ?? undefined);

    if (iconSrc) return <Img src={iconSrc} alt={iconName ?? "form icon"} />;

    if (!iconName) return <Img src={formX} alt="form icon" />;

    return <CustomStyledIcon>{renderDynamicIcon(iconName)}</CustomStyledIcon>;
  };

  const goToResponsesPage = (event: React.MouseEvent<HTMLElement>) => {
    resetSearchValue();
    navigate(`/responses/${form.id}`, { replace: true });
    event.stopPropagation();
  };

  if (!form) return null;

  const userPermissions = form.permissions || [];

  return (
    <StyledCard
      sx={{ backgroundcolor: theme.palette.background.paper }}
      data-testid={`form-id-${form.id}`}
      className="form-card">
      <ItemImgAndTitles>
        <ItemTitles>
          <ItemTitleAndNum>
            <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
              {getIcon(form.icon)}
              <ItemTitle onClick={goToResponsesPage} title={form.name} className="form-title">
                {form.name}
              </ItemTitle>
            </Box>

            <ItemResponsesNum className="form-responses-count">
              <CustomIcon iconName="comments" />
              {form.responsesCount ?? 0}
            </ItemResponsesNum>
          </ItemTitleAndNum>

          <DescriptionDiv>
            <ItemDescription className="form-description">
              {form.description ? form.description : "-"}
            </ItemDescription>
          </DescriptionDiv>

          <CardCreationDetails form={form} />

          <Divider
            orientation="horizontal"
            sx={{
              marginTop: "10px",
              marginBottom: "5px",
              width: "100%",
              borderColor: theme.palette.text.secondary,
            }}
          />
        </ItemTitles>
      </ItemImgAndTitles>

      <ItemBottomDiv>
        <PermissionGate
          userPermissions={userPermissions}
          requiredPermissions={[PERMISSION_TYPES.EDIT_FORM, PERMISSION_TYPES.SHARE_FORM]}
          requireAny>
          <ItemIconsDiv>
            <PermissionGate userPermissions={userPermissions} requiredPermissions={[PERMISSION_TYPES.EDIT_FORM]}>
              <Tooltip title="עריכת טופס">
                <div>
                  <CustomIcon
                    testClassName="form-edit-button"
                    forcePointer
                    iconName="pencil"
                    onClick={() =>
                      navigate(`/form/edit/${form.id}`, { state: { from: location.pathname } })
                    }
                  />
                </div>
              </Tooltip>
            </PermissionGate>

            <PermissionGate userPermissions={userPermissions} requiredPermissions={[PERMISSION_TYPES.SHARE_FORM]}>
              <Tooltip title="שיתוף טופס">
                <div>
                  <GrayShareIcon src={ShareIcon} onClick={handleShareClick} />
                </div>
              </Tooltip>
            </PermissionGate>
          </ItemIconsDiv>
        </PermissionGate>

        {showSharePopup && fullForm && (
          <UserPicker
            form={fullForm}
            closeSharePopupAndRefreshForm={() => {
              setShowSharePopup(false);
            }}
          />
        )}

        <ItemBtnsDiv>
          <PermissionGate userPermissions={userPermissions} requiredPermissions={[PERMISSION_TYPES.CREATE_RESPONSE]}>
            <ItemButton
              className="form-add-response-button"
              onClick={() => navigate(`/response/create/${form.id}`)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                borderRadius: "15px",
                "&:hover": {
                  backgroundColor: "white",
                  color: theme.palette.primary.main,
                  outline: `1px solid ${theme.palette.primary.main}`,
                },
              }}>
              הוספת תגובה
            </ItemButton>
          </PermissionGate>

          <PermissionGate
            userPermissions={userPermissions}
            requiredPermissions={[PERMISSION_TYPES.VIEW_RESPONSE, PERMISSION_TYPES.VIEW_YOUR_RESPONSES]}
            requireAny>
            <ItemButton
              className="form-watch-responses-button"
              onClick={goToResponsesPage}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                borderRadius: "15px",
                "&:hover": {
                  backgroundColor: "white",
                  color: theme.palette.primary.main,
                  outline: `1px solid ${theme.palette.primary.main}`,
                },
              }}>
              צפייה בתגובות
            </ItemButton>
          </PermissionGate>
        </ItemBtnsDiv>
      </ItemBottomDiv>
    </StyledCard>
  );
};

export default FormCard;
