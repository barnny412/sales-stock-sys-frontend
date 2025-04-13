import React, { useState, useEffect } from "react";
import { fetchCashFlow } from "../api/cashFlowAPI"; // API function
import "../assets/styles/cashflow.css"; // CSS for styling

const CashFlow = () => {
  const [cashflow, setCashflow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [currentTab, setCurrentTab] = useState("today"); // "today" | "all"

  useEffect(() => {
    const getCashflow = async () => {
      try {
        const data = await fetchCashFlow();
        console.log(data);

        if (data.length > 0) {
          const openingBal = Number(data[0]?.opening_balance) || 0;
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
          setCashflow([]);
          setClosingBalance(0);
        }
      } catch (error) {
        console.error("Failed to fetch cash flow data");
      } finally {
        setLoading(false);
      }
    };
    getCashflow();
  }, []);

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  // Filter cash flow based on selected tab
  const filteredCashFlow = cashflow.filter((entry) =>
    currentTab === "today" ? entry.date === todayDate : true
  );

  return (
    <div className="cashflow-container">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={currentTab === "today" ? "active" : ""}
          onClick={() => setCurrentTab("today")}
        >
          Today's Cash Flow
        </button>
        <button
          className={currentTab === "all" ? "active" : ""}
          onClick={() => setCurrentTab("all")}
        >
          All Cash Flow
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
