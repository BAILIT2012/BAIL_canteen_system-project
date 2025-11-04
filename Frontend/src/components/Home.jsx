import React from "react";
import { Link } from "react-router-dom";
import "./css/Home.css";

const cards = [
  { title: "Scan QR Code", desc: "Scan employee QR to view details and process meals.", link: "/canteen-scanner", button: "Scan QR" },
  { title: "Meal Status", desc: "Check today's meal booking and status updates.", link: "/get-meal-status", button: "Check Status" },
];

const Home = () => {
  return (
    <div className="home-page min-h-screen flex flex-col justify-between bg-gray-100">
      <div className="content-wrap flex-grow flex flex-col items-center justify-center py-12">
        <h1 className="text-3xl font-bold mt-5 mb-8 text-gray-800 text-center">
          Canteen Management Dashboard
        </h1>

        <div className="card-container mt-5 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full px-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="home-card bg-white shadow-md rounded-2xl p-6 text-center transition-transform transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold mb-3 text-green-700">{card.title}</h3>
              <p className="text-gray-600 mb-6">{card.desc}</p>
              <Link to={card.link}>
                <button className="card-button bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-5 rounded-full transition-all">
                  {card.button}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer bg-gray-800 text-white py-4 text-center text-sm">
        © Powered by Brindavan Agro Industries Pvt Ltd — IT Department
      </footer>
    </div>
  );
};

export default Home;
