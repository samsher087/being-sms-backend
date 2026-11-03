import { Request, Response, NextFunction } from 'express';
import { AcademicSession } from '../models/AcademicSession';
import { ClassSection } from '../models/ClassSection';
import { Tenant } from '../models/Tenant';
import { Student } from '../models/Student';

// SESSIONS 
export const listSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const sessions = await AcademicSession.find({ tenantId }).sort({ startDate: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { name, startDate, endDate, isCurrent } = req.body;

    if (isCurrent) {
      await AcademicSession.updateMany({ tenantId }, { isCurrent: false });
    }

    const session = await AcademicSession.create({
      tenantId,
      name,
      startDate,
      endDate,
      isCurrent: !!isCurrent,
      status: 'ACTIVE',
    });

    if (isCurrent) {
      await Tenant.findByIdAndUpdate(tenantId, { 'settings.currentSessionId': session._id });
    }

    res.status(201).json({ success: true, message: 'Academic session created.', session });
  } catch (error) {
    next(error);
  }
};

export const setCurrentSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    await AcademicSession.updateMany({ tenantId }, { isCurrent: false });
    const session = await AcademicSession.findOneAndUpdate(
      { _id: id, tenantId },
      { isCurrent: true },
      { new: true }
    );

    await Tenant.findByIdAndUpdate(tenantId, { 'settings.currentSessionId': id });

    res.json({ success: true, message: 'Current academic session updated.', session });
  } catch (error) {
    next(error);
  }
};

// CLASSES & SECTIONS
export const listClasses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { sessionId } = req.query;

    const filter: any = { tenantId };
    if (sessionId) {
      filter.academicSessionId = sessionId;
    }

    const classes = await ClassSection.find(filter)
      .populate('classTeacherId', 'name employeeId email phone')
      .populate('subjects.teacherId', 'name employeeId')
      .sort({ className: 1, section: 1 });

    // Attach student count
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classId: cls._id, status: 'ACTIVE' });
        return {
          ...cls.toObject(),
          studentCount,
        };
      })
    );

    res.json({ success: true, classes: classesWithCounts });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { className, section, academicSessionId, roomNumber, capacity, classTeacherId, subjects } = req.body;

    const existing = await ClassSection.findOne({
      tenantId,
      academicSessionId,
      className,
      section: section.toUpperCase(),
    });

    if (existing) {
      res.status(400).json({ success: false, message: `Class ${className}-${section} already exists in this session.` });
      return;
    }

    const newClass = await ClassSection.create({
      tenantId,
      academicSessionId,
      className,
      section: section.toUpperCase(),
      roomNumber,
      capacity: capacity || 40,
      classTeacherId,
      subjects: subjects || [
        { name: 'English Core', code: 'ENG101', maxMarks: 100, passingMarks: 33 },
        { name: 'Mathematics', code: 'MATH101', maxMarks: 100, passingMarks: 33 },
        { name: 'Science', code: 'SCI101', maxMarks: 100, passingMarks: 33 },
        { name: 'Social Studies', code: 'SST101', maxMarks: 100, passingMarks: 33 },
        { name: 'Hindi', code: 'HIN101', maxMarks: 100, passingMarks: 33 },
      ],
    });

    res.status(201).json({ success: true, message: 'Class created successfully.', class: newClass });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const updated = await ClassSection.findOneAndUpdate(
      { _id: id, tenantId },
      req.body,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }

    res.json({ success: true, message: 'Class updated successfully.', class: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const activeStudents = await Student.countDocuments({ classId: id, status: 'ACTIVE' });
    if (activeStudents > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete class. There are currently ${activeStudents} active students enrolled. Transfer them first.`,
      });
      return;
    }

    await ClassSection.findOneAndDelete({ _id: id, tenantId });
    res.json({ success: true, message: 'Class deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
