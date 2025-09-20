import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import Divider from "@mui/material/Divider";

// ConditionalPopup styled components
export const StyledDialog = styled(Dialog)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  position: "relative",
}));

export const PopupButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.grey[500],
  float: "left",
}));

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

// EditCondition styled components
export const EditConditionContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
}));

export const EditConditionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  flexShrink: 0,
}));

export const EditConditionMainLayout = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  gap: theme.spacing(2),
  minHeight: 0,
  padding: theme.spacing(2),
  overflow: "auto",
}));

export const EditConditionRightPanel = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flexShrink: 0,
}));

export const EditConditionScrollContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  border: "1px solid #e0e0e0",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
}));

export const EditConditionLeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
}));

export const EditConditionLeftScrollContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  overflowX: "hidden",
  paddingRight: theme.spacing(1),
  border: "1px solid #e0e0e0",
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const EditConditionControlsContainer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
}));

export const EditConditionPreviewContainer = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  maxWidth: "300px",
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: "bold",
}));

// AffectedTargetsSection styled components
export const AffectedTargetsContainer = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
}));

export const AffectedTargetsTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

export const AffectedTargetsDescriptionText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const AffectedTargetsWarning = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const AffectedTargetsListContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const AffectedTargetsListTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const AffectedTargetsWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const AffectedTargetItem = styled(Paper)<{ targetType?: "section" | "field" }>(
  ({ theme, targetType }) => ({
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    backgroundColor: targetType === "section" ? theme.palette.primary[50] : theme.palette.info[50],
    border: targetType === "section" ? "1px solid" : "1px dashed",
    borderColor: targetType === "section" ? theme.palette.primary[200] : theme.palette.info[200],
  }),
);

export const AffectedTargetText = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
}));

export const AffectedTargetRemoveButton = styled(IconButton)(({ theme }) => ({
  minWidth: "auto",
  padding: theme.spacing(0.5),
}));

export const AffectedTargetsSelectContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  flexWrap: "wrap",
  alignItems: "center",
}));

export const AffectedTargetsSelect = styled(Select)(({ theme }) => ({
  minWidth: 200,
}));

export const AffectedTargetsEmptyMessage = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontStyle: "italic",
}));

// ConditionItem styled components
export const ConditionItemContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%",
}));

export const ConditionItemFieldsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  alignItems: "center",
}));

export const ConditionItemRemoveButton = styled(IconButton)(({ theme }) => ({
  minWidth: "auto",
}));

export const ConditionPreviewText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontStyle: "italic",
  fontSize: "1rem",
}));

// Existing styled components
export const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
}));

export const ConditionItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

export const ConditionActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
}));

export const ConditionDescriptionText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
}));

export const PreviewText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  fontStyle: "italic",
  fontSize: "1.3rem",
}));

// ConditionsPreview styled components
export const ConditionsPreviewContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
}));

export const ConditionsPreviewTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

export const ConditionsPreviewDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const ConditionsPreviewAffectedTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

// ConditionGroup styled components
export const ConditionGroupContainer = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
}));

export const ConditionGroupHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
}));

export const ConditionGroupTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

export const ConditionGroupOperatorContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

export const ConditionGroupOperatorSelect = styled(Select)(({ theme }) => ({
  minWidth: 80,
}));

export const ConditionGroupButtonsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: "flex",
  gap: theme.spacing(2),
  flexWrap: "wrap",
}));

// Individual condition container within a group
export const ConditionInGroupContainer = styled(Box)(({ theme }) => ({
  // Basic container styling
  marginBottom: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const ConditionOperatorDividerContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  width: "100%",
}));

// ConditionControls styled components
export const ConditionControlsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: "flex",
  gap: theme.spacing(2),
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const ConditionControlsButtonGroup = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
}));

// Styled Divider for condition separators
export const ConditionDivider = styled(Divider)(({ theme }) => ({
  flex: 1,
}));

// ConfirmationPopover styled components
export const PopoverContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 250,
}));

export const MessageText = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

export const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  justifyContent: "flex-end",
}));

export const MainEditConditionContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  gap: theme.spacing(2),
  minHeight: 0,
  overflow: "hidden",
}));
