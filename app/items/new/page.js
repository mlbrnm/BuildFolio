"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItemTypes, createItem } from "@/lib/db";
import { generateEmptyData } from "@/lib/schema-utils";
import Link from "next/link";
import DynamicForm from "@/components/dynamic-form";

export default function NewItemPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchItemTypes() {
      try {
        setLoading(true);
        const itemTypesData = await getItemTypes();
        setItemTypes(itemTypesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching item types:", error);
        setError("Failed to load item types");
        setLoading(false);
      }
    }

    fetchItemTypes();
  }, [user, router]);

  useEffect(() => {
    if (selectedTypeId) {
      const type = itemTypes.find((t) => t.id === selectedTypeId);
      setSelectedType(type);
      if (type) {
        setFormData(generateEmptyData(type));
      }
    } else {
      setSelectedType(null);
      setFormData({ name: "" });
    }
  }, [selectedTypeId, itemTypes]);

  const handleTypeChange = (e) => {
    setSelectedTypeId(e.target.value);
  };

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTypeId) {
      setError("Please select an item type");
      return;
    }

    if (!formData.name.trim()) {
      setError("Item name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const itemData = {
        ...formData,
        typeId: selectedTypeId,
        userId: user.uid,
      };

      const docRef = await createItem(itemData);
      router.push(`/items/${docRef.id}`);
    } catch (error) {
      console.error("Error creating item:", error);
      setError("Failed to create item");
      setSaving(false);
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Item</h1>
        <Link href="/" className="px-4 py-2 border border-border rounded-md">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : itemTypes.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">No item types available</h2>
          <p className="text-muted-foreground mb-4">
            You need to create at least one item type before you can create
            items.
          </p>
          <Link
            href="/item-types/new"
            className="text-primary hover:underline flex items-center gap-1 mx-auto w-fit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Create Item Type
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="itemType"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Item Type
                </label>
                <select
                  id="itemType"
                  value={selectedTypeId}
                  onChange={handleTypeChange}
                  className="w-full p-2 bg-background border border-border rounded-md"
                  required
                >
                  <option value="">Select an item type</option>
                  {itemTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedType && (
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-2 bg-background border border-border rounded-md"
                    placeholder="Enter a name for this item"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {selectedType && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Item Details</h2>
              <DynamicForm
                schema={selectedType}
                data={formData}
                onChange={handleFormChange}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Link
              href="/"
              className="px-4 py-2 border border-border rounded-md"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !selectedTypeId}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground"></div>
                  Creating...
                </>
              ) : (
                "Create Item"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
