"use client";

import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getItems, getItemTypes } from "@/lib/db";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
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
        const [itemsData, itemTypesData] = await Promise.all([
          getItems(user.uid),
          getItemTypes(),
        ]);
        setItems(itemsData);
        setItemTypes(itemTypesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router]);

  if (!user) {
    return null; // Will redirect to login
  }

  // Group items by their typeId
  const groupItemsByType = () => {
    const grouped = {};

    // Create a group for items with unknown type
    grouped["unknown"] = {
      id: "unknown",
      name: "Unknown Type",
      items: [],
    };

    // Initialize groups for each item type
    itemTypes.forEach((type) => {
      grouped[type.id] = {
        id: type.id,
        name: type.name,
        items: [],
      };
    });

    // Add items to their respective groups
    items.forEach((item) => {
      if (item.typeId && grouped[item.typeId]) {
        grouped[item.typeId].items.push(item);
      } else {
        grouped["unknown"].items.push(item);
      }
    });

    // Convert to array and filter out empty groups
    return Object.values(grouped).filter((group) => group.items.length > 0);
  };

  // Render an individual item card
  const renderItemCard = (item, itemType) => {
    return (
      <Link key={item.id} href={`/items/${item.id}`} className="block group">
        <div className="border border-border rounded-lg overflow-hidden bg-card hover:border-primary/50 transition-colors">
          <div className="h-40 bg-muted flex items-center justify-center">
            {item.images && item.images.length > 0 ? (
              <img
                src={
                  item.images.find((img) => img.isThumbnail)?.thumbnailUrl ||
                  item.images.find((img) => img.isThumbnail)?.url ||
                  item.images[0].thumbnailUrl ||
                  item.images[0].url
                }
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-4xl text-muted-foreground">
                {itemType ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-medium text-lg group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {itemType ? itemType.name : "Unknown Type"}
            </p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/items/new"
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
          New Item
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
      ) : items.length === 0 ? (
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">No items yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your first item to start tracking your projects.
          </p>
          <Link
            href="/items/new"
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
            Create Item
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {groupItemsByType().map((group) => (
            <div key={group.id} className="space-y-4">
              <h2 className="text-2xl font-bold border-b border-border pb-2">
                {group.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item) => {
                  const itemType = itemTypes.find((t) => t.id === item.typeId);
                  return renderItemCard(item, itemType);
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Manage Item Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {itemTypes.map((type) => (
              <Link
                key={type.id}
                href={`/item-types/${type.id}`}
                className="block group"
              >
                <div className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors">
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {type.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description || "No description"}
                  </p>
                </div>
              </Link>
            ))}
            <Link href="/item-types" className="block group">
              <div className="border border-dashed border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors flex items-center justify-center">
                <span className="text-muted-foreground group-hover:text-primary transition-colors flex items-center">
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
                  Manage Item Types
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
