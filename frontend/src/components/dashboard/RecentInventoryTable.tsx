interface InventoryItem {
  id: number;
  item_name: string;
  category: string;
  material: string;
  quantity: number;
  weight: number;
  created_at: string;
}

interface Props {
  inventory: InventoryItem[];
}

export default function RecentInventoryTable({
  inventory,
}: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-4 text-xl font-bold">
        Recent Inventory
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100 dark:bg-slate-800">
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Material</th>
              <th className="px-4 py-3 text-left">Quantity</th>
              <th className="px-4 py-3 text-left">Weight</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {inventory.map((item) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <td className="px-4 py-3">{item.item_name}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{item.material}</td>
                <td className="px-4 py-3">{item.quantity}</td>
                <td className="px-4 py-3">{item.weight} kg</td>
                <td className="px-4 py-3">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}