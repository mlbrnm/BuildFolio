"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItemTypes, deleteItemType } from "@/lib/db";
import Link from "next/link";

export default function ItemTypesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [itemTypes, setItemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const itemTypesData = await getItemTypes();
        setItemTypes(itemTypesData);
      } catch (error) {
        console.error("Error fetching item types:", error);
        setError("Failed to load item types");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router]);

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this item type? This will also delete ALL items of this type and ALL images associated with those items. This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteItemType(id);
      setItemTypes(itemTypes.filter((type) => type.id !== id));
    } catch (error) {
      console.error("Error deleting item type:", error);
      setError("Failed to delete item type");
    }
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Item Types</h1>
        <Link
          href="/item-types/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          New Item Type
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
          <h2 className="text-xl font-medium mb-2">No item types yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first item type to start defining your items.
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
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fields
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itemTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{type.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {type.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {type.fields?.length || 0} fields
                        {type.nestedFields?.length > 0 &&
                          `, ${type.nestedFields.length} nested sections`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/item-types/${type.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(type.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">What are Item Types?</h2>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="mb-4">
            Item Types define the structure of your items. They specify what
            fields and data your items can have.
          </p>
          <p className="mb-4">
            For example, you might create a "Vehicle" item type with fields like
            "Make", "Model", "Year", and "Oil Capacity". Or a "Computer Build"
            item type with fields like "CPU", "GPU", and "RAM".
          </p>
          <p>
            Once you've created item types, you can create items based on those
            types, and BuildFolio will generate the appropriate forms and
            displays for your data.
          </p>
        </div>
      </div>
    </div>
  );
}
