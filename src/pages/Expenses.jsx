import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchExpenses, fetchExpensesByDateRange, updateExpense, deleteExpense } from "../api/expensesAPI";
import "../assets/styles/expenses.css";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState("cigarette");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const expensesPerPage = 5;

  // Fetch expenses based on category and date range
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (startDate && endDate) {
        data = await fetchExpensesByDateRange(startDate, endDate, currentTab);
      } else {
        data = await fetchExpenses(currentTab);
      }
      setExpenses(data);
    } catch (err) {
      setError("Failed to fetch expenses: " + err.message);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentTab, startDate, endDate]);

  // Filter expenses based on search term (description)
  const filteredExpenses = expenses.filter((expense) =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (err) {
        setError("Failed to delete expense: " + err.message);
      }
    }
  };

  // Handle Edit (Set the expense to edit)
  const handleEdit = (expense) => {
    setEditingExpense({ ...expense });
  };

  // Handle Update (Save the edited expense)
  const handleUpdate = async () => {
    try {
      const updatedData = {
        description: editingExpense.description,
        amount: editingExpense.amount,
        expense_date: editingExpense.expense_date,
        category: editingExpense.category,
      };
      await updateExpense(editingExpense.id, updatedData);
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense.id ? { ...expense, ...updatedData } : expense
        )
      );
      setEditingExpense(null);
    } catch (err) {
      setError("Failed to update expense: " + err.message);
    }
  };

  // Handle Date Range Reset
  const handleResetDates = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  return (
    <div className="expenses-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
        <Link to="/add-expense" className="add-expense-btn">
          + Add Expense
        </Link>
      </div>

      {/* Tabs for Categories */}
      <div className="tabs">
        <button
          className={currentTab === "cigarette" ? "active" : ""}
          onClick={() => {
            setCurrentTab("cigarette");
            setCurrentPage(1);
          }}
        >
          Cigarette Expenses
        </button>
        <button
          className={currentTab === "bread_tomato" ? "active" : ""}
          onClick={() => {
            setCurrentTab("bread_tomato");
            setCurrentPage(1);
          }}
        >
          Bread/Tomato Expenses
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="date-range-filter">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </label>
        <button onClick={handleResetDates}>Reset Dates</button>
      </div>

      {/* Error and Loading States */}
      {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
      {loading ? (
        <div>Loading expenses...</div>
      ) : (
        <>
          <table className="expenses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Amount ($)</th>
                <th>Date</th>
                <th>Category</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6">No expenses found</td>
                </tr>
              ) : (
                currentExpenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td>{indexOfFirstExpense + index + 1}</td>
                    <td>
                      {editingExpense && editingExpense.id === expense.id ? (
                        <input
                          type="text"
                          value={editingExpense.description}
                          onChange={(e) =>
                            setEditingExpense({ ...editingExpense, description: e.target.value })
                          }
                        />
                      ) : (
                        expense.description
                      )}
                    </td>
                    <td>
                      {editingExpense && editingExpense.id === expense.id ? (
                        <input
                          type="number"
                          value={editingExpense.amount}
                          onChange={(e) =>
                            setEditingExpense({
                              ...editingExpense,
                              amount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      ) : (
                        (parseFloat(expense.amount) || 0).toFixed(2)
                      )}
                    </td>
                    <td>
                      {editingExpense && editingExpense.id === expense.id ? (
                        <input
                          type="date"
                          value={editingExpense.expense_date}
                          onChange={(e) =>
                            setEditingExpense({ ...editingExpense, expense_date: e.target.value })
                          }
                        />
                      ) : (
                        new Date(expense.expense_date).toLocaleDateString()
                      )}
                    </td>
                    <td>
                      {editingExpense && editingExpense.id === expense.id ? (
                        <select
                          value={editingExpense.category}
                          onChange={(e) =>
                            setEditingExpense({ ...editingExpense, category: e.target.value })
                          }
                        >
                          <option value="cigarette">Cigarette</option>
                          <option value="bread_tomato">Bread/Tomato</option>
                        </select>
                      ) : (
                        expense.category
                      )}
                    </td>
                    <td>
                      {editingExpense && editingExpense.id === expense.id ? (
                        <>
                          <button onClick={handleUpdate} className="save-btn">
                            Save
                          </button>
                          <button
                            onClick={() => setEditingExpense(null)}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(expense)} className="edit-btn">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(expense.id)} className="delete-btn">
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastExpense >= filteredExpenses.length}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Expenses;