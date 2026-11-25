import React, { useState, useEffect } from 'react';
import { DollarSign, PlusCircle, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatPKR, formatDate } from '../../utils/formatters';

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses', 'incomes', 'salaries'
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [loading, setLoading] = useState(true);

  // New Expense modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [newExp, setNewExp] = useState({
    category: 'Utility Bills',
    title: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, incRes, salRes] = await Promise.all([
        api.get('/finance/expenses'),
        api.get('/finance/incomes'),
        api.get('/finance/salaries')
      ]);
      if (expRes.data?.success) {
        setExpenses(expRes.data.expenses);
        setTotalExpenses(expRes.data.totalAmount);
      }
      if (incRes.data?.success) {
        setIncomes(incRes.data.incomes);
        setTotalIncomes(incRes.data.totalAmount);
      }
      if (salRes.data?.success) {
        setSalaries(salRes.data.salaries);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/finance/expenses', newExp);
      if (res.data?.success) {
        toast.success('Expense recorded successfully');
        setShowExpModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Accounts & Financial Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational expenses, non-fee revenues, and staff salary disbursements
          </p>
        </div>
        <Button icon={PlusCircle} onClick={() => setShowExpModal(true)}>
          Record School Expense
        </Button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Expenses</span>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatPKR(totalExpenses)}</h3>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Auxiliary Incomes</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatPKR(totalIncomes)}</h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Currency</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">Pakistani Rupee</h3>
            <span className="text-xs text-slate-400">PKR (₨)</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-1.5 flex space-x-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Expenses Ledger
        </button>
        <button
          onClick={() => setActiveTab('incomes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'incomes' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Auxiliary Incomes
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'salaries' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Salary Records
        </button>
      </div>

      {/* Expenses Table */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <Loader text="Loading expenses..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Ref No</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Title / Expense Item</th>
                    <th className="p-3">Amount (PKR)</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-3 font-mono font-bold text-slate-800">{exp.referenceNo}</td>
                      <td className="p-3 font-semibold text-blue-700">{exp.category}</td>
                      <td className="p-3">{exp.title}</td>
                      <td className="p-3 font-bold text-rose-600">{formatPKR(exp.amount)}</td>
                      <td className="p-3 capitalize">{exp.paymentMethod?.replace('_', ' ')}</td>
                      <td className="p-3">{formatDate(exp.expenseDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Incomes Table */}
      {activeTab === 'incomes' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <Loader text="Loading incomes..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Title / Revenue Source</th>
                    <th className="p-3">Amount (PKR)</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {incomes.map((inc) => (
                    <tr key={inc.id}>
                      <td className="p-3 font-semibold text-blue-700">{inc.category}</td>
                      <td className="p-3 font-medium text-slate-900">{inc.title}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatPKR(inc.amount)}</td>
                      <td className="p-3">{formatDate(inc.incomeDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Salary Records */}
      {activeTab === 'salaries' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <Loader text="Loading salary records..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Month / Year</th>
                    <th className="p-3">Net Salary</th>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {salaries.map((sal) => (
                    <tr key={sal.id}>
                      <td className="p-3 font-semibold text-slate-900">
                        {sal.teacher?.firstName || sal.staff?.firstName} {sal.teacher?.lastName || sal.staff?.lastName}
                      </td>
                      <td className="p-3 uppercase font-medium text-slate-500">{sal.employeeType}</td>
                      <td className="p-3">{sal.month}/{sal.year}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatPKR(sal.netSalary)}</td>
                      <td className="p-3">{formatDate(sal.paymentDate)}</td>
                      <td className="p-3"><Badge variant="success">PAID</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Record Expense Modal */}
      <Modal isOpen={showExpModal} onClose={() => setShowExpModal(false)} title="Record Operational Expense">
        <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={newExp.category}
              onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="Utility Bills">Utility Bills (Electricity, Gas, Water)</option>
              <option value="Maintenance">Campus Maintenance & Generator</option>
              <option value="Stationery">Stationery & Printing</option>
              <option value="Rent">Campus Rent</option>
              <option value="Events">School Events & Sports</option>
              <option value="Other">Other Miscellaneous</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title / Details *</label>
            <input
              type="text"
              required
              value={newExp.title}
              onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. LESCO Electricity Bill"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
            <input
              type="number"
              required
              value={newExp.amount}
              onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold"
              placeholder="e.g. 45000"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expense Date *</label>
            <input
              type="date"
              required
              value={newExp.expenseDate}
              onChange={(e) => setNewExp({ ...newExp, expenseDate: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowExpModal(false)}>Cancel</Button>
            <Button type="submit">Record Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinancePage;

