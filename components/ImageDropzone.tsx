// components/ImageDropzone.js
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";

const ImageDropzones = ({ onDropImage }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Convert file to preview URL
    const fileWithPreview = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    onDropImage(fileWithPreview);
  }, [onDropImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    multiple: true,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed #ccc",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        backgroundColor: isDragActive ? "#f0f0f0" : "white",
      }}>
      <input {...getInputProps()} />
      <Typography suppressHydrationWarning  variant="body1">
        {isDragActive
          ? "Thả ảnh vào đây..."
          : "Kéo và thả ảnh vào đây hoặc click để chọn ảnh"}
      </Typography>
    </Box>
  );
};

export default ImageDropzones;
