"use client";

import { useState, useEffect } from "react";
import MarkdownEditor from "./markdown-editor";

export default function DynamicForm({ schema, data, onChange }) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    setFormData(data || {});
  }, [data]);

  const handleChange = (id, value) => {
    const newData = { ...formData, [id]: value };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const handleNestedItemChange = (nestedId, itemIndex, fieldId, value) => {
    const nestedItems = [...(formData[nestedId] || [])];

    // Ensure the item exists
    if (!nestedItems[itemIndex]) {
      nestedItems[itemIndex] = {};
    }

    // Update the field
    nestedItems[itemIndex] = {
      ...nestedItems[itemIndex],
      [fieldId]: value,
    };

    const newData = { ...formData, [nestedId]: nestedItems };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const handleAddNestedItem = (nestedId, nestedField) => {
    const newItem = {};

    // Initialize with default values
    nestedField.fields.forEach((field) => {
      newItem[field.id] =
        field.defaultValue !== undefined ? field.defaultValue : "";
    });

    const nestedItems = [...(formData[nestedId] || []), newItem];
    const newData = { ...formData, [nestedId]: nestedItems };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const handleRemoveNestedItem = (nestedId, itemIndex) => {
    const nestedItems = [...(formData[nestedId] || [])];
    nestedItems.splice(itemIndex, 1);
    const newData = { ...formData, [nestedId]: nestedItems };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  const renderField = (field) => {
    const value =
      formData[field.id] !== undefined
        ? formData[field.id]
        : field.defaultValue;

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md"
            required={field.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            id={field.id}
            value={value || 0}
            onChange={(e) =>
              handleChange(field.id, parseFloat(e.target.value) || 0)
            }
            className="w-full p-2 bg-background border border-border rounded-md"
            required={field.required}
          />
        );

      case "boolean":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              checked={!!value}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className="mr-2"
              required={field.required}
            />
            <label htmlFor={field.id} className="text-sm text-foreground">
              Yes
            </label>
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md"
            required={field.required}
          />
        );

      case "select":
        return (
          <select
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "markdown":
        return (
          <MarkdownEditor
            id={field.id}
            value={value || ""}
            onChange={(value) => handleChange(field.id, value)}
          />
        );

      default:
        return (
          <input
            type="text"
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="w-full p-2 bg-background border border-border rounded-md"
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Regular fields */}
      {schema.fields?.map((field) => (
        <div key={field.id} className="space-y-2">
          <label
            htmlFor={field.id}
            className="block text-sm font-medium text-foreground"
          >
            {field.name}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          {renderField(field)}
        </div>
      ))}

      {/* Nested fields */}
      {schema.nestedFields?.map((nestedField) => (
        <div key={nestedField.id} className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{nestedField.name}</h3>
            <button
              type="button"
              onClick={() => handleAddNestedItem(nestedField.id, nestedField)}
              className="text-primary hover:text-primary/80 text-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add {nestedField.name}
            </button>
          </div>

          <div className="space-y-4">
            {(formData[nestedField.id] || []).map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">
                    {nestedField.name} #{itemIndex + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveNestedItem(nestedField.id, itemIndex)
                    }
                    className="text-destructive hover:text-destructive/80 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  {nestedField.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label
                        htmlFor={`${nestedField.id}-${itemIndex}-${field.id}`}
                        className="block text-sm font-medium text-foreground"
                      >
                        {field.name}
                        {field.required && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                      {(() => {
                        const value =
                          item[field.id] !== undefined
                            ? item[field.id]
                            : field.defaultValue;

                        switch (field.type) {
                          case "text":
                            return (
                              <input
                                type="text"
                                id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                value={value || ""}
                                onChange={(e) =>
                                  handleNestedItemChange(
                                    nestedField.id,
                                    itemIndex,
                                    field.id,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 bg-background border border-border rounded-md"
                                required={field.required}
                              />
                            );

                          case "number":
                            return (
                              <input
                                type="number"
                                id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                value={value || 0}
                                onChange={(e) =>
                                  handleNestedItemChange(
                                    nestedField.id,
                                    itemIndex,
                                    field.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-full p-2 bg-background border border-border rounded-md"
                                required={field.required}
                              />
                            );

                          case "boolean":
                            return (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                  checked={!!value}
                                  onChange={(e) =>
                                    handleNestedItemChange(
                                      nestedField.id,
                                      itemIndex,
                                      field.id,
                                      e.target.checked
                                    )
                                  }
                                  className="mr-2"
                                  required={field.required}
                                />
                                <label
                                  htmlFor={`${nestedField.id}-${itemIndex}-${field.id}`}
                                  className="text-sm text-foreground"
                                >
                                  Yes
                                </label>
                              </div>
                            );

                          case "date":
                            return (
                              <input
                                type="date"
                                id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                value={value || ""}
                                onChange={(e) =>
                                  handleNestedItemChange(
                                    nestedField.id,
                                    itemIndex,
                                    field.id,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 bg-background border border-border rounded-md"
                                required={field.required}
                              />
                            );

                          case "select":
                            return (
                              <select
                                id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                value={value || ""}
                                onChange={(e) =>
                                  handleNestedItemChange(
                                    nestedField.id,
                                    itemIndex,
                                    field.id,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 bg-background border border-border rounded-md"
                                required={field.required}
                              >
                                <option value="">Select an option</option>
                                {field.options?.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            );

                          case "markdown":
                            return (
                              <MarkdownEditor
                                id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                value={value || ""}
                                onChange={(value) =>
                                  handleNestedItemChange(
                                    nestedField.id,
                                    itemIndex,
                                    field.id,
                                    value
                                  )
                                }
                              />
                            );

                          default:
                            return (
                              <input
                                type="text"
                                id={`${nestedField.id}-${itemIndex}-${field.id}`}
                                value={value || ""}
                                onChange={(e) =>
                                  handleNestedItemChange(
                                    nestedField.id,
                                    itemIndex,
                                    field.id,
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 bg-background border border-border rounded-md"
                                required={field.required}
                              />
                            );
                        }
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {(formData[nestedField.id] || []).length === 0 && (
              <div className="text-center py-8 border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground">
                  No {nestedField.name} added yet
                </p>
                <button
                  type="button"
                  onClick={() =>
                    handleAddNestedItem(nestedField.id, nestedField)
                  }
                  className="mt-2 text-primary hover:text-primary/80 text-sm flex items-center mx-auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add {nestedField.name}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
