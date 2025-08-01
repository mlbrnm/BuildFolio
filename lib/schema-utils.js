// Default field types for item type schemas
export const DEFAULT_FIELD_TYPES = [
  { id: "markdown", name: "Markdown", defaultValue: "" },
];

// Create a new empty field
export function createEmptyField() {
  return {
    id: generateId(),
    name: "",
    type: "markdown",
    defaultValue: "",
  };
}

// Create a new empty nested field
export function createEmptyNestedField() {
  return {
    id: generateId(),
    name: "",
    fields: [createEmptyField()],
  };
}

// Create a new empty item type
export function createEmptyItemType() {
  return {
    name: "",
    description: "",
    fields: [createEmptyField()],
    nestedFields: [],
  };
}

// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Validate a field
export function validateField(field) {
  return {};
}

// Validate a nested field
export function validateNestedField(nestedField) {
  const errors = {};

  if (!nestedField.name.trim()) {
    errors.name = "Section name is required";
  }

  if (!nestedField.fields || nestedField.fields.length === 0) {
    errors.fields = "Section must have at least one field";
  }

  return errors;
}

// Validate an item type
export function validateItemType(itemType) {
  const errors = {};

  if (!itemType.name.trim()) {
    errors.name = "Item type name is required";
  }

  if (!itemType.fields || itemType.fields.length === 0) {
    errors.fields = "Item type must have at least one field";
  }

  if (itemType.nestedFields && itemType.nestedFields.length > 0) {
    const nestedFieldErrors = itemType.nestedFields.map(validateNestedField);
    if (nestedFieldErrors.some((e) => Object.keys(e).length > 0)) {
      errors.nestedFields = "One or more nested fields have errors";
    }
  }

  return errors;
}

// Generate empty data for a schema
export function generateEmptyData(schema) {
  const data = {
    name: "",
  };

  // Add fields
  schema.fields.forEach((field) => {
    data[field.id] = field.defaultValue !== undefined ? field.defaultValue : "";
  });

  // Add nested fields
  if (schema.nestedFields) {
    schema.nestedFields.forEach((nestedField) => {
      data[nestedField.id] = [];
    });
  }

  return data;
}
