import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addExpense } from "../api/expensesAPI";
import "../assets/styles/expenses.css";

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    expense_name: "",
    amount: "",
    expense_date: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.expense_name || !formData.amount || !formData.expense_date) {
      setError("All fields are required.");
      return;
    }

    try {
      await addExpense(formData);
      navigate("/expenses"); // Redirect to expenses page after adding
    } catch (err) {
      setError("Failed to add expense. Please try again.");
    }
  };

  return (
    <div className="expenses-container">
      <h2>Add Expense</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="expense-form">
        <label>
          Expense Name:
          <input
            type="text"
            name="expense_name"
            value={formData.expense_name}
            onChange={handleChange}
            required
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
          />
        </label>

        <button type="submit" className="add-expense-btn">Add Expense</button>
      </form>
    </div>
  );
};

export default AddExpense;
