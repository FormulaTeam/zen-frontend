import { ChangeEvent, memo } from "react";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { ManualItems } from "../index";
import { ArrayElement } from "@src/types/utils";
import styles from "./style.module.css";

interface Props {
  item: ArrayElement<ManualItems>;
  controllingFieldItems: ManualItems;
  onCheckChange: (e: ChangeEvent<HTMLInputElement>, controllingItem: ArrayElement<ManualItems>) => void;
  onCheckAllChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ManualOptionsControllingItemsList = memo(({
  item,
  controllingFieldItems,
  onCheckChange,
  onCheckAllChange,
}: Props) => {

  const activeControllingFieldItems = controllingFieldItems.filter(
    (controllingItem) => controllingItem.isActive !== false,
  );

  const disabled: boolean = !item.text?.length || !activeControllingFieldItems?.length;

  return (
    <div className={styles.controllingItemsContainer}>
      {
        activeControllingFieldItems.length ? (
          <>
            <FormControlLabel label="הכל"
              disabled={disabled}
              control={
                <Checkbox
                  checked={disabled || item.controllingItemsIds?.length === activeControllingFieldItems.length}
                  indeterminate={
                    !disabled &&
                    !!item.controllingItemsIds?.length &&
                    item.controllingItemsIds?.length < activeControllingFieldItems.length
                  }
                  onChange={onCheckAllChange} />
              } />
            <div className={styles.controllingItemsWrapper}>
              {
                activeControllingFieldItems.map((controllingItem) => {
                  const checked = disabled || (item.controllingItemsIds?.includes(controllingItem.id) ?? false);

                  return (
                    <div key={controllingItem.id} className={styles.controllingItem}>
                      <div className={styles.controllingItemBranch} />
                      <FormControlLabel label={controllingItem.text}
                        disabled={disabled}
                        control={
                          <Checkbox checked={checked}
                            onChange={(e) => onCheckChange(e, controllingItem)} />
                        } />
                    </div>
                  );
                })
              }
            </div>
          </>
        ) :
          (
            <Typography color={"textDisabled"} className={styles.noControllingItemsText}>
              אין אפשרויות מוגדרות בשדה המוביל
            </Typography>
          )
      }
    </div>
  );
});

export { ManualOptionsControllingItemsList };