import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addExpense } from "../api/expensesAPI";
import "../assets/styles/expenses.css";

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    expense_date: "",
    category: "cigarette", // Default category
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form fields
    if (!formData.description || !formData.amount || !formData.expense_date || !formData.category) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (isNaN(Number(formData.amount)) || Number(formData.amount) < 0) {
      setError("Amount must be a non-negative number.");
      setLoading(false);
      return;
    }

    if (isNaN(Date.parse(formData.expense_date))) {
      setError("Invalid date format. Use YYYY-MM-DD.");
      setLoading(false);
      return;
    }

    if (!["cigarette", "bread_tomato"].includes(formData.category)) {
      setError("Category must be either 'cigarette' or 'bread_tomato'.");
      setLoading(false);
      return;
    }

    try {
      await addExpense(formData);
      navigate("/expenses"); // Redirect to expenses page after adding
    } catch (err) {
      setError(err.message || "Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expenses-container">
      <h2>Add Expense</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="expense-form">
        <label>
          Description:
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label>
          Amount ($):
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            disabled={loading}
          />
        </label>

        <label>
          Expense Date:
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <label>
          Category:
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="cigarette">Cigarette</option>
            <option value="bread_tomato">Bread/Tomato</option>
          </select>
        </label>

        <button type="submit" className="add-expense-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;