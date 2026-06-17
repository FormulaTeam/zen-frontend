import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import noDataImage from "../../images/noData2.png";
import { formsScopeOption } from "../../types/enums/filtersAndSorts.enum";

const NoResultsContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 24px",
  textAlign: "center",
  backgroundColor: "#ffffff",
  borderRadius: "15px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.04)",
  width: "100%",
  minHeight: "350px",
  margin: "0 auto",
  maxWidth: "500px",
});

interface NoResultsStateProps {
  onClearSearch: () => void;
  setScope: (scope: any) => void;
  isSuperAdmin: boolean;
}

export function NoResultsState({ onClearSearch, setScope, isSuperAdmin }: NoResultsStateProps) {
  const handleCtaClick = () => {
    onClearSearch();
    setScope(isSuperAdmin ? formsScopeOption.AllForms : formsScopeOption.MyForms);
  };

  return (
    <NoResultsContainer>
      <img
        src={noDataImage}
        alt="No Results"
        style={{ width: "160px", marginBottom: "24px", opacity: 0.85 }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#2d3748",
          mb: 1,
          fontFamily: "Heebo",
        }}
      >
        לא נמצאו טפסים מתאימים
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#718096",
          mb: 3,
          maxWidth: "320px",
          fontFamily: "Heebo",
        }}
      >
        נסו לחפש שוב במילים אחרות, או חזרו לצפייה בכל הטפסים שלכם.
      </Typography>
      <Button
        variant="contained"
        onClick={handleCtaClick}
        sx={{
          backgroundColor: "#1E88E5",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "8px 24px",
          fontWeight: 600,
          textTransform: "none",
          fontFamily: "Heebo",
          "&:hover": {
            backgroundColor: "#1565C0",
          },
        }}
      >
        חזרה לכל הטפסים
      </Button>
    </NoResultsContainer>
  );
}

export default NoResultsState;
