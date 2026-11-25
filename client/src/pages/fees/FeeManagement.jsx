import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PlusCircle,
  AlertCircle,
  FileSpreadsheet,
  Download,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { formatPKR, formatDate } from '../../utils/formatters';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('vouchers'); // 'vouchers', 'defaulters', 'structures'
  const [vouchers, setVouchers] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [structures, setStructures] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Collect Payment Modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [transRef, setTransRef] = useState('');
  const [paySuccess, setPaySuccess] = useState(null);

  // Generate Monthly Vouchers Modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genData, setGenData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/vouchers');
      if (res.data?.success) {
        setVouchers(res.data.vouchers);
      }
    } catch (err) {
      console.error('Failed to load vouchers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaulters = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/defaulters');
      if (res.data?.success) {
        setDefaulters(res.data.defaulters);
        setTotalOutstanding(res.data.totalOutstanding);
      }
    } catch (err) {
      console.error('Failed to load defaulters:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fees/structures');
      if (res.data?.success) {
        setStructures(res.data.structures);
      }
    } catch (err) {
      console.error('Failed to load structures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vouchers') fetchVouchers();
    else if (activeTab === 'defaulters') fetchDefaulters();
    else if (activeTab === 'structures') fetchStructures();
  }, [activeTab]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    const toastId = toast.loading('Processing fee payment...');
    try {
      const res = await api.post('/fees/payments/collect', {
        feeVoucherId: selectedVoucher.id,
        amount: parseFloat(payAmount),
        paymentMethod: payMethod,
        transactionReference: transRef
      });
      if (res.data?.success) {
        toast.success('Fee payment recorded successfully!', { id: toastId });
        setPaySuccess(res.data);
        fetchVouchers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed', { id: toastId });
    }
  };

  const handleGenerateVouchers = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Generating monthly vouchers...');
    try {
      const res = await api.post('/fees/vouchers/generate', genData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Vouchers generated successfully!', { id: toastId });
        setShowGenModal(false);
        fetchVouchers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate vouchers', { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Fee & Tuition Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student fee vouchers, collection receipts, monthly fee structures and defaulters
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <a
            href={`${apiBase}/api/v1/reports/fees/excel`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </a>
          <Button icon={PlusCircle} onClick={() => setShowGenModal(true)}>
            Generate Monthly Vouchers
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-1.5 flex space-x-2">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'vouchers'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Fee Vouchers
        </button>
        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'defaulters'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Fee Defaulters List
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'structures'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Class Fee Structures
        </button>
      </div>

      {/* Tab 1: Fee Vouchers Table */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={8} cols={7} />
            </div>
          ) : vouchers.length === 0 ? (
            <EmptyState
              iconKey="fees"
              title="No fee vouchers found"
              description="Generate monthly fee vouchers or select another session."
              action={
                <Button icon={PlusCircle} onClick={() => setShowGenModal(true)} size="sm">
                  Generate Vouchers
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Voucher No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class</th>
                    <th className="p-3">Month / Year</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Payable</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Remaining</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-bold text-blue-700">{v.voucherNo}</td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900 block">
                          {v.student?.firstName} {v.student?.lastName}
                        </span>
                        <span className="text-[10px] text-slate-400">{v.student?.admissionNo}</span>
                      </td>
                      <td className="p-3">{v.class?.name || 'Class 9'}</td>
                      <td className="p-3">{v.month}/{v.year}</td>
                      <td className="p-3">{formatDate(v.dueDate)}</td>
                      <td className="p-3 font-semibold">{formatPKR(v.totalPayable)}</td>
                      <td className="p-3 font-semibold text-emerald-600">{formatPKR(v.paidAmount)}</td>
                      <td className="p-3 font-semibold text-rose-600">{formatPKR(v.remainingAmount)}</td>
                      <td className="p-3">
                        <Badge variant={v.status === 'paid' ? 'success' : 'warning'}>
                          {v.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {v.status !== 'paid' ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedVoucher(v);
                              setPayAmount(v.remainingAmount);
                              setPaySuccess(null);
                              setShowPayModal(true);
                            }}
                          >
                            Collect Fee
                          </Button>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-xs">Cleared</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Defaulters */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">Total Outstanding Fee Defaulters</h4>
                <p className="text-xs text-amber-700">Students with unpaid fees past due date</p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-amber-900">{formatPKR(totalOutstanding)}</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={6} cols={6} />
              </div>
            ) : defaulters.length === 0 ? (
              <EmptyState
                iconKey="fees"
                title="No fee defaulters"
                description="All student fee accounts are currently cleared and up to date."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Voucher No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Guardian Contact</th>
                      <th className="p-3">Overdue Date</th>
                      <th className="p-3">Outstanding Amount</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {defaulters.map((d) => (
                      <tr key={d.id}>
                        <td className="p-3 font-bold text-blue-700">{d.voucherNo}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          {d.student?.firstName} {d.student?.lastName}
                        </td>
                        <td className="p-3">{d.class?.name}</td>
                        <td className="p-3 font-medium text-slate-700">{d.student?.emergencyContactPhone || '-'}</td>
                        <td className="p-3 text-rose-600 font-semibold">{formatDate(d.dueDate)}</td>
                        <td className="p-3 font-extrabold text-rose-600">{formatPKR(d.remainingAmount)}</td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedVoucher(d);
                              setPayAmount(d.remainingAmount);
                              setPaySuccess(null);
                              setShowPayModal(true);
                            }}
                          >
                            Collect Fee
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Fee Structures */}
      {activeTab === 'structures' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <Loader text="Loading fee structures..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Class</th>
                    <th className="p-3">Fee Category</th>
                    <th className="p-3">Amount (PKR)</th>
                    <th className="p-3">Due Day</th>
                    <th className="p-3">Academic Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {structures.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-slate-900">{s.class?.name}</td>
                      <td className="p-3 font-medium">{s.category?.name}</td>
                      <td className="p-3 font-bold text-emerald-600">{formatPKR(s.amount)}</td>
                      <td className="p-3">{s.dueDateDay}th of each month</td>
                      <td className="p-3">{s.academicSession?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Collect Fee Payment Modal */}
      <Modal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        title={`Receive Fee Payment: ${selectedVoucher?.voucherNo}`}
      >
        {paySuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Payment Successfully Recorded!</h4>
            <p className="text-xs text-slate-500">
              Official Receipt No: <strong className="font-mono text-slate-800">{paySuccess.receiptNo}</strong>
            </p>
            <div className="pt-3">
              <Button onClick={() => setShowPayModal(false)}>Close & Refresh</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800">
                Student: {selectedVoucher?.student?.firstName} {selectedVoucher?.student?.lastName}
              </p>
              <p className="text-slate-500 mt-0.5">
                Remaining Balance: <strong className="text-rose-600 font-bold">{formatPKR(selectedVoucher?.remainingAmount)}</strong>
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount to Pay (PKR) *</label>
              <input
                type="number"
                required
                max={selectedVoucher?.remainingAmount}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="cash">Cash Counter</option>
                <option value="bank_transfer">HBL / Meezan Bank Transfer</option>
                <option value="easypaisa">Easypaisa</option>
                <option value="jazzcash">JazzCash</option>
                <option value="cheque">Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Cheque No</label>
              <input
                type="text"
                value={transRef}
                onChange={(e) => setTransRef(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="e.g. HBL-FT-12345"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
              <Button variant="secondary" onClick={() => setShowPayModal(false)}>Cancel</Button>
              <Button type="submit">Submit & Generate Receipt</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Generate Monthly Vouchers Modal */}
      <Modal
        isOpen={showGenModal}
        onClose={() => setShowGenModal(false)}
        title="Generate Monthly Fee Vouchers"
      >
        <form onSubmit={handleGenerateVouchers} className="space-y-4 text-xs">
          <p className="text-slate-600">
            Automatically create monthly tuition vouchers for all active students based on class fee structures.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                required
                value={genData.month}
                onChange={(e) => setGenData({ ...genData, month: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year</label>
              <input
                type="number"
                required
                value={genData.year}
                onChange={(e) => setGenData({ ...genData, year: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="date"
                required
                value={genData.issueDate}
                onChange={(e) => setGenData({ ...genData, issueDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                required
                value={genData.dueDate}
                onChange={(e) => setGenData({ ...genData, dueDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowGenModal(false)}>Cancel</Button>
            <Button type="submit">Run Batch Voucher Generation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeManagement;

