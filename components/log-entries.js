"use client";

import React, { useState, useEffect } from "react";
import {
  getLogEntries,
  createLogEntry,
  updateLogEntry,
  deleteLogEntry,
  uploadImage,
} from "@/lib/db";
import BlogEntryEditor from "./blog-entry-editor";
import { formatDate } from "@/lib/utils";

export default function LogEntries({ itemId, userId }) {
  const [logEntries, setLogEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD for date input
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLogEntries();
  }, [itemId]);

  async function fetchLogEntries() {
    try {
      setLoading(true);
      const entries = await getLogEntries(itemId);
      setLogEntries(entries);
    } catch (err) {
      console.error("Error fetching log entries:", err);
      setError("Failed to load log entries");
    } finally {
      setLoading(false);
    }
  }

  const handleCreateEntry = async (e) => {
    e.preventDefault();

    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      return;
    }

    try {
      setSaving(true);

      // Create date in local timezone by parsing year, month, day separately
      const [year, month, day] = newEntry.date.split("-");
      await createLogEntry({
        itemId,
        userId,
        title: newEntry.title,
        content: newEntry.content,
        date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)), // month is 0-indexed in JS
      });

      setNewEntry({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsCreating(false);
      await fetchLogEntries();
    } catch (err) {
      console.error("Error creating log entry:", err);
      setError("Failed to create log entry");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEntry = async (e) => {
    e.preventDefault();

    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      return;
    }

    try {
      setSaving(true);

      // Create date in local timezone by parsing year, month, day separately
      const [year, month, day] = newEntry.date.split("-");
      await updateLogEntry(isEditing, {
        title: newEntry.title,
        content: newEntry.content,
        date: new Date(parseInt(year), parseInt(month) - 1, parseInt(day)), // month is 0-indexed in JS
      });

      setNewEntry({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsEditing(null);
      await fetchLogEntries();
    } catch (err) {
      console.error("Error updating log entry:", err);
      setError("Failed to update log entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (
      !confirm(
        "Are you sure you want to delete this entry? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteLogEntry(entryId);
      await fetchLogEntries();
    } catch (err) {
      console.error("Error deleting log entry:", err);
      setError("Failed to delete log entry");
    }
  };

  const handleEditEntry = (entry) => {
    // Format the date for the date input
    let formattedDate;
    if (entry.date instanceof Date) {
      formattedDate = entry.date.toISOString().split("T")[0];
    } else if (entry.date && typeof entry.date.toDate === "function") {
      // Handle Firestore Timestamp
      formattedDate = entry.date.toDate().toISOString().split("T")[0];
    } else if (typeof entry.date === "string") {
      formattedDate = entry.date;
    } else {
      formattedDate = new Date().toISOString().split("T")[0];
    }

    setNewEntry({
      title: entry.title,
      content: entry.content,
      date: formattedDate,
    });
    setIsEditing(entry.id);
  };

  const handleImageUpload = async (file) => {
    try {
      const path = `logEntries/${itemId}/${Date.now()}_${file.name}`;
      const imageData = await uploadImage(file, path);
      return imageData.url;
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notes & Updates</h2>
        {!isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer"
          >
            Add New Entry
          </button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {(isCreating || isEditing) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">
            {isEditing ? "Edit Entry" : "New Entry"}
          </h3>
          <form
            onSubmit={isEditing ? handleUpdateEntry : handleCreateEntry}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, title: e.target.value })
                }
                className="w-full p-2 bg-background border border-border rounded-md"
                required
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                value={newEntry.date}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, date: e.target.value })
                }
                className="w-full p-2 bg-background border border-border rounded-md"
                required
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Content
              </label>
              <BlogEntryEditor
                id="content"
                itemId={itemId}
                value={newEntry.content}
                onChange={(value) =>
                  setNewEntry({ ...newEntry, content: value })
                }
              />
              <p className="text-xs text-muted-foreground mt-2">
                Tip: You can embed images by using the markdown syntax: ![alt
                text](image_url)
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(null);
                  setNewEntry({
                    title: "",
                    content: "",
                    date: new Date().toISOString().split("T")[0],
                  });
                }}
                className="px-4 py-2 border border-border rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {logEntries.length === 0 && !isCreating && !isEditing ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">
            No entries yet. Add your first note or update!
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md cursor-pointer"
          >
            Add Entry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {logEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-card border border-border rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="text-primary hover:text-primary/80 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-destructive hover:text-destructive/80 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(entry.content),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper function to render markdown
function renderMarkdown(text) {
  if (!text) return "";

  // Convert markdown to HTML (basic implementation)
  // Headers
  let html = text
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>");

  // Images
  html = html.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/gim,
    '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-2" />'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
  );

  // Lists
  html = html.replace(/^\s*\n\*/gim, "<ul>\n*");
  html = html.replace(/^(\*.+)\s*\n([^\*])/gim, "$1\n</ul>\n\n$2");
  html = html.replace(/^\*(.+)/gim, "<li>$1</li>");

  // Numbered lists
  html = html.replace(/^\s*\n\d\.\s/gim, "<ol>\n1. ");
  html = html.replace(/^(\d\.\s.+)\s*\n([^\d\.])/gim, "$1\n</ol>\n\n$2");
  html = html.replace(/^\d\.\s(.+)/gim, "<li>$1</li>");

  // Paragraphs
  html = html.replace(/^\s*\n\s*\n/gim, "</p>\n<p>");

  // Code blocks
  html = html.replace(
    /```([\s\S]*?)```/gim,
    '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-2"><code>$1</code></pre>'
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/gim,
    '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
  );

  // Line breaks
  html = html.replace(/\n/gim, "<br />");

  return html;
}
