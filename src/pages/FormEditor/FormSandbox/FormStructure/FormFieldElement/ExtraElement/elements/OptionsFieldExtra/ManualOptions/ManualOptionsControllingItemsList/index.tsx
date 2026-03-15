import { ChangeEvent, memo } from "react";
import { Checkbox, FormControlLabel, Typography } from "@mui/material";
import { ManualItems } from "../index";
import { ArrayElement } from "../../../../../../../../../../types/utils";
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
  const disabled = !item.text?.length || !controllingFieldItems?.length;

  return (
    <div className={styles.controllingItemsContainer}>
      {
        controllingFieldItems.length ? (
            <>
              <FormControlLabel label="הכל"
                                disabled={disabled}
                                control={
                                  <Checkbox
                                    checked={item.controllingItemsIds?.length === controllingFieldItems?.length}
                                    indeterminate={
                                      !!item.controllingItemsIds?.length &&
                                      item.controllingItemsIds?.length < controllingFieldItems.length
                                    }
                                    onChange={onCheckAllChange} />
                                } />
              <div className={styles.controllingItemsWrapper}>
                {
                  controllingFieldItems.map((controllingItem) => {
                    const checked = item.controllingItemsIds?.includes(controllingItem.id) ?? false;

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