import React from "react";
import { Pin } from "lucide-react";
import Grid from "@mui/material/Grid";
import FormCard from "../FormCard/FormCard";
import { FormOverviewDto } from "@src/types/shared";
import { MAX_PINNED_FORMS } from "formula-gear";
import {
  PIN_BADGE_COLORS,
  PinnedRowContainer,
  PinnedRowHeader,
  PinnedRowTitleWrapper,
  PinnedRowTitle,
  PinnedRowCounter,
  PinBadgeBox,
  PlaceholderCard,
  PlaceholderHintWrapper,
  PlaceholderHintTitle,
  PlaceholderHintSubtitle,
} from "./PinnedFormsRow.styled";

const PLACEHOLDER_INDEXES = Array.from({ length: MAX_PINNED_FORMS });

interface PinnedFormsRowProps {
  pinnedForms: FormOverviewDto[];
  isSuperAdmin: boolean | null;
  navigate: any;
  resetSearchValue: () => void;
  myUpn?: string;
}

/** The rounded, tinted badge that wraps the pin icon in empty slots. */
const PinBadge = () => (
  <PinBadgeBox>
    <Pin size={20} color={PIN_BADGE_COLORS.icon} />
  </PinBadgeBox>
);

const PinnedPlaceholderCard = ({ showHint }: { showHint: boolean }) => (
  <PlaceholderCard $filled={showHint}>
    <PinBadge />
    {showHint && (
      <PlaceholderHintWrapper>
        <PlaceholderHintTitle>כאן יהיה טופס נעוץ</PlaceholderHintTitle>
        <PlaceholderHintSubtitle>
          כדי להצמיד טופס יש ללחוץ על כפתור הנעץ
        </PlaceholderHintSubtitle>
      </PlaceholderHintWrapper>
    )}
  </PlaceholderCard>
);

const PinnedFormsRow: React.FC<PinnedFormsRowProps> = ({
  pinnedForms,
  isSuperAdmin,
  navigate,
  resetSearchValue,
  myUpn,
}) => {
  const placeholdersCount = Math.max(MAX_PINNED_FORMS - pinnedForms.length, 0);

  return (
    <PinnedRowContainer>
      <PinnedRowHeader>
        <PinnedRowTitleWrapper>
          <Pin size={20} color="#020618" />
          <PinnedRowTitle>טפסים נעוצים</PinnedRowTitle>
        </PinnedRowTitleWrapper>
        <PinnedRowCounter>
          {pinnedForms.length}/{MAX_PINNED_FORMS}
        </PinnedRowCounter>
      </PinnedRowHeader>

      <Grid container columns={{ xs: 4, sm: 8, md: 12 }} spacing={3}>
        {pinnedForms.map((form) => (
          <Grid key={form.id} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
            <FormCard
              form={form}
              isSuperAdmin={isSuperAdmin}
              navigate={navigate}
              resetSearchValue={resetSearchValue}
              isCreator={form.createdBy?.upn?.toLowerCase() === myUpn?.toLowerCase()}
            />
          </Grid>
        ))}

        {PLACEHOLDER_INDEXES.slice(0, placeholdersCount).map((_, index) => (
          <Grid key={`pinned-placeholder-${index}`} size={{ xs: 4, sm: 4, md: 6, lg: 4, xl: 3 }}>
            <PinnedPlaceholderCard showHint={pinnedForms.length === 0 && index === 0} />
          </Grid>
        ))}
      </Grid>
    </PinnedRowContainer>
  );
};

export default PinnedFormsRow;
