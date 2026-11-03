import { Request, Response, NextFunction } from 'express';
import { Book, BookIssue } from '../models/Library';

export const listBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { search, category } = req.query;

    const filter: any = { tenantId };
    if (category) filter.category = category;
    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [{ title: regex }, { author: regex }, { isbn: regex }, { accessionNumber: regex }];
    }

    const books = await Book.find(filter).sort({ title: 1 });
    res.json({ success: true, books });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { title, author, isbn, accessionNumber, category, publisher, publishYear, totalCopies, rackLocation } = req.body;

    const count = totalCopies || 1;
    const book = await Book.create({
      tenantId,
      title,
      author,
      isbn: isbn || '',
      accessionNumber,
      category: category || 'General',
      publisher,
      publishYear,
      totalCopies: count,
      availableCopies: count,
      rackLocation: rackLocation || '',
    });

    res.status(201).json({ success: true, message: 'Book cataloged successfully.', book });
  } catch (error) {
    next(error);
  }
};

export const issueBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { bookId, borrowerType, studentId, teacherId, dueDateDays = 14 } = req.body;

    const book = await Book.findOne({ _id: bookId, tenantId });
    if (!book || book.availableCopies <= 0) {
      res.status(400).json({ success: false, message: 'Book is not available for issue.' });
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(dueDateDays));

    const issue = await BookIssue.create({
      tenantId,
      bookId,
      borrowerType: borrowerType || 'STUDENT',
      studentId,
      teacherId,
      issueDate: new Date(),
      dueDate,
      status: 'ISSUED',
    });

    book.availableCopies = Math.max(0, book.availableCopies - 1);
    await book.save();

    res.status(201).json({ success: true, message: 'Book issued successfully.', issue });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { fineINR = 0, remarks } = req.body;

    const issue = await BookIssue.findOne({ _id: id, tenantId });
    if (!issue || issue.status === 'RETURNED') {
      res.status(400).json({ success: false, message: 'Issue record not found or already returned.' });
      return;
    }

    issue.status = 'RETURNED';
    issue.returnDate = new Date();
    issue.finePaise = Math.round(Number(fineINR) * 100);
    issue.remarks = remarks || '';
    await issue.save();

    await Book.findByIdAndUpdate(issue.bookId, { $inc: { availableCopies: 1 } });

    res.json({ success: true, message: 'Book returned successfully.', issue });
  } catch (error) {
    next(error);
  }
};

export const listBookIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { status } = req.query;

    const filter: any = { tenantId };
    if (status) filter.status = status;

    const issues = await BookIssue.find(filter)
      .populate('bookId', 'title author accessionNumber')
      .populate('studentId', 'name admissionNumber rollNumber')
      .populate('teacherId', 'name employeeId')
      .sort({ issueDate: -1 });

    res.json({ success: true, issues });
  } catch (error) {
    next(error);
  }
};
