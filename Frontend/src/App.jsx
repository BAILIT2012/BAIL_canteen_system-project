import { Routes, Route } from "react-router-dom";
import Home from './components/Home';
import CanteenScanner from './components/CanteenScanner';
import Canteen from "./pages/Canteen";
import TokenPage from "./pages/TokenPage";
import MealStatus from "./pages/MealStatus";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/canteen-scanner" element={<CanteenScanner/>} />
      <Route path="/canteen" element={<Canteen/>} />
      <Route path="/token" element={<TokenPage/>} />
      <Route path="/get-meal-status" element={<MealStatus/>} />

    </Routes>
  );
}

export default App;
