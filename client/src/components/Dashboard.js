import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../api/api';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Summary from './Summary';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await transactionAPI.getAll();
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await transactionAPI.getSummary();
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const response = await transactionAPI.create(transactionData);
      setTransactions([response.data, ...transactions]);
      fetchSummary();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleUpdateTransaction = async (id, transactionData) => {
    try {
      const response = await transactionAPI.update(id, transactionData);
      setTransactions(transactions.map(t => 
        t.id === id ? response.data : t
      ));
      setEditingTransaction(null);
      fetchSummary();
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await transactionAPI.delete(id);
      setTransactions(transactions.filter(t => t.id !== id));
      fetchSummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Nambah pie chart grouping by type (income/expense)
  const pieData = [
    { name: 'Income', value: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) },
    { name: 'Expense', value: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) },
  ];
  const COLORS = ['#82ca9d', '#ff6b6b'];

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Expense Tracker</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <Summary summary={summary} />

      {/* Pie Chartnyh */}
      <div style={{ width: '100%', height: 300, marginBottom: 32 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-content">
        <div className="form-section">
          <TransactionForm
            onSubmit={editingTransaction ? 
              (data) => handleUpdateTransaction(editingTransaction.id, data) : 
              handleAddTransaction
            }
            initialData={editingTransaction}
            isEditing={!!editingTransaction}
            onCancel={() => setEditingTransaction(null)}
          />
        </div>

        <div className="transactions-section">
          <TransactionList
            transactions={transactions}
            onEdit={setEditingTransaction}
            onDelete={handleDeleteTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;