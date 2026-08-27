"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InventoryTable from "@/components/inventory/InventoryTable";
import AddInventoryModal from "@/components/inventory/AddInventoryModal";

import {
  getInventory,
  deleteInventory,
  Inventory,
} from "@/services/inventory.service";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch Inventory
  async function fetchInventory() {
    setLoading(true);

    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) => {
    const query = search.toLowerCase();

    const matchesSearch =
      item.item_name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.material.toLowerCase().includes(query);

    const matchesCategory = category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedInventory = filteredInventory.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Edit Inventory
  function handleEdit(item: Inventory) {
    setSelectedItem(item);
    setOpen(true);
  }

  // Delete Inventory
  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inventory item?",
    );

    if (!confirmed) return;

    try {
      await deleteInventory(id);

      alert("Inventory deleted successfully.");

      await fetchInventory();
    } catch (error) {
      console.error(error);
      alert("Failed to delete inventory.");
    }
  }
  const categories = [
    "All",
    ...new Set(inventory.map((item) => item.category)),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventory
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Manage your textile waste inventory.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null);
              setOpen(true);
            }}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add Inventory
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by Item, Category or Material..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:max-w-md"
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Inventory Table */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-900">
          {loading ? (
            <p className="py-10 text-center">Loading inventory...</p>
          ) : (
            <InventoryTable
              inventory={paginatedInventory}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-lg bg-gray-200 px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>

          <p className="font-medium">
            Page {currentPage} of {totalPages || 1}
          </p>

          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <AddInventoryModal
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedItem(null);
        }}
        onSuccess={fetchInventory}
        inventory={selectedItem}
      />
    </DashboardLayout>
  );
}
