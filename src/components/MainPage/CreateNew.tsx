import { Box, Button, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const CreateNew = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <>
      <Typography sx={{ marginTop: 2, fontSize: "1.2rem", textAlign: "center" }}>
        ליצירת טופס חדש במערכת יש ללחוץ על הכפתור ‘יצירת טופס חדש’
      </Typography>

      <Box sx={{ marginTop: 3 }}>
        <Button variant="contained" onClick={() => navigate("/form/create")}>
          יצירת טופס חדש
          <AddIcon />
        </Button>
      </Box>
    </>
  );
};

export default CreateNew;
