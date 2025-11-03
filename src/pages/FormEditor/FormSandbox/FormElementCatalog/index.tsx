import Grid from "@mui/material/Grid";
import { FORM_ELEMENTS, FormElementTypeId } from "../../../../utils/interfaces";
import styles from "./style.module.css";
import { Typography } from "@mui/material";
import { FormElementCatalogItem } from "./FormElementCatalogItem";
import { useFormSandboxContext } from "../../context/FormSandboxContext";

function FormElementCatalog() {
  const { handleDrag, handleDrop } = useFormSandboxContext("catalogItem");

  return (
    <>
      <div className={styles.catalogContainer}>
        <div className={styles.catalogTitle}>
          <Typography variant={"subtitle1"}>שדות מובנים</Typography>
        </div>
        <Grid container spacing={1} columns={3} sx={{ width: 305 }}>
          {
            Object.keys(FORM_ELEMENTS).map((typeId) => {
              const id = +typeId as FormElementTypeId;

              return (
                <Grid size={1} key={id}>
                  <FormElementCatalogItem id={id}
                                          onDrag={handleDrag}
                                          onDrop={handleDrop} />
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