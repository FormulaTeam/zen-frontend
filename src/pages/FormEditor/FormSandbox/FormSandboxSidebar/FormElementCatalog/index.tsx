import Grid from "@mui/material/Grid";
import { FORM_ELEMENTS, FormFieldTypeId } from "../../../../../utils/interfaces";
import styles from "./style.module.css";
import { Typography } from "@mui/material";
import { FormElementCatalogItem } from "./FormElementCatalogItem";
import { useFormStructureContext } from "../../../context/FormStructureContext";

function FormElementCatalog() {
  const { appendFieldToFirstSection } = useFormStructureContext();

  return (
    <>
      <div className={styles.catalogContainer}>
        <div className={styles.catalogTitle}>
          <Typography variant={"subtitle1"}>קטלוג שדות</Typography>
        </div>
        <Grid container spacing={1} columns={3} sx={{ width: 305 }}>
          {
            Object.keys(FORM_ELEMENTS).map((typeId) => {
              const id = +typeId as FormFieldTypeId;

              return (
                <Grid size={1} key={id}>
                  <FormElementCatalogItem id={id} onClick={() => appendFieldToFirstSection(id)} />
                </Grid>
              );
            })
          }
        </Grid>
      </div>
    </>
  );
}

export { FormElementCatalog };