import { Box, Button, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

interface CreateNewProps {
  isFirstForm?: boolean;
}

const CreateNew = ({ isFirstForm = false }: CreateNewProps) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <>
      <Box sx={{ marginTop: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/form/create")}
          sx={{ fontWeight: 700 }}>
          {isFirstForm ? "ליצירת הטופס הראשון שלך" : "יצירת טופס חדש"}
        </Button>
      </Box>
    </>
  );
};

export default CreateNew;
