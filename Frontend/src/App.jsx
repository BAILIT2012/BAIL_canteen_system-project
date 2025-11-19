import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import CanteenScanner from './components/CanteenScanner';
import Canteen from "./pages/Canteen";
import TokenPage from "./pages/TokenPage";
import MealStatus from "./pages/MealStatus";
import BetaVersion from "../BetaVersion";
import maintenanceConfig from "./config/maintenance";
import Maintenance from "./pages/Maintenance";


function App() {
  if (maintenanceConfig.enabled) {
  return <Maintenance />;
}
  return (
    <BrowserRouter>
    <BetaVersion/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/canteen-scanner" element={<CanteenScanner/>} />
      <Route path="/canteen" element={<Canteen/>} />
      <Route path="/token" element={<TokenPage/>} />
      <Route path="/get-meal-status" element={<MealStatus/>} />

    </Routes>
    </BrowserRouter>
  );
}

export default App;
