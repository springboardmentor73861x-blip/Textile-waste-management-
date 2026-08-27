"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { X } from "lucide-react";

import {
  createInventory,
  updateInventory,
  Inventory,
} from "@/services/inventory.service";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  inventory?: Inventory | null;
}

export default function AddInventoryModal({
  open,
  onClose,
  onSuccess,
  inventory,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    item_name: "",
    category: "",
    material: "",
    color: "",
    weight: "",
    quantity: "",
    condition: "Good",
    location: "",
    image_url: "",
  });

  useEffect(() => {
    if (inventory) {
      const inventoryData = inventory as Inventory & {
        material?: string;
        color?: string | null;
        weight?: number | string;
        quantity?: number | string;
        condition?: string;
        location?: string | null;
        image_url?: string | null;
      };

      setForm({
        item_name: inventoryData.item_name ?? "",
        category: inventoryData.category ?? "",
        material: inventoryData.material ?? "",
        color: inventoryData.color ?? "",
        weight: inventoryData.weight?.toString() ?? "",
        quantity: inventoryData.quantity?.toString() ?? "",
        condition: inventoryData.condition ?? "Good",
        location: inventoryData.location ?? "",
        image_url: inventoryData.image_url ?? "",
      });
    } else {
      setForm({
        item_name: "",
        category: "",
        material: "",
        color: "",
        weight: "",
        quantity: "",
        condition: "Good",
        location: "",
        image_url: "",
      });
    }
  }, [inventory]);

  if (!open) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    try {
      const payload: Parameters<typeof createInventory>[0] = {
        item_name: form.item_name,
        category: form.category,
        material: form.material,
        color: form.color || "",
        weight: Number(form.weight),
        quantity: Number(form.quantity),
        condition: form.condition,
        location: form.location || "",
        image_url: form.image_url || "",
      };

      if (inventory) {
        await updateInventory(inventory.id, payload);

        alert("Inventory updated successfully.");
      } else {
        await createInventory(payload);

        alert("Inventory created successfully.");
      }

      await onSuccess();

      onClose();
    } catch (error) {
      console.error(error);

      if (error instanceof AxiosError) {
        alert(
          error.response?.data?.detail ??
            "Operation failed."
        );
      } else {
        alert("Operation failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-white">
            {inventory ? "Update Inventory" : "Add Inventory"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            name="item_name"
            placeholder="Item Name"
            value={form.item_name}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="material"
            placeholder="Material"
            value={form.material}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            name="color"
            placeholder="Color"
            value={form.color}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="number"
            step="0.01"
            name="weight"
            placeholder="Weight (kg)"
            value={form.weight}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
            required
          />

          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          >
            <option value="Good">Good</option>
            <option value="Average">Average</option>
            <option value="Damaged">Damaged</option>
          </select>

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <input
            name="image_url"
            placeholder="Image URL"
            value={form.image_url}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : inventory
              ? "Update Inventory"
              : "Save Inventory"}
          </button>
        </form>
      </div>
    </div>
  );
}