import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, Bookmark, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { formatPKR, formatDate } from '../../utils/formatters';

const LibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    isbn: '',
    author: '',
    publisher: '',
    categoryId: 1,
    rackNo: 'A-01',
    totalCopies: 5,
    price: 1500
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, issueRes] = await Promise.all([
        api.get('/library/books'),
        api.get('/library/issues')
      ]);
      if (bookRes.data?.success) {
        setBooks(bookRes.data.books);
        setCategories(bookRes.data.categories);
        if (bookRes.data.categories?.[0]) {
          setNewBook((prev) => ({ ...prev, categoryId: bookRes.data.categories[0].id }));
        }
      }
      if (issueRes.data?.success) {
        setIssues(issueRes.data.issues);
      }
    } catch (err) {
      console.error('Failed to load library data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/library/books', newBook);
      if (res.data?.success) {
        toast.success('Book added to library successfully');
        setShowAddModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Library Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Book catalog, rack allocations, and student/faculty book borrowing history
          </p>
        </div>
        <Button icon={PlusCircle} onClick={() => setShowAddModal(true)}>
          Add New Book
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-1.5 flex space-x-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'books' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'issues' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Issued Books & Due Dates ({issues.length})
        </button>
      </div>

      {loading ? (
        <Loader text="Loading library system..." />
      ) : activeTab === 'books' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">ISBN</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rack No</th>
                  <th className="p-3">Copies Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {books.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-bold text-slate-900">{b.title}</td>
                    <td className="p-3 font-medium">{b.author}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{b.isbn || '-'}</td>
                    <td className="p-3">{b.category?.name}</td>
                    <td className="p-3 font-semibold text-blue-700">{b.rackNo || '-'}</td>
                    <td className="p-3">
                      <Badge variant={b.availableCopies > 0 ? 'success' : 'danger'}>
                        {b.availableCopies} of {b.totalCopies} Available
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Borrower</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {issues.map((iss) => (
                  <tr key={iss.id}>
                    <td className="p-3 font-bold text-slate-900">{iss.book?.title}</td>
                    <td className="p-3 font-medium">
                      {iss.student?.firstName || iss.teacher?.firstName} {iss.student?.lastName || iss.teacher?.lastName}
                    </td>
                    <td className="p-3">{formatDate(iss.issueDate)}</td>
                    <td className="p-3 font-semibold text-rose-600">{formatDate(iss.dueDate)}</td>
                    <td className="p-3"><Badge variant="primary">{iss.status.toUpperCase()}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Book to Library">
        <form onSubmit={handleCreateBook} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              placeholder="e.g. Oxford Progressive English"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Author *</label>
              <input
                type="text"
                required
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="Author name"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ISBN</label>
              <input
                type="text"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="978-019..."
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Copies *</label>
              <input
                type="number"
                required
                min="1"
                value={newBook.totalCopies}
                onChange={(e) => setNewBook({ ...newBook, totalCopies: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rack / Shelf No</label>
              <input
                type="text"
                value={newBook.rackNo}
                onChange={(e) => setNewBook({ ...newBook, rackNo: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                placeholder="e.g. PHY-02"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Add Book</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LibraryPage;

