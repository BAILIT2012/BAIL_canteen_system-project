import React, { useEffect, useState } from "react";

function MealStatus() {
  const [meals, setMeals] = useState([]); // ✅ multiple meals support
  const [error, setError] = useState("");

  useEffect(() => {
    // 👇 Ab sabhi employees ka meal data fetch hoga
    fetch("http://192.168.5.20:8281/get-meal-status")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("🍽️ All meal data received:", data);
        if (Array.isArray(data) && data.length > 0) {
          setMeals(data);
        } else {
          setError("⚠️ No recent meal found.");
        }
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError("⚠️ Failed to fetch meal data.");
      });
  }, []);

  if (error) return <p className="mt-5 text-red-600 text-center">{error}</p>;

  if (meals.length === 0) return <p className="mt-5 text-center">Loading meal data...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        🍴 Canteen Meal Transaction History
      </h2>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Token Number</th>
            <th className="border p-2">Employee Code</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Department</th>
            <th className="border p-2">Designation</th>
            <th className="border p-2">Meal Type</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Amount Deducted</th>
            <th className="border p-2">Order Time</th>
          </tr>
        </thead>
        <tbody>
          {meals.map((meal, index) => (
            <tr key={meal.id} className="hover:bg-gray-50 text-center">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2 font-semibold text-blue-600">{meal.token_number}</td>
              <td className="border p-2">{meal.employee_code}</td>
              <td className="border p-2">{meal.employee_name || "-"}</td>
              <td className="border p-2">{meal.employee_department || "-"}</td>
              <td className="border p-2">{meal.employee_designation || "-"}</td>
              <td className="border p-2">{meal.meal_type}</td>
              <td className="border p-2">{meal.quantity}</td>
              <td className="border p-2 text-green-600 font-semibold">
                ₹{meal.amount_deducted || 0}
              </td>
              <td className="border p-2">
                {new Date(meal.order_time).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MealStatus;
