import React, { useState, useEffect } from "react";
import { fetchCashFlow, fetchOpeningBalance } from "../api/cashFlowAPI"; // Updated API functions
import "../assets/styles/cashFlow.css"; // CSS for styling

const CashFlow = () => {
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [currentTab, setCurrentTab] = useState("cigarette"); // "cigarette" | "bread_tomato"

  useEffect(() => {
    const getCashflow = async () => {
      try {
        setLoading(true);
        // Fetch cash flow data for the selected category
        const data = await fetchCashFlow(currentTab);
        console.log("Cashflow data:", data);

        if (data.length > 0) {
          // Fetch the opening balance for the earliest date in the data
          const earliestDate = data[0].date;
          const openingBal = await fetchOpeningBalance(earliestDate, currentTab);
          setOpeningBalance(openingBal);

          let balance = openingBal;
          const updatedCashflow = data.map((entry) => {
            const cashIn = Number(entry.cash_in) || 0;
            const cashOut = Number(entry.cash_out) || 0;
            balance += cashIn - cashOut;
            return { ...entry, cash_in: cashIn, cash_out: cashOut, balance };
          });

          setCashflow(updatedCashflow);
          setClosingBalance(balance);
        } else {
          // If no data, fetch opening balance for today as a fallback
          const todayDate = new Date().toISOString().split("T")[0];
          const openingBal = await fetchOpeningBalance(todayDate, currentTab);
          setOpeningBalance(openingBal);
          setCashflow([]);
          setClosingBalance(openingBal); // Closing balance is same as opening if no entries
        }
      } catch (error) {
        console.error("Failed to fetch cash flow data:", error);
        setCashflow([]);
        setOpeningBalance(0);
        setClosingBalance(0);
      } finally {
        setLoading(false);
      }
    };
    getCashflow();
  }, [currentTab]); // Re-fetch when tab changes

  // Filter cash flow based on selected tab (already handled by API, but keep for safety)
  const filteredCashFlow = cashflow.filter((entry) => entry.category === currentTab);

  return (
    <div className="cashflow-container">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={currentTab === "cigarette" ? "active" : ""}
          onClick={() => setCurrentTab("cigarette")}
        >
          Cigarette Cash Flow
        </button>
        <button
          className={currentTab === "bread_tomato" ? "active" : ""}
          onClick={() => setCurrentTab("bread_tomato")}
        >
          Bread/Tomato Cash Flow
        </button>
      </div>

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
          {loading ? (
            <tr>
              <td colSpan="5" className="loading">Loading...</td>
            </tr>
          ) : (
            <>
              {/* Opening Balance */}
              <tr className="opening-balance">
                <td>-</td>
                <td><strong>Opening Balance</strong></td>
                <td>-</td>
                <td>-</td>
                <td><strong>{openingBalance.toFixed(2)}</strong></td>
              </tr>

              {/* Cash Flow Entries */}
              {filteredCashFlow.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">No records found</td>
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

              {/* Closing Balance */}
              <tr className="closing-balance">
                <td>-</td>
                <td><strong>Closing Balance</strong></td>
                <td>-</td>
                <td>-</td>
                <td><strong>{closingBalance.toFixed(2)}</strong></td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CashFlow;