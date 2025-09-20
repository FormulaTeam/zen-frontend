import { OpenInNew } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getResponseFieldStringValue } from "../../utils/responses";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import { ResponseCell } from "../ResponseDetailsPanel/styled";
import { Form, ResponseForm } from "../../utils/interfaces";
interface ResponseDetailsRowProps {
  response: ResponseForm;
  form: Form;
  parentFormId?: number;
}
function ResponseDetailRow({ response, form, parentFormId }: ResponseDetailsRowProps) {
  const navigate = useNavigate();
  const formatCreatedDate = new Date(response.created).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <TableRow>
      <ResponseCell align="center">
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            navigate(`/response/view/${response.form_id}/${response.id}`, {
              state: { parentFormId },
            });
          }}>
          <OpenInNew />
        </IconButton>
      </ResponseCell>
      {form?.fields?.map((field, fieldIndex) => {
        const fieldValue =
          response?.data?.find((item) => item.uniqueId === field.uniqueId)?.value || "";
        return (
          <ResponseCell key={fieldIndex}>
            {getResponseFieldStringValue(field, fieldValue)}
          </ResponseCell>
        );
      })}
      <ResponseCell>{formatCreatedDate}</ResponseCell>
      <ResponseCell>{response.created_by_name}</ResponseCell>
    </TableRow>
  );
}
export default ResponseDetailRow;
