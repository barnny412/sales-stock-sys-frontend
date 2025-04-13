import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Stocks from "./pages/Stocks";
import Expenses from "./pages/Expenses";
import Cashflow from "./pages/CashFlow";
import Damages from "./pages/Damages"; // Import Damages Page
import AddSales from "./pages/AddSales";
import AddPurchase from "./pages/AddPurchase";
import AddProduct from "./pages/AddProduct"; // Import Add Product Page
import AddExpense from "./pages/AddExpense"; // Import Add Expense Page
import AddDamage from "./pages/AddDamage"; // Import Add Damage Page

function AppRouter() {
  return (
    <Router>
      <Navbar /> {/* Navbar is always visible */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/damages" element={<Damages />} /> {/* New Route */}
        <Route path="/cashflow" element={<Cashflow />} />
        <Route path="/add-sales" element={<AddSales />} />
        <Route path="/add-purchase" element={<AddPurchase />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/add-damage" element={<AddDamage />} /> {/* New Route */}
      </Routes>
    </Router>
  );
}

export default AppRouter;
