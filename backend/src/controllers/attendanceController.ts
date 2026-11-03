import { Request, Response, NextFunction } from 'express';
import { Attendance } from '../models/Attendance';
import { Student } from '../models/Student';
import { ClassSection } from '../models/ClassSection';
import { recordAuditLog } from '../middleware/auth';

export const getClassAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId, date } = req.query;

    if (!classId || !date) {
      res.status(400).json({ success: false, message: 'classId and date (YYYY-MM-DD) are required.' });
      return;
    }

    // Get all students enrolled in this class
    const students = await Student.find({ tenantId, classId, status: 'ACTIVE' }).sort({ rollNumber: 1, name: 1 });

    // Check if attendance already recorded for this date
    const attendanceDoc = await Attendance.findOne({ tenantId, classId, date: String(date), type: 'STUDENT' });

    // Build the register
    const register = students.map((std) => {
      const existingRecord = attendanceDoc?.records.find((r) => r.studentId.toString() === std._id.toString());
      return {
        studentId: std._id,
        name: std.name,
        rollNumber: std.rollNumber,
        admissionNumber: std.admissionNumber,
        status: existingRecord ? existingRecord.status : 'PRESENT',
        remarks: existingRecord ? existingRecord.remarks : '',
      };
    });

    res.json({
      success: true,
      isMarked: !!attendanceDoc,
      date,
      classId,
      attendanceId: attendanceDoc?._id,
      register,
    });
  } catch (error) {
    next(error);
  }
};

export const submitAttendance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId, date, records, academicSessionId } = req.body;

    if (!classId || !date || !Array.isArray(records)) {
      res.status(400).json({ success: false, message: 'Invalid attendance submission payload.' });
      return;
    }

    // Check if class exists
    const cls = await ClassSection.findById(classId);
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found.' });
      return;
    }

    const sessionId = academicSessionId || cls.academicSessionId;

    const doc = await Attendance.findOneAndUpdate(
      { tenantId, classId, date, type: 'STUDENT' },
      {
        tenantId,
        academicSessionId: sessionId,
        classId,
        date,
        records,
        markedBy: req.userId,
        type: 'STUDENT',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'ATTENDANCE_RECORDED',
      resourceType: 'ATTENDANCE',
      resourceId: doc._id.toString(),
      details: { classId, date, studentCount: records.length },
    });

    res.json({ success: true, message: 'Attendance recorded successfully.', attendance: doc });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendanceHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { studentId } = req.params;

    const attendanceDocs = await Attendance.find({
      tenantId,
      'records.studentId': studentId,
    }).sort({ date: -1 }).limit(90);

    const history = attendanceDocs.map((doc) => {
      const rec = doc.records.find((r) => r.studentId.toString() === studentId);
      return {
        date: doc.date,
        status: rec?.status || 'ABSENT',
        remarks: rec?.remarks || '',
      };
    });

    const total = history.length;
    const present = history.filter((h) => h.status === 'PRESENT' || h.status === 'LATE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    res.json({
      success: true,
      stats: { total, present, percentage },
      history,
    });
  } catch (error) {
    next(error);
  }
};
