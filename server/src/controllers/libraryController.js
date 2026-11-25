const { Book, BookCategory, LibraryIssue, Student, Teacher } = require('../models');

// BOOKS
const getBooks = async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;
    const where = {};
    if (categoryId) where.categoryId = categoryId;

    const books = await Book.findAll({
      where,
      order: [['title', 'ASC']],
      include: [{ model: BookCategory, as: 'category' }]
    });

    const categories = await BookCategory.findAll();

    return res.status(200).json({ success: true, books, categories });
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { title, isbn, author, publisher, categoryId, rackNo, totalCopies = 1, price } = req.body;
    const book = await Book.create({
      title,
      isbn,
      author,
      publisher,
      categoryId,
      rackNo,
      totalCopies,
      availableCopies: totalCopies,
      price
    });
    return res.status(201).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// ISSUES
const getIssues = async (req, res, next) => {
  try {
    const issues = await LibraryIssue.findAll({
      order: [['issueDate', 'DESC']],
      include: [
        { model: Book, as: 'book' },
        { model: Student, as: 'student', attributes: ['id', 'admissionNo', 'firstName', 'lastName'] },
        { model: Teacher, as: 'teacher', attributes: ['id', 'employeeId', 'firstName', 'lastName'] }
      ]
    });
    return res.status(200).json({ success: true, issues });
  } catch (error) {
    next(error);
  }
};

const issueBook = async (req, res, next) => {
  try {
    const { bookId, borrowerType, borrowerId, dueDate } = req.body;
    const book = await Book.findByPk(bookId);

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'Book is not available for issue.' });
    }

    const issue = await LibraryIssue.create({
      bookId,
      borrowerType,
      studentId: borrowerType === 'student' ? borrowerId : null,
      teacherId: borrowerType === 'teacher' ? borrowerId : null,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'issued',
      issuedById: req.user?.id
    });

    await book.update({ availableCopies: book.availableCopies - 1 });

    return res.status(201).json({ success: true, issue });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  createBook,
  getIssues,
  issueBook
};

