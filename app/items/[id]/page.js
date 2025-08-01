"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItem, getItemType, updateItem, deleteItem } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import DynamicForm from "@/components/dynamic-form";
import ImageGallery from "@/components/image-gallery";

export default function ItemDetailPage({ params }) {
  const { id } = React.use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [item, setItem] = useState(null);
  const [itemType, setItemType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const itemData = await getItem(id);

        if (!itemData) {
          setError("Item not found");
          setLoading(false);
          return;
        }

        if (itemData.userId !== user.uid) {
          setError("You don't have permission to view this item");
          setLoading(false);
          return;
        }

        setItem(itemData);

        const itemTypeData = await getItemType(itemData.typeId);
        if (!itemTypeData) {
          setError("Item type not found");
        } else {
          setItemType(itemTypeData);
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        setError("Failed to load item");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, user, router]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleFormChange = (data) => {
    setItem({ ...item, ...data });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      await updateItem(id, item);
      setEditing(false);
    } catch (error) {
      console.error("Error updating item:", error);
      setError("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteItem(id);
      router.push("/");
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item");
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-md">
        <h1 className="text-xl font-bold mb-2">Error</h1>
        <p>{error}</p>
        <Link
          href="/"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!item || !itemType) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-bold mb-2">Item Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The item you're looking for doesn't exist or has been deleted.
        </p>
        <Link href="/" className="text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground flex items-center mb-2"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{item.name}</h1>
          <p className="text-muted-foreground">{itemType.name}</p>
        </div>
        <div className="flex space-x-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="text-destructive hover:text-destructive/80 px-4 py-2 border border-border rounded-md"
              >
                Delete
              </button>
              <button
                onClick={handleEdit}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {editing ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Images - Left Column */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Images</h2>
                  <ImageGallery
                    images={item.images || []}
                    itemId={id}
                    onChange={(images) => setItem({ ...item, images })}
                  />
                </div>
              </div>
            </div>

            {/* Details - Right Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-6">Edit Item</h2>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Item Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={item.name}
                      onChange={(e) =>
                        setItem({ ...item, name: e.target.value })
                      }
                      className="w-full p-2 bg-background border border-border rounded-md"
                      required
                    />
                  </div>

                  <DynamicForm
                    schema={itemType}
                    data={item}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Images - Left Column */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-6">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Images</h2>
                  <ImageGallery
                    images={item.images || []}
                    itemId={id}
                    readOnly={true}
                  />
                </div>
              </div>
            </div>

            {/* Details - Right Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Basic Info */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Details</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {itemType.fields.map((field) => {
                      const value = item[field.id];

                      if (
                        value === undefined ||
                        value === null ||
                        value === ""
                      ) {
                        return null;
                      }

                      return (
                        <div key={field.id}>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            {field.name}
                          </h3>
                          <div className="text-foreground">
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: renderMarkdown(value),
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Nested Fields */}
              {itemType.nestedFields?.map((nestedField) => {
                const nestedItems = item[nestedField.id] || [];

                if (nestedItems.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={nestedField.id}
                    className="bg-card border border-border rounded-lg overflow-hidden"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">
                        {nestedField.name}
                      </h2>
                      <div className="space-y-6">
                        {nestedItems.map((nestedItem, index) => (
                          <div
                            key={index}
                            className="border border-border rounded-lg p-4"
                          >
                            <h3 className="font-medium mb-3">
                              {nestedField.name} #{index + 1}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {nestedField.fields.map((field) => {
                                const value = nestedItem[field.id];

                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                ) {
                                  return null;
                                }

                                return (
                                  <div key={field.id}>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                      {field.name}
                                    </h4>
                                    <div className="text-foreground">
                                      <div
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                          __html: renderMarkdown(value),
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
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
  html = html.replace(/^\s*\n\d\./gim, "<ol>\n1.");
  html = html.replace(/^(\d\..+)\s*\n([^\d\.])/gim, "$1\n</ol>\n\n$2");
  html = html.replace(/^\d\.(.+)/gim, "<li>$1</li>");

  // Paragraphs
  html = html.replace(/^\s*\n\s*\n/gim, "</p>\n<p>");

  // Images
  html = html.replace(
    /!\[([^\]]+)\]\(([^)]+)\)/gim,
    '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-2" />'
  );

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
