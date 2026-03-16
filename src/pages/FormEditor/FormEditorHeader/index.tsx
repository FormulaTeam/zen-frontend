import styles from "./style.module.css";
import { getFormIconByName, DEFAULT_ICON_NAME } from "@utils/utils";
import { Button, TextField, Tooltip, Typography } from "@mui/material";
import { FormMetadata, useFormStructureContext } from "../context/FormStructureContext";
import { Check, Close, DriveFileRenameOutline } from "@mui/icons-material";
import { useState } from "react";
import { useFormEditor } from "../hooks/useFormEditor";

function FormEditorHeader() {
  const { formStructure, validateForm, setFormMetadata } = useFormStructureContext();
  const { handleSaveForm, handleExit, isLoading } = useFormEditor(formStructure);

  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState<FormMetadata>({ title: "" });

  const { title, description, iconId, validationErrors } = formStructure.metadata;

  const onSaveClick = () => {
    validateForm();
    handleSaveForm();
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerStart}>
        <div className={styles.formIconWrapper}>
          <img src={getFormIconByName(DEFAULT_ICON_NAME) ?? iconId}
            alt={"icon"}
            className={styles.formIcon}
            onClick={() => null} />
        </div>
        <div className={styles.editingMetadata}>
          {
            isEditingMetadata ? (
              <>
                <div className={styles.editingMetadataText}>
                  <TextField value={editedMetadata.title}
                    slotProps={{
                      htmlInput: {
                        className: styles.titleInput,
                      },
                    }}
                    size={"medium"}
                    placeholder={"שם הטופס"}
                    error={!!validationErrors?.title}
                    helperText={validationErrors?.title?.[0]}
                    variant={"standard"}
                    onChange={(e) => setEditedMetadata((prev) => ({ ...prev, title: e.target.value }))} />
                  <TextField value={editedMetadata.description}
                    placeholder={"תיאור"}
                    error={!!validationErrors?.description}
                    helperText={validationErrors?.description?.[0]}
                    variant={"standard"}
                    onChange={(e) => setEditedMetadata((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))} />
                </div>
                <div>
                  <Button className={styles.button}
                    onClick={(_) => {
                      setIsEditingMetadata(!setFormMetadata(editedMetadata));
                    }}>
                    <Check sx={{ fontSize: 20, color: "#308e63" }} />
                  </Button>
                  <Button className={styles.button}
                    onClick={(_) => {
                      setIsEditingMetadata(false);
                    }}>
                    <Close sx={{ fontSize: 20, color: "#a54160" }} />
                  </Button>
                </div>
              </>
            ) : (
              <div>
                <div className={styles.title}>
                  <>
                    <Typography variant={"h5"}>{title || "שם הטופס"}</Typography>
                    <Tooltip title="עריכת פרטי הטופס">
                      <Button className={styles.button}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(_) => {
                          setEditedMetadata((prev) => ({ ...prev, title, description }));
                          setIsEditingMetadata(true);
                        }}>
                        <DriveFileRenameOutline sx={{ fontSize: 25, color: "#506f9e" }} />
                      </Button>
                    </Tooltip>
                  </>
                </div>
                <Typography variant="subtitle1">{description ?? "ללא תיאור"}</Typography>
              </div>
            )
          }
        </div>
      </div>
      <div className={styles.headerEnd}>
        <Button variant={"contained"} color={"primary"} onClick={onSaveClick} disabled={isLoading}>
          {isLoading ? "שוומר..." : "שמירה"}
        </Button>
        <Button variant={"outlined"} color={"error"} onClick={handleExit} disabled={isLoading}>יציאה</Button>
      </div>
    </div>
  );
}

export { FormEditorHeader };