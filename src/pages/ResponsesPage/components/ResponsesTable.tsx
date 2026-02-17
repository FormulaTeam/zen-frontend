import { MaterialReactTable } from "material-react-table";
import Loader from "../../../components/Responses/Loader";
import { ContentContainer, MainContent } from "../styled";
import { useResponsesTable } from "../../../hooks/useResponsesTable";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { styled } from "@mui/material/styles";
import { useFormStore } from "../stores/form.store";

const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  "& .MuiDataGrid-columnSeparator": {
    right: "auto",
    left: -12,
  },
  "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnSeparator": {
    opacity: 1,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    textAlign: "right",
    width: "100%",
  },
  "& .MuiDataGrid-cell": {
    textAlign: "right",
  },
  "& .MuiDataGrid-columnHeader": {
    textAlign: "right",
  },
}));

export const ResponsesTable = () => {
  // const responsesTable = useResponsesTable({});
  const { responses, form, rows } = useFormStore();

  if (!form.columns) return null;

  // console.log("=======", responses);

  return (
    <ContentContainer>
      <MainContent $sidePanelOpen={false}>
        {/* {loadingTable ? <Loader /> :  */}
        <StyledDataGrid
          isRowSelectable={({ row }) => true}
          density="comfortable"
          rowHeight={38}
          loading={!rows}
          pagination
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection
          disableRowSelectionOnClick
          columns={form.columns}
          editMode="cell"
          rows={rows ?? []}
        />
      </MainContent>
    </ContentContainer>
  );
};
