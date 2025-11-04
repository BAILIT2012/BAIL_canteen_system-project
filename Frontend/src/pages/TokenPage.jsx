
import React from "react";
import { useLocation, Link } from "react-router-dom";

function TokenPage() {
  const location = useLocation();
  const { employee, token, orderTime } = location.state || {};

  if (!employee || !token) {
    return <p className="p-6 text-red-600">❌ Invalid or missing token data.</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-96">
        <h2 className="text-2xl font-bold text-green-600 mb-4">✅ Meal Recorded</h2>

        <div className="border-t border-b py-4 mb-4">
          <p className="text-gray-700 text-lg font-semibold">Token Number</p>
          <h1 className="text-5xl font-extrabold text-blue-600">{token}</h1>
        </div>

        <div className="text-left text-gray-700">
          <p><strong>Name:</strong> {employee.employee_name}</p>
          <p><strong>Code:</strong> {employee.employee_code}</p>
          <p><strong>Department:</strong> {employee.employee_department}</p>
          <p><strong>Designation:</strong> {employee.employee_designation}</p>
          <p><strong>Order Time:</strong> {new Date(orderTime).toLocaleString()}</p>
        </div>

        <Link to="/get-meal-status">
          <button className="mt-6 btn btn-success bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Go to Meal Status
          </button>
        </Link>
      </div>
    </div>
  );
}

export default TokenPage;
