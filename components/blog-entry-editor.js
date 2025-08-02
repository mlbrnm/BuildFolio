"use client";

import { useState, useRef } from "react";
import MarkdownEditor from "./markdown-editor";
import { uploadImage } from "@/lib/db";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export default function BlogEntryEditor({ id, value, onChange, itemId }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const path = `logEntries/${itemId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Insert markdown image syntax at the cursor position or at the end
      const imageMarkdown = `![${file.name}](${url})`;
      const newContent = value ? `${value}\n\n${imageMarkdown}` : imageMarkdown;

      if (onChange) {
        onChange(newContent);
      }

      // Reset file input
      e.target.value = "";
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleImageUpload}
          disabled={uploading}
          className="text-sm text-primary hover:text-primary/80 flex items-center cursor-pointer"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary mr-1"></div>
              Uploading Image...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
              Upload Image
            </>
          )}
        </button>
      </div>

      <MarkdownEditor id={id} value={value} onChange={onChange} />

      {/* Hidden file input for image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
