import React, { useState, useEffect, useCallback } from "react";
import { fetchCashFlow, fetchCashflowOpeningBalances } from "../api/cashFlowAPI";
import "../assets/styles/cashFlow.css";

const CashFlow = () => {
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingBalances, setOpeningBalances] = useState({ cigarette: 0, bread_tomato: 0 });
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [currentTab, setCurrentTab] = useState("cigarette");
  const [error, setError] = useState(null);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSetCurrentTab = useCallback(
    debounce((tab) => {
      setCurrentTab(tab);
    }, 300),
    []
  );

  useEffect(() => {
    const getCashflow = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch opening balances for all categories
        const openingBalResult = await fetchCashflowOpeningBalances();
        if (!openingBalResult.success) {
          setError(openingBalResult.error);
          setOpeningBalances({ cigarette: 0, bread_tomato: 0 });
          setOpeningBalance(0);
          setCashflow([]);
          setClosingBalance(0);
          return;
        }
        const balances = openingBalResult.data;
        setOpeningBalances(balances);
        const openingBal = balances[currentTab] || 0;
        setOpeningBalance(openingBal);

        // Fetch cash flow data for the current tab
        const dataResult = await fetchCashFlow(currentTab);
        if (!dataResult.success) {
          setError(dataResult.error);
          setCashflow([]);
          setClosingBalance(0);
          return;
        }
        const data = dataResult.data;

        if (data.length > 0) {
          let balance = openingBal;
          const updatedCashflow = data.map((entry) => {
            const cashIn = parseFloat(entry.cash_in) || 0;
            const cashOut = parseFloat(entry.cash_out) || 0;
            balance += cashIn - cashOut;
            return { ...entry, cash_in: cashIn, cash_out: cashOut, balance };
          });

          setCashflow(updatedCashflow);
          setClosingBalance(balance);
        } else {
          setCashflow([]);
          setClosingBalance(openingBal);
        }
      } catch (error) {
        console.error("Unexpected error in getCashflow:", error.message);
        setError("An unexpected error occurred while fetching cash flow data");
        setOpeningBalances({ cigarette: 0, bread_tomato: 0 });
        setOpeningBalance(0);
        setCashflow([]);
        setClosingBalance(0);
      } finally {
        setLoading(false);
      }
    };
    getCashflow();
  }, [currentTab]);

  const filteredCashFlow = cashflow.filter((entry) => entry.category === currentTab);

  return (
    <div className="cashflow-container">
      <div className="tabs">
        <button
          className={currentTab === "cigarette" ? "active" : ""}
          onClick={() => debouncedSetCurrentTab("cigarette")}
          aria-label="View Cigarette Cash Flow"
          aria-pressed={currentTab === "cigarette"}
        >
          Cigarette Cash Flow
        </button>
        <button
          className={currentTab === "bread_tomato" ? "active" : ""}
          onClick={() => debouncedSetCurrentTab("bread_tomato")}
          aria-label="View Bread/Tomato Cash Flow"
          aria-pressed={currentTab === "bread_tomato"}
        >
          Bread/Tomato Cash Flow
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: "red", margin: "10px 0" }} role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading" role="status">
          Loading...
        </div>
      ) : (
        <div className="table-container">
          <table className="cashflow-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Cash In</th>
                <th>Cash Out</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr className="opening-balance">
                <td>-</td>
                <td>
                  <strong>Opening Balance</strong>
                </td>
                <td>-</td>
                <td>-</td>
                <td>
                  <strong>{openingBalance.toFixed(2)}</strong>
                </td>
              </tr>
              {filteredCashFlow.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredCashFlow.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>{entry.description}</td>
                    <td>{entry.cash_in > 0 ? `${entry.cash_in.toFixed(2)}` : "-"}</td>
                    <td>{entry.cash_out > 0 ? `${entry.cash_out.toFixed(2)}` : "-"}</td>
                    <td>{entry.balance.toFixed(2)}</td>
                  </tr>
                ))
              )}
              <tr className="closing-balance">
                <td>-</td>
                <td>
                  <strong>Closing Balance</strong>
                </td>
                <td>-</td>
                <td>-</td>
                <td>
                  <strong>{closingBalance.toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CashFlow;