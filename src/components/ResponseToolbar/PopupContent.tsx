import { TextField } from "@mui/material";
import React from "react";
import styled from "styled-components";

const PopupWrapper = styled("div")`
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 400px;
  width: 500px;
  direction: ltr;
`;

const Section = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FieldGroup = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled("label")`
  font-weight: 500;
`;

interface PopupContentProps {
  sourceKey: string;
  setSourceKey: (value: string) => void;
  appKey: string;
  setAppKey: (value: string) => void;
  clusterURL: string;
  setClusterURL: (value: string) => void;
}

const PopupContent: React.FC<PopupContentProps> = ({
  sourceKey,
  setSourceKey,
  appKey,
  setAppKey,
  clusterURL,
  setClusterURL,
}) => {
  return (
    <PopupWrapper>
      <Section>
        <FieldGroup>
          <Label>SourceKey:</Label>
          <TextField
            fullWidth
            size="small"
            value={sourceKey}
            onChange={(e) => setSourceKey(e.target.value)}
            placeholder="הזינו SourceKey"
            InputProps={{
              sx: { direction: "ltr" },
            }}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>AppKey:</Label>
          <TextField
            fullWidth
            size="small"
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            placeholder="הזינו AppKey"
            InputProps={{
              sx: { direction: "ltr" },
            }}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>ClusterURL:</Label>
          <TextField
            fullWidth
            size="small"
            value={clusterURL}
            onChange={(e) => setClusterURL(e.target.value)}
            placeholder="הזינו ClusterURL"
            InputProps={{
              sx: { direction: "ltr" },
            }}
          />
        </FieldGroup>

        <FieldGroup>
          <Label>NifiPort:</Label>
          <TextField
            fullWidth
            size="small"
            placeholder="הזינו NifiPort"
            InputProps={{
              sx: { direction: "ltr" },
            }}
          />
        </FieldGroup>
      </Section>
    </PopupWrapper>
  );
};

export default PopupContent;
