import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Stocks from "./pages/Stocks";
import Expenses from "./pages/Expenses";
import Cashflow from "./pages/CashFlow";
import Damages from "./pages/Damages";
import AddSales from "./pages/AddSales";
import AddPurchase from "./pages/AddPurchase";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import AddExpense from "./pages/AddExpense";
import AddDamage from "./pages/AddDamage";
import Settings from "./pages/Settings";
import POS from "./pages/POS";

const NotFound = () => (
  <div style={{ padding: "20px", color: "white", backgroundColor: "#1e1e1e", minHeight: "100vh" }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
  </div>
);

function AppRouter() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/damages" element={<Damages />} />
        <Route path="/cashflow" element={<Cashflow />} />
        <Route path="/add-sales" element={<AddSales />} />
        <Route path="/add-purchase" element={<AddPurchase />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/add-damage" element={<AddDamage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pos" element={<POS />} /> {/* This route causes Dashboard to fail */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;