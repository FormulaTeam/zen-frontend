import { DetailsRowContainer, ResponseCell, ResponseTitle } from "./styled";
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { Table, TableBody, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import ResponseDetailRow from "../ResponseDetailRow/ResponseDetailRow";
import { Form, ResponseForm } from "../../utils/interfaces";

interface ResponseDetailsPanelProps {
  responses: ResponseForm[];
  form: Form;
  title: string;
  parentFormId?: number;
}

function ResponseDetailsPanel({ responses, form, parentFormId, title }: ResponseDetailsPanelProps) {
  return (
    <DetailsRowContainer>
      <ResponseTitle>
        {title} - {responses.length} תגובות
      </ResponseTitle>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <ResponseCell>צפייה</ResponseCell>
              {form?.fields?.map((field, index) => (
                <ResponseCell key={index}>{field.displayName}</ResponseCell>
              ))}
              <ResponseCell>נוצר</ResponseCell>
              <ResponseCell>נוצר על ידי</ResponseCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses
              .sort((a, b) => {
                return a.index - b.index;
              })
              .map((response, index) => (
                <ResponseDetailRow
                  response={response}
                  form={form}
                  key={index}
                  parentFormId={parentFormId}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DetailsRowContainer>
  );
}
export default ResponseDetailsPanel;
