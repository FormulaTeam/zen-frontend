import React from "react";
import {
  EmptyStateContainer,
  EmptyStateImage,
  EmptyStateTextContent,
  EmptyStateTitle,
  EmptyStateSubtitle,
  EmptyStateActions,
} from "../../pages/MainPage/styled";

interface EmptyStateProps {
  image?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/**
 * A reusable component for displaying an empty state with an image, title, and optional subtitle.
 * Designed to mirror the system's ErrorPage aesthetic hierarchy.
 *
 * @param {string} [image] - The source path for the illustration image.
 * @param {string} title - The primary message/title to display (matches ErrorPage primary label).
 * @param {string} [subtitle] - An optional secondary message (matches ErrorPage secondary label).
 * @param {React.ReactNode} [actions] - Optional action components (e.g., buttons) to display below the text.
 */
export function EmptyState({ image, title, subtitle, actions }: EmptyStateProps) {
  return (
    <EmptyStateContainer className="empty-state-container">
      {image && <EmptyStateImage src={image} className="empty-state-image" alt="Empty state" />}
      
      <EmptyStateTextContent className="empty-state-text">
        <EmptyStateTitle className="empty-state-title primary">{title}</EmptyStateTitle>
        {subtitle && (
          <EmptyStateSubtitle className="empty-state-subtitle secondary">
            {subtitle}
          </EmptyStateSubtitle>
        )}
      </EmptyStateTextContent>

      {actions && <EmptyStateActions className="empty-state-actions">{actions}</EmptyStateActions>}
    </EmptyStateContainer>
  );
}

export default EmptyState;
