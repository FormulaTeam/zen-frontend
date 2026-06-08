import { useCallback, useEffect, useMemo, useState } from "react";
import { downloadFileFromResponse, type StoredFile } from "../../api/filesApi";
import { useParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FileIcon, defaultStyles } from "react-file-icon";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import errorImage from "../../images/cloud_error.png";
import { decodeFileName } from "../../utils/utils";

export function DownloadPage() {
  const [waitingForDownload, setWaitingForDownload] = useState(true);
  const [error, setError] = useState(false);
  const { fileName, formId, responseId, fileId } = useParams();

  const theme = useTheme();

  const storedFile = useMemo<StoredFile | null>(() => {
    if (!fileName) return null;

    return {
      id: fileId,
      responseId,
      name: fileName,
      path: fileId ?? fileName,
    };
  }, [fileId, fileName, responseId]);

  const handleDownload = useCallback(() => {
    if (!storedFile || !formId) return;

    setError(false);
    setWaitingForDownload(true);

    downloadFileFromResponse(storedFile, formId)
      .catch((error) => {
        console.error("Error downloading file:", error);
        setError(true);
      })
      .finally(() => {
        setWaitingForDownload(false);
      });
  }, [storedFile, formId]);

  useEffect(() => {
    handleDownload();
  }, [handleDownload]);

  const decodedFileName = fileName ? decodeFileName(fileName) : "";
  const fileExtension = decodedFileName.split(".").pop() || "";

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        gap: 1,
      }}>
      {error ? (
        <>
          <img style={{ width: 60 }} src={errorImage} alt="download error" />

          <Typography className="download-text" variant="h4">
            שגיאה בהורדה
          </Typography>

          <Typography color={theme.palette.text.secondary} className="download-text" variant="h6">
            הקובץ לא קיים או שהטופס אינו שותף איתך
          </Typography>
        </>
      ) : (
        <>
          {waitingForDownload && (
            <Typography className="download-text" variant="h4">
              מוריד את הקובץ...
            </Typography>
          )}

          {!waitingForDownload && (
            <>
              <Box justifyItems="center">
                <Box width={120}>
                  <FileIcon extension={fileExtension} {...(defaultStyles[fileExtension] || {})} />
                </Box>

                {fileName && <Typography variant="subtitle1">{decodedFileName}</Typography>}
              </Box>

              <Typography className="download-text" variant="h4">
                מוריד את הקובץ...
              </Typography>

              <Button onClick={handleDownload} variant="text">
                במידה וההורדה לא התחילה, לחץ כאן
              </Button>
            </>
          )}
        </>
      )}
    </Container>
  );
}
