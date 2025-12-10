import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import React from "react";
import { Box, Divider, Icon, Tooltip, useTheme } from "@mui/material";
import {
  formIconsNamesMap,
  PERMISSION_TYPES,
  getResponsesAndExportToExcel,
  showErrorNotification,
  showSuccessNotification,
} from "../../utils/utils";
import { sendToMetroFormResponses } from "../../api";
import { Filter, Form, MetroReturnedData } from "../../utils/interfaces";
import formX from "../../images/form_x.png";
import CardCreationDetails from "./CardCreationDetails";
import { CustomIcon } from "../../theme/icons";
import { CustomStyledIcon, LoadingSyncIconBox } from "./styled";
import * as MuiIcons from "@mui/icons-material";

import {
  ItemBottomDiv,
  ItemButton,
  ItemDescription,
  ItemIconsDiv,
  ItemImgAndTitles,
  ItemResponsesNum,
  ItemTitle,
  ItemTitleAndNum,
  ItemTitles,
  Img,
  StyledCard,
  DescriptionDiv,
  ItemBtnsDiv,
} from "./styled";

const FormCard = ({
  form,
  roles,
  user,
  isSuperAdmin,
  navigate,
  setShowMetroPopup,
  setFormToEdit,
  setShowSharePopup,
  resetSearchValue,
}) => {
  const theme = useTheme();
  const [showLoadingExportBtn, setShowLoadingExportBtn] = useState<boolean>(false);
  const [loadingForFormId, setLoadingForFormId] = useState<number>(0);

  const renderDynamicIcon = (name: string) => {
    const IconComponent = MuiIcons[name as keyof typeof MuiIcons];
    return IconComponent ? <IconComponent /> : name;
  };

  useEffect(() => {
    if (showLoadingExportBtn) {
      exportFileAndSetLoadingToFalse();
    }
  }, [showLoadingExportBtn]);

  const exportFileAndSetLoadingToFalse = async () => {
    let filter: Filter = {
      form_id: form.id,
    };
    await getResponsesAndExportToExcel(form);
    setShowLoadingExportBtn(false);
    setLoadingForFormId(0);
  };

  /** go to Responses Page - called in router */
  const goToResponsesPage = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, form: Form) => {
    resetSearchValue();
    navigate("/responses/" + form?.id, { replace: true });
    event.stopPropagation();
  };

  const pushFormToMetro = async (form: Form) => {
    setShowMetroPopup(true);
    try {
      let ans: MetroReturnedData = await sendToMetroFormResponses(form?.id);

      if (ans?.failedResponsesIds && ans?.failedResponsesIds?.length > 0) {
        showErrorNotification(ans?.failedResponsesIds?.length + " מהתגובות לא סונכרנו כשורה");
      }
      if (ans?.responseIds?.length > 0) {
        showSuccessNotification(ans?.responseIds?.length + " סונכרנו בהצלחה");
      } else if (ans?.responseIds?.length === 0) {
      }
      setShowMetroPopup(false);
    } catch (error) {
      showErrorNotification("הדחיפה למטרו נכשלה"); //Failed to push to metro: " + error);
    } finally {
      setShowMetroPopup(false);
    }
  };
  if (!form) {
    return null;
  }
  let userRole = form.users?.find((u) => u.upn?.toLowerCase() === user.upn?.toLowerCase())?.role_id;
  let permissionTypes = roles.find((r) => r.role_id === userRole)?.permission_types;

  const getIcon = (iconName: string | null) => {
    if (!iconName) {
      return <Img src={formX} alt="form icon" />;
    }
    if (formIconsNamesMap.get(iconName)) {
      return <Img src={formIconsNamesMap.get(iconName)} alt={iconName} />;
    }
    return <CustomStyledIcon>{renderDynamicIcon(iconName)}</CustomStyledIcon>;
  };

  return (
    <StyledCard sx={{ backgroundcolor: theme.palette.background.paper }}>
      <ItemImgAndTitles>
        <ItemTitles>
          <ItemTitleAndNum>
            <Box sx={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
              {getIcon(form?.icon)}
              <ItemTitle onClick={(event) => goToResponsesPage(event, form)} title={form.name}>
                {form.name}
              </ItemTitle>
            </Box>
            <ItemResponsesNum>
              <CustomIcon iconName="comments" />
              {form?.numberOfResponses || 0}
            </ItemResponsesNum>
          </ItemTitleAndNum>

          <DescriptionDiv>
            <ItemDescription>{form.description ? form.description : "-"}</ItemDescription>
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
        {(permissionTypes?.includes(PERMISSION_TYPES.EDIT_FORM) || isSuperAdmin) && (
          <ItemIconsDiv>
            <Tooltip title="עריכת טופס">
              <div>
                <CustomIcon
                  forcePointer
                  iconName="pencil"
                  onClick={() =>
                    navigate(`/form/edit/${form.id}`, { state: { from: location.pathname } })
                  }
                />
              </div>
            </Tooltip>
            {form?.fields?.length > 0 &&
              (form?.numberOfResponses > 0 &&
              (permissionTypes?.includes(PERMISSION_TYPES.EXPORT_FORM) || isSuperAdmin) ? (
                <Tooltip title={"ייצוא נתונים לאקסל"}>
                  {showLoadingExportBtn && loadingForFormId === form.id ? (
                    <LoadingSyncIconBox>
                      <ReactLoading
                        type="spinningBubbles"
                        color={theme.palette.primary.main}
                        width="10px"
                        height="28px"></ReactLoading>
                    </LoadingSyncIconBox>
                  ) : (
                    <div>
                      <CustomIcon
                        iconName={"excelGray"}
                        style={{ height: "17px" }}
                        onClick={() => {
                          setShowLoadingExportBtn(true);
                          setLoadingForFormId(form.id);
                        }}
                      />
                    </div>
                  )}
                </Tooltip>
              ) : (
                <Tooltip
                  title={<span className="tooltip-span">לא ניתן לייצא טופס ללא תגובות</span>}>
                  <div>
                    <CustomIcon iconName={"excelGray"} style={{ height: "17px" }} />
                  </div>
                </Tooltip>
              ))}

            {(permissionTypes?.includes(PERMISSION_TYPES.SYNC_FORM) || isSuperAdmin) &&
              form?.numberOfResponses > 0 && (
                <Tooltip title="סנכרון נתונים">
                  <div>
                    <CustomIcon
                      iconName="syncGray"
                      forcePointer
                      onClick={() => pushFormToMetro(form)}
                    />
                  </div>
                </Tooltip>
              )}

            {((form?.fields?.length > 0 &&
              permissionTypes?.includes(PERMISSION_TYPES.SHARE_FORM)) ||
              isSuperAdmin) && (
              <Tooltip title="שיתוף טופס">
                <div>
                  <CustomIcon
                    forcePointer
                    iconName="share"
                    style={{ height: "14px", opacity: "0.5" }}
                    onClick={() => {
                      setFormToEdit(form);
                      setShowSharePopup(true);
                    }}
                  />
                </div>
              </Tooltip>
            )}
          </ItemIconsDiv>
        )}

        <ItemBtnsDiv>
          {form?.fields?.length > 0 &&
            (permissionTypes?.includes(PERMISSION_TYPES.CREATE_RESPONSE) || isSuperAdmin) && (
              <ItemButton
                onClick={() => navigate(`/response/create/${form.id}`)}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  borderRadius: "15px",
                  "&:hover": {
                    backgroundColor: "white",
                    color: theme.palette.primary.main,
                    outline: "1px solid " + theme.palette.primary.main,
                  },
                }}>
                הוספת תגובה
              </ItemButton>
            )}

          {(permissionTypes?.includes(PERMISSION_TYPES.VIEW_RESPONSE) ||
            permissionTypes?.includes(PERMISSION_TYPES.VIEW_YOUR_RESPONSES) ||
            isSuperAdmin) && (
            <ItemButton
              onClick={(event) => goToResponsesPage(event, form)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                borderRadius: "15px",
                "&:hover": {
                  backgroundColor: "white",
                  color: theme.palette.primary.main,
                  outline: "1px solid " + theme.palette.primary.main,
                },
              }}>
              צפייה בתגובות
            </ItemButton>
          )}
        </ItemBtnsDiv>
      </ItemBottomDiv>
    </StyledCard>
  );
};

export default FormCard;
