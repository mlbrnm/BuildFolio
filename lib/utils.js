/**
 * Utility functions for the BuildFolio application
 */

// Format a date to a readable string
export function formatDate(date, format = "medium") {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;

  if (format === "short") {
    return d.toLocaleDateString();
  } else if (format === "medium") {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } else if (format === "long") {
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleDateString();
}

// Generate a random ID
export function generateId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

// Truncate text to a specified length
export function truncateText(text, maxLength = 100) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Debounce function to limit how often a function can be called
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Deep clone an object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Check if an object is empty
export function isEmpty(obj) {
  return (
    obj === null ||
    obj === undefined ||
    (typeof obj === "object" && Object.keys(obj).length === 0) ||
    (typeof obj === "string" && obj.trim().length === 0)
  );
}

// Calculate the next reminder date based on repeat settings
export function calculateNextReminderDate(reminder) {
  if (!reminder || !reminder.nextDate || reminder.repeat === "none") {
    return reminder?.nextDate;
  }

  const currentDate = new Date(reminder.nextDate);
  let newDate = new Date(currentDate);

  switch (reminder.repeat) {
    case "daily":
      newDate.setDate(currentDate.getDate() + 1);
      break;
    case "weekly":
      newDate.setDate(currentDate.getDate() + 7);
      break;
    case "monthly":
      newDate.setMonth(currentDate.getMonth() + 1);
      break;
    case "yearly":
      newDate.setFullYear(currentDate.getFullYear() + 1);
      break;
    case "custom":
      if (reminder.interval && reminder.unit) {
        switch (reminder.unit) {
          case "days":
            newDate.setDate(currentDate.getDate() + reminder.interval);
            break;
          case "weeks":
            newDate.setDate(currentDate.getDate() + reminder.interval * 7);
            break;
          case "months":
            newDate.setMonth(currentDate.getMonth() + reminder.interval);
            break;
          case "years":
            newDate.setFullYear(currentDate.getFullYear() + reminder.interval);
            break;
          default:
            break;
        }
      }
      break;
    default:
      break;
  }

  return newDate.toISOString().split("T")[0];
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Get file extension
export function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

// Check if a file is an image
export function isImageFile(filename) {
  const ext = getFileExtension(filename).toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
}

// Resize an image file to create a thumbnail
export async function resizeImage(
  file,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.4
) {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the file
    const reader = new FileReader();

    reader.onload = function (event) {
      // Create an image element
      const img = new Image();

      img.onload = function () {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create a canvas and resize the image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas to a blob
        canvas.toBlob(
          (blob) => {
            // Create a new File object from the blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified,
            });

            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = function () {
        reject(new Error("Failed to load image"));
      };

      // Set the source of the image to the file data
      img.src = event.target.result;
    };

    reader.onerror = function () {
      reject(new Error("Failed to read file"));
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
}
