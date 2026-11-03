import { Request, Response, NextFunction } from 'express';
import { Notice } from '../models/Notice';
import { Assignment } from '../models/Assignment';
import { recordAuditLog } from '../middleware/auth';

// NOTICES
export const listNotices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const userRole = req.userRole;

    const filter: any = { tenantId };

    // Role-based targeting filter
    if (userRole === 'STUDENT') {
      filter.targetRole = { $in: ['ALL', 'STUDENTS'] };
    } else if (userRole === 'PARENT') {
      filter.targetRole = { $in: ['ALL', 'PARENTS'] };
    } else if (userRole === 'TEACHER') {
      filter.targetRole = { $in: ['ALL', 'TEACHERS'] };
    }

    const notices = await Notice.find(filter)
      .populate('postedBy', 'name role')
      .sort({ isPinned: -1, publishDate: -1 });

    res.json({ success: true, notices });
  } catch (error) {
    next(error);
  }
};

export const createNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { title, content, targetRole, priority, classId, isPinned, expiryDate } = req.body;

    const notice = await Notice.create({
      tenantId,
      title,
      content,
      targetRole: targetRole || 'ALL',
      priority: priority || 'NORMAL',
      classId,
      isPinned: !!isPinned,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      postedBy: req.userId,
    });

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'NOTICE_PUBLISHED',
      resourceType: 'NOTICE',
      resourceId: notice._id.toString(),
      details: { title, targetRole },
    });

    res.status(201).json({ success: true, message: 'Notice published successfully.', notice });
  } catch (error) {
    next(error);
  }
};

export const deleteNotice = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    await Notice.findOneAndDelete({ _id: id, tenantId });
    res.json({ success: true, message: 'Notice removed successfully.' });
  } catch (error) {
    next(error);
  }
};

// ASSIGNMENTS & HOMEWORK
export const listAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId, subject } = req.query;

    const filter: any = { tenantId };
    if (classId) filter.classId = classId;
    if (subject) filter.subject = subject;

    const assignments = await Assignment.find(filter)
      .populate('classId', 'className section')
      .populate('teacherId', 'name employeeId')
      .sort({ dueDate: 1 });

    res.json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId, teacherId, subject, title, instructions, dueDate, maxMarks, academicSessionId } = req.body;

    const assignment = await Assignment.create({
      tenantId,
      academicSessionId,
      classId,
      teacherId: teacherId || req.user?.linkedTeacherId,
      subject,
      title,
      instructions,
      dueDate: new Date(dueDate),
      maxMarks: maxMarks || 20,
    });

    res.status(201).json({ success: true, message: 'Assignment posted successfully.', assignment });
  } catch (error) {
    next(error);
  }
};
