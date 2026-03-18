import { Close, DatasetLinked, DatasetLinkedOutlined, PlayArrow } from "@mui/icons-material";
import { Button, TextField } from "@mui/material";
import { ChangeEvent } from "react";
import { $ZodErrorTree } from "zod/v4/core";
import { ArrayElement } from "../../../../../../../../../../types/utils";
import styles from "./style.module.css";
import { ManualItems } from "..";

interface Props {
  index: number;
  item: ArrayElement<ManualItems>;
  isDeletable: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  onDelete: () => void;

  validationErrors?: $ZodErrorTree<any>;
  isSelectedControlledItem?: boolean;
  onSelectControlledItem?: () => void;
}

function ManualOptionsItemField({
                                  item,
                                  index,
                                  validationErrors,
                                  onChange,
                                  onDelete,
                                  onFocus,
                                  isDeletable,
                                  isSelectedControlledItem,
                                  onSelectControlledItem,
                                }: Props) {
  const isDefined = !!item.text?.length;

  return (
    <div key={item.id} className={styles.itemContainer}>
      <TextField variant={"standard"}
                 className={styles.itemTextField}
                 fullWidth
                 value={item.text}
                 placeholder={`הזנת אפשרות ${index + 1}`}
                 error={!!validationErrors}
                 helperText={validationErrors?.errors[0]}
                 onFocus={onFocus}
                 onChange={onChange} />
      <Button className={styles.button}
              disabled={!isDeletable}
              onClick={onDelete}>
        <Close sx={{ fontSize: 20, color: isDeletable ? "#a54160" : "gray" }} />
      </Button>
      {
        isSelectedControlledItem != undefined &&
        <>
          <Button className={styles.button}
                  disabled={isSelectedControlledItem}
                  onClick={onSelectControlledItem}>
            {
              isSelectedControlledItem ?
                <DatasetLinked color={isDefined ? "primary" : "action"} sx={{ fontSize: 20 }} /> :
                <DatasetLinkedOutlined color={isDefined ? "primary" : "action"} sx={{ fontSize: 20 }} />
            }
          </Button>

          <PlayArrow style={{ color: isSelectedControlledItem ? "#e1e7ec" : "transparent" }}
                     className={styles.controllingItemsArrow} />
        </>
      }
    </div>
  );
}

export { ManualOptionsItemField };