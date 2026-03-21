import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import { searchResponses } from "../../api";
import { FormDto } from "../../types/shared";
import { SearchResponsesFilter } from "../../utils/interfaces";

type ZoomCellRow = {
  id: string | number;
  parentResponse?: string | null;
  [key: string]: unknown;
};

const ZoomCell = ({ row, form }: { row: ZoomCellRow; form: FormDto }) => {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<null | boolean>(null);

  useEffect(() => {
    const parentResponse = row?.parentResponse;

    if (typeof parentResponse !== "string" || !parentResponse || !parentResponse.includes(";")) {
      setIsValid(false);
      return;
    }

    const [formId, parentResponseId] = parentResponse.split(";");
    const filter: SearchResponsesFilter = {
      form_id: Number(formId),
      searchFilters: [{ searchText: parentResponseId, searchField: "id" }],
    };

    searchResponses(filter)
      .then((response: any) => {
        setIsValid(response.countAllResponses > 0);
      })
      .catch(() => {
        setIsValid(false);
      });
  }, [row]);

  const parentResponse = row?.parentResponse;

  if (typeof parentResponse !== "string" || !parentResponse || !parentResponse.includes(";")) {
    return <label>ללא</label>;
  }

  const [formId, parentResponseId] = parentResponse.split(";");

  if (isValid === null) return <label>טוען...</label>;

  if (!isValid) return <label>ללא</label>;

  return (
    <Box>
      <IconButton
        size="small"
        onClick={() => {
          navigate(`/response/view/${formId}/${parentResponseId}`, {
            state: { parentFormId: form.id },
          });
        }}>
        <OpenInNew />
      </IconButton>
    </Box>
  );
};

export default ZoomCell;
