"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Inventory } from "@/services/inventory.service";

interface InventoryTableProps {
  inventory: Inventory[];
  onEdit: (item: Inventory) => void;
  onDelete: (id: number) => void;
}

export default function InventoryTable({
  inventory,
  onEdit,
  onDelete,
}: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50 dark:bg-slate-800">
            <th className="px-4 py-3 text-left">Item</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Material</th>
            <th className="px-4 py-3 text-left">Weight</th>
            <th className="px-4 py-3 text-left">Quantity</th>
            <th className="px-4 py-3 text-left">Condition</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {inventory.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="py-8 text-center text-gray-500"
              >
                No inventory available.
              </td>
            </tr>
          ) : (
            inventory.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <td className="px-4 py-3">
                  {item.item_name}
                </td>

                <td className="px-4 py-3">
                  {item.category}
                </td>

                <td className="px-4 py-3">
                  {item.material}
                </td>

                <td className="px-4 py-3">
                  {item.weight} kg
                </td>

                <td className="px-4 py-3">
                  {item.quantity}
                </td>

                <td className="px-4 py-3">
                  {item.condition}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}