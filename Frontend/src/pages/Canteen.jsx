import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Canteen() {
  const [employee, setEmployee] = useState(null);
  const [availableMeal, setAvailableMeal] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [wallet, setWallet] = useState(null); // ✅ new state for wallet

  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    if (code) {
      // 🟢 1. Get employee basic info
      fetch(`http://localhost:8281/get-employee/${code}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Employee Data:", data);
          setEmployee(data);

          if (data && data.employee_code) {
            localStorage.setItem("employee_code", data.employee_code);
            console.log("Employee code saved", data.employee_code);

            // 🟢 2. Fetch wallet data using employee_code (inside same success block)
            fetch(`http://localhost:8281/get-wallet/${data.employee_code}`)
              .then((res) => res.json())
              .then((walletData) => {
                console.log("Wallet Data:", walletData);
                setWallet(walletData);
              })
              .catch((err) =>
                console.error("Error fetching wallet details:", err)
              );
          }
        })
        .catch((err) => console.error("Error fetching employee:", err));
    }

    // 🕐 Determine meal timing
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 7 && hour < 10.5) setAvailableMeal("Breakfast");
    else if (hour >= 11 && hour < 15) setAvailableMeal("Lunch");
    else if (hour >= 17 && hour < 22) setAvailableMeal("Dinner");
    else setAvailableMeal("None");
  }, []);

  const handleSubmit = async () => {
  if (!selectedMeal) {
    setMessage("⚠️ Please select a meal.");
    return;
  }

  // 💰 Define meal cost (you can adjust later)
  const mealCost =
    selectedMeal === "Breakfast"
      ? 1
      : selectedMeal === "Lunch" || selectedMeal === "Dinner"
      ? 2
      : 1;

  // 🧠 Check if wallet has enough balance before submitting
  if (
    (selectedMeal === "Breakfast" && wallet.breakfast_credits < mealCost) ||
    ((selectedMeal === "Lunch" || selectedMeal === "Dinner") &&
      wallet.lunch_dinner_credits < mealCost)
  ) {
    setMessage("❌ Insufficient credits in wallet!");
    return;
  }

  try {
    const res = await fetch("http://localhost:8281/canteen/submit-meal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_code: employee.employee_code,
        employee_name: employee.employee_name,
        employee_department: employee.employee_department,
        employee_designation: employee.employee_designation,
        meal_type: selectedMeal,
        amount: mealCost,
        quantity: Number(quantity),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Transaction failed! Insufficient balance.");
      return;
    }

    console.log("Meal response:", data);

    // ✅ Update frontend wallet instantly after successful deduction
    if (selectedMeal === "Breakfast") {
      setWallet((prev) => ({
        ...prev,
        breakfast_credits: prev.breakfast_credits - mealCost,
      }));
    } else if (selectedMeal === "Lunch" || selectedMeal === "Dinner") {
      setWallet((prev) => ({
        ...prev,
        lunch_dinner_credits: prev.lunch_dinner_credits - mealCost,
      }));
    }

    alert("✅ Meal submitted successfully!");

    // ✅ Redirect to Token Page
    navigate("/token", {
      state: {
        employee,
        token: data.token_number,
        orderTime: data.order_time,
        meal_type: selectedMeal,
        quantity,
      },
    });
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Something went wrong while submitting meal!");
  }
};


  if (!employee)
    return <p className="mt-5 text-center">Loading employee details...</p>;

  return (
    <div className="p-6">
      <h2 className="mt-5 text-xl font-bold">Employee Details</h2>
      <p>
        <strong>Code:</strong> {employee.employee_code}
      </p>
      <p>
        <strong>Name:</strong> {employee.employee_name}
      </p>
      <p>
        <strong>Designation:</strong> {employee.employee_designation}
      </p>
      <p>
        <strong>Department:</strong> {employee.employee_department}
      </p>

      {/* 💰 Wallet Section */}
      {wallet ? (
        <div className="mt-4 p-3 border rounded shadow-sm bg-light">
          <h4 className="font-semibold mb-2">💰 Wallet Balance</h4>
          <p>
            <strong>Breakfast Credits:</strong>{" "}
            <span
              style={{
                color: wallet.breakfast_credits > 0 ? "green" : "red",
              }}
            >
              {wallet.breakfast_credits}
            </span>
          </p>
          <p>
            <strong>Lunch/Dinner Credits:</strong>{" "}
            <span
              style={{
                color: wallet.lunch_dinner_credits > 0 ? "green" : "red",
              }}
            >
              {wallet.lunch_dinner_credits}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-muted mt-3">Fetching wallet data...</p>
      )}

      {availableMeal === "None" ? (
        <p className="text-red-600 mt-4">❌ No meal available at this time.</p>
      ) : (
        <div className="mt-5">
          <h3 className="font-semibold">Available Meal: {availableMeal}</h3>

          <select
            className="border form-select p-2 rounded mt-2"
            value={selectedMeal}
            onChange={(e) => setSelectedMeal(e.target.value)}
          >
            <option value="">Select Meal</option>
            {["Breakfast", "Lunch", "Dinner"].map((meal) => (
              <option key={meal} value={meal} disabled={meal !== availableMeal}>
                {meal}
              </option>
            ))}
          </select>

          <div className="mt-3">
            <label>Quantity:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border form-control p-2 rounded ml-2"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="mt-4 btn btn-success bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Submit
          </button>

          {message && <p className="mt-3 text-red-600">{message}</p>}
        </div>
      )}
    </div>
  );
}

export default Canteen;
