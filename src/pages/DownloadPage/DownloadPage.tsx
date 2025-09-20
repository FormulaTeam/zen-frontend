import { useEffect, useState } from "react";
import { downloadFileFromResponse } from "../../api/filesApi";
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
  const { fileName, formId } = useParams();

  const theme = useTheme();
  useEffect(() => {
    if (fileName && formId) {
      console.log(fileName);

      downloadFileFromResponse({ name: fileName }, formId)
        .catch((error) => {
          console.error("Error downloading file:", error);
          setError(true);
        })
        .finally(() => {
          setWaitingForDownload(false);
        });
    }
  }, [fileName, formId]);

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
          <img style={{ width: 60 }} src={errorImage}></img>
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
              <Box justifyItems={"center"}>
                <Box width={120}>
                  <FileIcon
                    extension={fileName?.split(".").pop()}
                    {...(defaultStyles[fileName?.split(".").pop()] || {})}
                  />
                </Box>
                {fileName && (
                  <Typography variant="subtitle1">{decodeFileName(fileName)}</Typography>
                )}
              </Box>
              <Typography className="download-text" variant="h4">
                מוריד את הקובץ...
              </Typography>
              <Button
                onClick={() => downloadFileFromResponse({ name: fileName }, formId)}
                variant="text">
                במידה וההורדה לא התחילה, לחץ כאן
              </Button>
            </>
          )}
        </>
      )}
    </Container>
  );
}
