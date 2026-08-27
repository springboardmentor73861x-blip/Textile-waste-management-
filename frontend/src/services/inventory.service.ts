import api from "@/lib/axios";

export interface Inventory {
  id: number;
  item_name: string;
  category: string;
  material: string;
  color: string | null;
  weight: number;
  quantity: number;
  condition: string;
  location: string | null;
  image_url: string | null;
  created_by: number;
  created_at: string;
}

export interface InventoryPayload {
  item_name: string;
  category: string;
  material: string;
  color: string | null;
  weight: number;
  quantity: number;
  condition: string;
  location: string | null;
  image_url: string | null;
}

export async function getInventory() {
  const response = await api.get("/inventory");
  return response.data;
}

export async function createInventory(
  data: InventoryPayload
) {
  const response = await api.post(
    "/inventory",
    data
  );

  return response.data;
}

export async function updateInventory(
  id: number,
  data: InventoryPayload
) {
  const response = await api.put(
    `/inventory/${id}`,
    data
  );

  return response.data;
}

export async function deleteInventory(
  id: number
) {
  const response = await api.delete(
    `/inventory/${id}`
  );

  return response.data;
}