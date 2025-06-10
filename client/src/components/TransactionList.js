import React from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-list">
        <h3>Recent Transactions</h3>
        <p className="no-transactions">No transactions found. Add your first transaction!</p>
      </div>
    );
  }

  return (
    <div className="transaction-list">
      <h3>Recent Transactions</h3>
      <div className="transactions">
        {transactions.map(transaction => (
          <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
            <div className="transaction-info">
              <div className="transaction-main">
                <span className="description">{transaction.description}</span>
                <span className={`amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}$
                  {parseFloat(transaction.amount).toFixed(2)}
                </span>
              </div>
              <div className="transaction-details">
                <span className="category">{transaction.category}</span>
                <span className="date">{formatDate(transaction.date)}</span>
              </div>
            </div>
            <div className="transaction-actions">
              <button 
                onClick={() => onEdit(transaction)}
                className="edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(transaction.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList;