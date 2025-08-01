"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItemType, createItemType, updateItemType } from "@/lib/db";
import {
  createEmptyField,
  createEmptyNestedField,
  createEmptyItemType,
  validateItemType,
  DEFAULT_FIELD_TYPES,
} from "@/lib/schema-utils";
import Link from "next/link";

export default function ItemTypeDetailPage({ params }) {
  const { id } = React.use(params);
  const isNew = id === "new";
  const { user } = useAuth();
  const router = useRouter();

  const [itemType, setItemType] = useState(createEmptyItemType());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!isNew) {
      async function fetchItemType() {
        try {
          setLoading(true);
          const data = await getItemType(id);
          if (!data) {
            setError("Item type not found");
          } else {
            setItemType(data);
          }
        } catch (error) {
          console.error("Error fetching item type:", error);
          setError("Failed to load item type");
        } finally {
          setLoading(false);
        }
      }

      fetchItemType();
    }
  }, [id, isNew, user, router]);

  const handleNameChange = (e) => {
    setItemType({ ...itemType, name: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setItemType({ ...itemType, description: e.target.value });
  };

  const handleFieldChange = (index, field) => {
    const newFields = [...itemType.fields];
    newFields[index] = field;
    setItemType({ ...itemType, fields: newFields });
  };

  const handleAddField = () => {
    setItemType({
      ...itemType,
      fields: [...itemType.fields, createEmptyField()],
    });
  };

  const handleRemoveField = (index) => {
    const newFields = [...itemType.fields];
    newFields.splice(index, 1);
    setItemType({ ...itemType, fields: newFields });
  };

  const handleNestedFieldChange = (index, nestedField) => {
    const newNestedFields = [...(itemType.nestedFields || [])];
    newNestedFields[index] = nestedField;
    setItemType({ ...itemType, nestedFields: newNestedFields });
  };

  const handleAddNestedField = () => {
    setItemType({
      ...itemType,
      nestedFields: [
        ...(itemType.nestedFields || []),
        createEmptyNestedField(),
      ],
    });
  };

  const handleRemoveNestedField = (index) => {
    const newNestedFields = [...(itemType.nestedFields || [])];
    newNestedFields.splice(index, 1);
    setItemType({ ...itemType, nestedFields: newNestedFields });
  };

  const handleNestedSubfieldChange = (nestedIndex, fieldIndex, field) => {
    const newNestedFields = [...(itemType.nestedFields || [])];
    const newFields = [...newNestedFields[nestedIndex].fields];
    newFields[fieldIndex] = field;
    newNestedFields[nestedIndex] = {
      ...newNestedFields[nestedIndex],
      fields: newFields,
    };
    setItemType({ ...itemType, nestedFields: newNestedFields });
  };

  const handleAddNestedSubfield = (nestedIndex) => {
    const newNestedFields = [...(itemType.nestedFields || [])];
    newNestedFields[nestedIndex] = {
      ...newNestedFields[nestedIndex],
      fields: [...newNestedFields[nestedIndex].fields, createEmptyField()],
    };
    setItemType({ ...itemType, nestedFields: newNestedFields });
  };

  const handleRemoveNestedSubfield = (nestedIndex, fieldIndex) => {
    const newNestedFields = [...(itemType.nestedFields || [])];
    const newFields = [...newNestedFields[nestedIndex].fields];
    newFields.splice(fieldIndex, 1);
    newNestedFields[nestedIndex] = {
      ...newNestedFields[nestedIndex],
      fields: newFields,
    };
    setItemType({ ...itemType, nestedFields: newNestedFields });
  };

  const handleNestedNameChange = (index, name) => {
    const newNestedFields = [...(itemType.nestedFields || [])];
    newNestedFields[index] = {
      ...newNestedFields[index],
      name,
    };
    setItemType({ ...itemType, nestedFields: newNestedFields });
  };

  const handleSave = async () => {
    const errors = validateItemType(itemType);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        await createItemType(itemType);
      } else {
        await updateItemType(id, itemType);
      }
      router.push("/item-types");
    } catch (error) {
      console.error("Error saving item type:", error);
      setError("Failed to save item type");
    } finally {
      setSaving(false);
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isNew ? "Create Item Type" : "Edit Item Type"}
        </h1>
        <div className="flex space-x-2">
          <Link
            href="/item-types"
            className="px-4 py-2 border border-border rounded-md"
          >
            Cancel
          </Link>
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
              "Save Item Type"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {validationErrors.name && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {validationErrors.name}
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={itemType.name}
              onChange={handleNameChange}
              className="w-full p-2 bg-background border border-border rounded-md"
              placeholder="e.g., Vehicle, Computer Build"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={itemType.description}
              onChange={handleDescriptionChange}
              className="w-full p-2 bg-background border border-border rounded-md"
              placeholder="Describe what this item type is for"
              rows={3}
            />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Fields</h2>
      {validationErrors.fields && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {validationErrors.fields}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {itemType.fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-card border border-border rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <input
                  type="text"
                  id={`field-${index}-name`}
                  value={field.name}
                  onChange={(e) =>
                    handleFieldChange(index, {
                      ...field,
                      name: e.target.value,
                    })
                  }
                  className="w-full p-2 bg-background border border-border rounded-md"
                  placeholder="Field name (e.g., Make, Model, CPU)"
                />
              </div>
              <button
                onClick={() => handleRemoveField(index)}
                className="ml-2 text-destructive hover:text-destructive/80"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddField}
          className="w-full p-4 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          + Add Field
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Nested Fields (Optional)</h2>
      {validationErrors.nestedFields && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {validationErrors.nestedFields}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {itemType.nestedFields?.map((nestedField, nestedIndex) => (
          <div
            key={nestedField.id}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Nested Section #{nestedIndex + 1}</h3>
              <button
                onClick={() => handleRemoveNestedField(nestedIndex)}
                className="text-destructive hover:text-destructive/80"
              >
                Remove
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor={`nested-${nestedIndex}-name`}
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Section Name
                </label>
                <input
                  type="text"
                  id={`nested-${nestedIndex}-name`}
                  value={nestedField.name}
                  onChange={(e) =>
                    handleNestedNameChange(nestedIndex, e.target.value)
                  }
                  className="w-full p-2 bg-background border border-border rounded-md"
                  placeholder="e.g., Modifications, Components"
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Fields</h4>
                <div className="space-y-4">
                  {nestedField.fields.map((field, fieldIndex) => (
                    <div
                      key={field.id}
                      className="bg-background border border-border rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            id={`nested-${nestedIndex}-field-${fieldIndex}-name`}
                            value={field.name}
                            onChange={(e) =>
                              handleNestedSubfieldChange(
                                nestedIndex,
                                fieldIndex,
                                {
                                  ...field,
                                  name: e.target.value,
                                }
                              )
                            }
                            className="w-full p-2 bg-background border border-border rounded-md"
                            placeholder="Field name (e.g., Brand, Type)"
                          />
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveNestedSubfield(nestedIndex, fieldIndex)
                          }
                          disabled={nestedField.fields.length <= 1}
                          className="ml-2 text-destructive hover:text-destructive/80 disabled:opacity-50"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddNestedSubfield(nestedIndex)}
                    className="w-full p-3 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors text-sm"
                  >
                    + Add Field
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddNestedField}
          className="w-full p-4 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          + Add Nested Section
        </button>
      </div>

      <div className="flex justify-end space-x-2 mt-8">
        <Link
          href="/item-types"
          className="px-4 py-2 border border-border rounded-md"
        >
          Cancel
        </Link>
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
            "Save Item Type"
          )}
        </button>
      </div>
    </div>
  );
}
