import React from 'react';

const Summary = ({ summary }) => {
  return (
    <div className="summary">
      <div className="summary-card income">
        <h3>Total Income</h3>
        <p className="amount">${parseFloat(summary.total_income).toFixed(2)}</p>
      </div>
      
      <div className="summary-card expense">
        <h3>Total Expenses</h3>
        <p className="amount">${parseFloat(summary.total_expenses).toFixed(2)}</p>
      </div>
      
      <div className={`summary-card balance ${parseFloat(summary.balance) >= 0 ? 'positive' : 'negative'}`}>
        <h3>Balance</h3>
        <p className="amount">${parseFloat(summary.balance).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default Summary;