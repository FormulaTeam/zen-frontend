import React, { useState } from "react";
import {
  Box,
  IconButton,
  Portal,
  Snackbar,
  ThemeProvider,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { ArrowBack, ArrowBackIos, ArrowForward, ArrowForwardIos, Link } from "@mui/icons-material";
import { FileIcon, defaultStyles } from "react-file-icon";
import classes from "./CustomCarousel.module.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { decodeFileName, showSuccessNotification } from "../../utils/utils";

// 📦 Carousel Component
const CustomCarousel = ({ items, onItemClickHandler, formId, shouldSpaceFiles = false }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);

  // Handle Next Button
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  // Handle Previous Button
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split(".").pop(); // Get the part after the last dot
  };

  function ArrowNext(props) {
    const { className, style, onClick } = props;
    return (
      <ArrowBack
        className={className}
        sx={{
          ...style,
          display: "block",
          color: theme.palette.primary.dark,
          "&:hover": {
            color: theme.palette.primary.dark,
          },
          "&.slick-disabled": {
            color: theme.palette.primary.main,
          },
          fontSize: 20,
        }}
        onClick={onClick}
      />
    );
  }

  function ArrowPrev(props) {
    const { className, style, onClick } = props;
    return (
      <ArrowForward
        className={className}
        sx={{
          display: "block",
          color: theme.palette.primary.dark,
          "&:hover": {
            color: theme.palette.primary.dark,
          },
          "&.slick-disabled": {
            color: theme.palette.primary.main,
          },
          fontSize: 20,
        }}
        onClick={onClick}
      />
    );
  }

  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 2,
    nextArrow: <ArrowNext />,
    prevArrow: <ArrowPrev />,
  };

  return (
    <div
      className={classes.carouselWrapper}
      dir="ltr"
      style={{ ...(shouldSpaceFiles && items.length > 1 ? { marginTop: "30px" } : {}) }}>
      {items.length > 1 ? (
        <Slider {...settings}>
          {items.map((value, index) => {
            let extension = getFileExtension(value.name);
            const downloadPath = `${location.host}/download/${formId}/${value.name}`;
            return (
              <div key={index} dir="ltr">
                <Tooltip
                  arrow
                  title={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        textOverflow: "ellipsis",
                        overflowWrap: "anywhere",
                        gap: 1,
                      }}>
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(downloadPath);
                          setOpen(true);
                        }}
                        sx={{ color: theme.palette.white }}
                        size="small">
                        <Link />
                      </IconButton>
                      {downloadPath}
                    </Box>
                  }>
                  <div
                    style={{
                      width: "35px",
                      justifySelf: "center",
                      cursor: "pointer",
                      ...(shouldSpaceFiles ? { margin: "0 10px" } : {}),
                    }}
                    onClick={() => onItemClickHandler(value)}>
                    <FileIcon extension={extension} {...(defaultStyles[extension] || {})} />
                  </div>
                </Tooltip>
              </div>
            );
          })}
        </Slider>
      ) : (
        <Tooltip
          title={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                textOverflow: "ellipsis",
                overflowWrap: "anywhere",
                gap: 1,
              }}>
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${location.host}/download/${formId}/${items[0]?.url.split("/").pop()}`,
                  );
                  setOpen(true);
                }}
                sx={{ color: theme.palette.white }}
                size="small">
                <Link />
              </IconButton>
              {`${location.host}/download/${formId}/${items[0]?.name}`}
            </Box>
          }>
          <div
            style={{ width: "35px", justifySelf: "center", cursor: "pointer" }}
            onClick={() => onItemClickHandler(items[0])}>
            <FileIcon
              extension={getFileExtension(items[0].name)}
              {...(defaultStyles[getFileExtension(items[0].name)] || {})}
            />
          </div>
        </Tooltip>
      )}
      <Portal>
        <Snackbar
          open={open}
          autoHideDuration={1000}
          onClose={() => setOpen(false)}
          message="הקישור הועתק בהצלחה"
        />
      </Portal>
    </div>
  );
};

export default CustomCarousel;
