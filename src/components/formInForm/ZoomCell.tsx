import React, { useEffect, useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { getResponseById } from "../../api";
import { FormDto } from "../../types/shared";

type ZoomCellRow = {
  id: string | number;
  parentResponse?: string | any | null;
  [key: string]: unknown;
};

const ZoomCell = ({ row, form }: { row: ZoomCellRow; form: FormDto }) => {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<null | boolean>(null);

  const getParentInfo = useCallback(() => {
    const parentResponse = row?.parentResponse;
    if (!parentResponse) return null;

    if (typeof parentResponse === "string") {
      if (!parentResponse.includes(";")) return null;
      const [formId, responseId] = parentResponse.split(";");
      return { formId: Number(formId), responseId };
    }

    if (typeof parentResponse === "object") {
      const id = parentResponse.id || parentResponse.responseId;
      const formId = parentResponse.form_id || parentResponse.formId;
      if (id && formId) return { formId: Number(formId), responseId: String(id) };
    }

    return null;
  }, [row?.parentResponse]);

  const parentInfo = useMemo(() => getParentInfo(), [getParentInfo]);

  useEffect(() => {
    if (!parentInfo) {
      setIsValid(false);
      return;
    }

    getResponseById(parentInfo.formId, parentInfo.responseId)
      .then(() => {
        setIsValid(true);
      })
      .catch(() => {
        setIsValid(false);
      });
  }, [parentInfo]);

  if (!parentInfo) {
    return <label>ללא</label>;
  }

  if (isValid === null) return <label>טוען...</label>;

  if (!isValid) return <label>-</label>;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        variant="text"
        size="small"
        startIcon={<OpenInNew sx={{ fontSize: "1.2rem !important" }} />}
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/response/view/${parentInfo.formId}/${parentInfo.responseId}`, {
            state: { parentFormId: form.id },
          });
        }}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          color: "#1E88E5",
          padding: "2px 8px",
          minWidth: "auto",
          "&:hover": {
            backgroundColor: "rgba(30, 136, 229, 0.08)",
          },
        }}></Button>
    </Box>
  );
};

export default ZoomCell;
