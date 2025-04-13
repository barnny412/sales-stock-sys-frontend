import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link
import { fetchExpenses } from "../api/expensesAPI";
import "../assets/styles/expenses.css";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 5;

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (error) {
        console.error("Failed to fetch expenses");
      }
    };
    getExpenses();
  }, []);

  // Filter expenses based on search term
  const filteredExpenses = expenses.filter((expense) =>
    expense.expense_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  // Pagination Logic
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstExpense, indexOfLastExpense);

  return (
    <div className="expenses-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Link to="/add-expense" className="add-expense-btn">
          + Add Expense
        </Link>
      </div>

      <table className="expenses-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Amount ($)</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentExpenses.map((expense, index) => (
            <tr key={expense.id}>
              <td>{indexOfFirstExpense + index + 1}</td>
              <td>{expense.expense_name}</td>
              <td>{expense.amount}</td>
              <td>{new Date(expense.expense_date).toLocaleDateString()}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
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
    </div>
  );
};

export default Expenses;
