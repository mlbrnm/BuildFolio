"use client";

import { useState, useRef, useEffect } from "react";
import { uploadImage } from "@/lib/db";

export default function ImageGallery({
  images = [],
  itemId,
  onChange,
  readOnly = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeImage, setActiveImage] = useState(null);
  const [loadingHighRes, setLoadingHighRes] = useState(false);
  const [highResLoaded, setHighResLoaded] = useState({});

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const newImages = [...images];

      for (const file of files) {
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          setError("Only image files are allowed");
          continue;
        }

        // Upload the image to Firebase Storage
        const path = `items/${itemId}/images/${Date.now()}_${file.name}`;
        const imageData = await uploadImage(file, path);

        // Add the image to the array with a caption
        newImages.push({
          ...imageData,
          caption: "",
          isThumbnail: newImages.length === 0, // First image is thumbnail by default
        });
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Update the parent component
      if (onChange) {
        onChange(newImages);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionChange = (index, caption) => {
    const newImages = [...images];
    newImages[index].caption = caption;

    if (onChange) {
      onChange(newImages);
    }
  };

  const handleSetThumbnail = (index) => {
    const newImages = [...images];

    // Remove thumbnail flag from all images
    newImages.forEach((img) => (img.isThumbnail = false));

    // Set the selected image as thumbnail
    newImages[index].isThumbnail = true;

    if (onChange) {
      onChange(newImages);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const removedImage = newImages.splice(index, 1)[0];

    // If the removed image was the thumbnail, set the first image as thumbnail
    if (removedImage.isThumbnail && newImages.length > 0) {
      newImages[0].isThumbnail = true;
    }

    if (onChange) {
      onChange(newImages);
    }

    // Close the modal if the active image is removed
    if (activeImage === index) {
      setActiveImage(null);
    }

    // Update selected image index if needed
    if (selectedImageIndex >= newImages.length) {
      setSelectedImageIndex(Math.max(0, newImages.length - 1));
    } else if (index < selectedImageIndex) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // Navigate to the next image
  const goToNextImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Navigate to the previous image
  const goToPrevImage = () => {
    if (images.length > 0) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    }
  };

  // Set initial selected image when images change
  useEffect(() => {
    if (images.length > 0 && selectedImageIndex >= images.length) {
      setSelectedImageIndex(0);
    }
  }, [images, selectedImageIndex]);

  // Handle high-resolution image loading when modal is opened
  useEffect(() => {
    if (activeImage !== null && !highResLoaded[activeImage]) {
      setLoadingHighRes(true);
    }
  }, [activeImage, highResLoaded]);

  return (
    <div className="space-y-4">
      {!readOnly && (
        <>
          <div className="flex items-center gap-4">
            <label
              htmlFor="image-upload"
              className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md inline-flex items-center"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Images
                </>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
                ref={fileInputRef}
              />
            </label>
            <p className="text-sm text-muted-foreground">
              Upload images for this item
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </>
      )}

      {/* Image Gallery */}
      {images.length > 0 ? (
        <div className="space-y-6">
          {/* Main Image Display with Navigation */}
          <div className="bg-card overflow-hidden">
            <div className="relative">
              <div className="p-6 flex justify-center items-center min-h-[300px]">
                <img
                  src={
                    images[selectedImageIndex]?.thumbnailUrl ||
                    images[selectedImageIndex]?.url
                  }
                  alt={
                    images[selectedImageIndex]?.caption ||
                    `Image ${selectedImageIndex + 1}`
                  }
                  className="max-h-90 object-contain cursor-pointer rounded-md"
                  onClick={() => setActiveImage(selectedImageIndex)}
                />
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {!readOnly && images[selectedImageIndex]?.caption && (
              <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
                {images[selectedImageIndex].caption}
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          <div>
            <h3 className="font-medium mb-3">All Images</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`border rounded-md overflow-hidden ${
                    index === selectedImageIndex
                      ? "border-primary border-2"
                      : "border-border"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.thumbnailUrl || image.url}
                      alt={image.caption || `Image ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                      onClick={() => setActiveImage(index)}
                    />
                  </div>
                  {!readOnly && (
                    <div className="p-2 flex justify-end items-center bg-card">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="text-destructive hover:text-destructive/80 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-border rounded-lg">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground">No images added yet</p>
        </div>
      )}

      {/* Image Modal */}
      {activeImage !== null && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking outside the modal content
            if (e.target === e.currentTarget) {
              setActiveImage(null);
            }
          }}
        >
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-medium">
                Image {activeImage + 1} of {images.length}
              </h3>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative">
              {loadingHighRes && !highResLoaded[activeImage] && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              )}
              <img
                src={images[activeImage].url}
                alt={images[activeImage].caption || `Image ${activeImage + 1}`}
                className="max-h-full max-w-full object-contain"
                onLoad={() => {
                  setLoadingHighRes(false);
                  setHighResLoaded((prev) => ({
                    ...prev,
                    [activeImage]: true,
                  }));
                }}
              />
            </div>
            {!readOnly && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="image-caption"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Caption
                    </label>
                    <input
                      type="text"
                      id="image-caption"
                      value={images[activeImage].caption || ""}
                      onChange={(e) =>
                        handleCaptionChange(activeImage, e.target.value)
                      }
                      className="w-full p-2 bg-background border border-border rounded-md"
                      placeholder="Add a caption for this image"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetThumbnail(activeImage)}
                      className={`px-3 py-2 rounded-md ${
                        images[activeImage].isThumbnail
                          ? "bg-primary/10 text-primary"
                          : "bg-background border border-border hover:bg-muted"
                      }`}
                      disabled={images[activeImage].isThumbnail}
                    >
                      {images[activeImage].isThumbnail
                        ? "Current Thumbnail"
                        : "Set as Thumbnail"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(activeImage)}
                      className="bg-destructive/10 text-destructive px-3 py-2 rounded-md hover:bg-destructive/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
