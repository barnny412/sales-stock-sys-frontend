import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Import the Layout component
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
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/sales" element={<Layout><Sales /></Layout>} />
        <Route path="/purchases" element={<Layout><Purchases /></Layout>} />
        <Route path="/stocks" element={<Layout><Stocks /></Layout>} />
        <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
        <Route path="/damages" element={<Layout><Damages /></Layout>} />
        <Route path="/cashflow" element={<Layout><Cashflow /></Layout>} />
        <Route path="/add-sales" element={<Layout><AddSales /></Layout>} />
        <Route path="/add-purchase" element={<Layout><AddPurchase /></Layout>} />
        <Route path="/add-product" element={<Layout><AddProduct /></Layout>} />
        <Route path="/edit-product/:id" element={<Layout><EditProduct /></Layout>} />
        <Route path="/add-expense" element={<Layout><AddExpense /></Layout>} />
        <Route path="/add-damage" element={<Layout><AddDamage /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/pos" element={<Layout usePosNavbar={true}><POS /></Layout>} /> {/* POS uses special navbar */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Router>
  );
}

export default AppRouter;