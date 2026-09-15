import { useEffect, useState } from "react";
import API from "../api/auth";
import "../styles/Inventory.css";

function Inventory() {

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {

    try {

      const token = localStorage.getItem("token");

      const response = await API.get("/inventory/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(response.data);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="inventory-page">

      <h1>Inventory</h1>

      <table>

        <thead>

          <tr>
            <th>Batch ID</th>
            <th>Fabric</th>
            <th>Source</th>
            <th>Quantity</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {items.map((item) => (

            <tr key={item.id}>

              <td>{item.batch_id}</td>

              <td>{item.fabric_type}</td>

              <td>{item.source}</td>

              <td>{item.quantity}</td>

              <td>{item.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Inventory;