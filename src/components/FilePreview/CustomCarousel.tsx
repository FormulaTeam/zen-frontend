import React, { useMemo, useState } from "react";
import { Box, IconButton, Portal, Snackbar, Tooltip, useTheme } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos, Link } from "@mui/icons-material";
import { FileIcon, defaultStyles } from "react-file-icon";
import { decodeFileName } from "../../utils/utils";

type StoredFile = {
  id?: string;
  responseId?: string;
  name: string;
  path: string;
  fileName?: string;
};

type LocalDisplayFile = {
  name: string;
  file: File;
};

type CarouselFile = StoredFile | LocalDisplayFile;

interface CustomCarouselProps {
  items: CarouselFile[];
  onItemClickHandler: (file: CarouselFile) => void;
  formId?: string | number;
  responseId?: string | number;
  shouldSpaceFiles?: boolean;
}

const FILES_PER_PAGE = 2;

const isLocalDisplayFile = (file: CarouselFile): file is LocalDisplayFile => {
  return "file" in file;
};

const getDisplayFileName = (file: CarouselFile): string => {
  return decodeFileName(isLocalDisplayFile(file) ? file.file.name : file.name);
};

const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop() || "";
};

const chunkFiles = (items: CarouselFile[]): CarouselFile[][] => {
  const pages: CarouselFile[][] = [];

  for (let index = 0; index < items.length; index += FILES_PER_PAGE) {
    pages.push(items.slice(index, index + FILES_PER_PAGE));
  }

  return pages;
};

const CustomCarousel: React.FC<CustomCarouselProps> = ({
  items,
  onItemClickHandler,
  formId,
  responseId,
  shouldSpaceFiles = false,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const pages = useMemo(() => chunkFiles(items ?? []), [items]);
  const currentPage = pages[pageIndex] ?? [];
  const hasMultiplePages = pages.length > 1;

  if (!items || items.length === 0) {
    return null;
  }

  const getDownloadPath = (file: CarouselFile): string => {
    const fileName = getDisplayFileName(file);

    if (isLocalDisplayFile(file)) {
      return "";
    }
    
    const resolvedResponseId = responseId ?? file.responseId;

    return `${window.location.origin}/download/${formId}/${resolvedResponseId}/${file.id ?? file.path}/${encodeURIComponent(fileName)}`;
  };

  const handleCopyLink = async (
    event: React.MouseEvent<HTMLButtonElement>,
    downloadPath: string,
  ) => {
    event.stopPropagation();

    await navigator.clipboard.writeText(downloadPath);
    setOpen(true);
  };

  const goPrevious = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPageIndex((current) => Math.max(current - 1, 0));
  };

  const goNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setPageIndex((current) => Math.min(current + 1, pages.length - 1));
  };

  const renderFileIcon = (item: CarouselFile, index: number) => {
    const fileName = getDisplayFileName(item);
    const extension = getFileExtension(fileName);
    const downloadPath = getDownloadPath(item);

    return (
      <Tooltip
        key={`${fileName}-${index}`}
        arrow
        placement="top"
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              overflowWrap: "anywhere",
              gap: 1,
              maxWidth: 320,
            }}>
            <IconButton
              onClick={(event) => handleCopyLink(event, downloadPath)}
              sx={{ color: theme.palette.white }}
              size="small">
              <Link sx={{ fontSize: 17 }} />
            </IconButton>

            {downloadPath}
          </Box>
        }>
        <Box
          onClick={() => onItemClickHandler(item)}
          sx={{
            width: 34,
            height: 38,
            cursor: "pointer",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            transition: "background-color 0.15s ease, transform 0.15s ease",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
              transform: "translateY(-1px)",
            },
          }}>
          <Box
            sx={{
              width: 25,
              height: 31,
              overflow: "hidden",
              direction: "ltr",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
            <FileIcon extension={extension} {...(defaultStyles[extension] || {})} />
          </Box>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box
      dir="ltr"
      sx={{
        width: 150,
        height: 40,
        mx: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...(shouldSpaceFiles && items.length > 1 ? { mt: 0 } : {}),
      }}>
      <Box
        sx={{
          width: "100%",
          height: 40,
          display: "grid",
          gridTemplateColumns: hasMultiplePages ? "18px 1fr 18px" : "1fr",
          alignItems: "center",
          columnGap: "2px",
          overflow: "hidden",
        }}>
        {hasMultiplePages && (
          <IconButton
            size="small"
            onClick={goPrevious}
            disabled={pageIndex === 0}
            sx={{
              width: 18,
              height: 18,
              p: 0,
              color: theme.palette.primary.main,
              backgroundColor: "transparent",
              opacity: pageIndex === 0 ? 0.25 : 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.dark,
              },
            }}>
            <ArrowBackIosNew sx={{ fontSize: 12 }} />
          </IconButton>
        )}

        <Box
          sx={{
            minWidth: 0,
            height: 40,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            overflow: "hidden",
          }}>
          {currentPage.map(renderFileIcon)}
        </Box>

        {hasMultiplePages && (
          <IconButton
            size="small"
            onClick={goNext}
            disabled={pageIndex === pages.length - 1}
            sx={{
              width: 18,
              height: 18,
              p: 0,
              color: theme.palette.primary.main,
              backgroundColor: "transparent",
              opacity: pageIndex === pages.length - 1 ? 0.25 : 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.primary.dark,
              },
            }}>
            <ArrowForwardIos sx={{ fontSize: 12 }} />
          </IconButton>
        )}
      </Box>

      <Portal>
        <Snackbar
          open={open}
          autoHideDuration={1000}
          onClose={() => setOpen(false)}
          message="הקישור הועתק בהצלחה"
        />
      </Portal>
    </Box>
  );
};

export default CustomCarousel;
