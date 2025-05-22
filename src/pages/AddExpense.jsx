import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select"; // Import react-select
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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Options for react-select
  const categoryOptions = [
    { value: "cigarette", label: "Cigarette" },
    { value: "bread_tomato", label: "Bread/Tomato" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData({ ...formData, category: selectedOption ? selectedOption.value : "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

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
      setSuccess("Expense added successfully!");
      setFormData({ description: "", amount: "", expense_date: "", category: "cigarette" }); // Reset form
      setTimeout(() => setSuccess(""), 5000); // Clear success message after 5 seconds
      navigate("/expenses");
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
      {success && <p className="success-message">{success}</p>}

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
          Amount (K):
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
          <Select
            name="category"
            value={categoryOptions.find((option) => option.value === formData.category)}
            onChange={handleCategoryChange}
            options={categoryOptions}
            isDisabled={loading}
            className="category-select"
            classNamePrefix="react-select"
            placeholder="Select category..."
            isClearable={false}
            required
            styles={{
              input: (provided) => ({
                ...provided,
                color: '#fff',
              }),
              singleValue: (provided) => ({
                ...provided,
                color: '#fff',
              }),
            }}
          />
        </label>

        <button type="submit" className="add-expense-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
};

export default AddExpense;