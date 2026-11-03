import { Request, Response, NextFunction } from 'express';
import { ExamSchedule, ExamResult } from '../models/Exam';
import { Student } from '../models/Student';
import { Tenant } from '../models/Tenant';
import { recordAuditLog } from '../middleware/auth';

const calculateCBSEGrade = (percentage: number): string => {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E (Needs Improvement)';
};

export const listExamSchedules = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId } = req.query;

    const filter: any = { tenantId };
    if (classId) {
      filter.classIds = classId;
    }

    const exams = await ExamSchedule.find(filter)
      .populate('classIds', 'className section')
      .sort({ startDate: -1 });

    res.json({ success: true, exams });
  } catch (error) {
    next(error);
  }
};

export const createExamSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { name, examType, classIds, subjects, startDate, endDate, academicSessionId } = req.body;

    const exam = await ExamSchedule.create({
      tenantId,
      academicSessionId,
      name,
      examType: examType || 'TERM_1',
      classIds: classIds || [],
      subjects: subjects || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'UPCOMING',
    });

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'EXAM_SCHEDULED',
      resourceType: 'EXAM',
      resourceId: exam._id.toString(),
      details: { name, examType },
    });

    res.status(201).json({ success: true, message: 'Examination schedule created successfully.', exam });
  } catch (error) {
    next(error);
  }
};

export const submitStudentMarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { examId, studentId, classId, subjectMarks, teacherRemarks } = req.body;

    let totalObtained = 0;
    let totalMax = 0;

    const formattedMarks = (subjectMarks || []).map((sm: any) => {
      const marksObt = Number(sm.marksObtained || 0);
      const maxM = Number(sm.maxMarks || 100);
      totalObtained += marksObt;
      totalMax += maxM;
      const subPct = maxM > 0 ? (marksObt / maxM) * 100 : 0;
      return {
        subjectName: sm.subjectName,
        subjectCode: sm.subjectCode,
        marksObtained: marksObt,
        maxMarks: maxM,
        grade: calculateCBSEGrade(subPct),
        remarks: sm.remarks || '',
      };
    });

    const percentage = totalMax > 0 ? parseFloat(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    const overallGrade = calculateCBSEGrade(percentage);
    const resultStatus = percentage >= 33 ? 'PASS' : 'FAIL';

    const result = await ExamResult.findOneAndUpdate(
      { tenantId, examId, studentId },
      {
        tenantId,
        examId,
        studentId,
        classId,
        subjectMarks: formattedMarks,
        totalObtained,
        totalMax,
        percentage,
        overallGrade,
        resultStatus,
        teacherRemarks: teacherRemarks || 'Good academic effort shown.',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Student marks saved successfully.', result });
  } catch (error) {
    next(error);
  }
};

export const getStudentReportCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { examId, studentId } = req.params;

    const result = await ExamResult.findOne({ tenantId, examId, studentId })
      .populate('studentId')
      .populate('classId', 'className section')
      .populate('examId', 'name examType startDate endDate');

    if (!result) {
      res.status(404).json({ success: false, message: 'Examination marks not yet entered for this student.' });
      return;
    }

    const tenant = await Tenant.findById(tenantId);

    res.json({
      success: true,
      reportCard: {
        ...result.toObject(),
        school: {
          name: tenant?.name,
          logo: tenant?.logo,
          address: tenant?.contact?.address,
          tagline: tenant?.tagline,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getClassResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { examId, classId } = req.params;

    const results = await ExamResult.find({ tenantId, examId, classId })
      .populate('studentId', 'name admissionNumber rollNumber')
      .sort({ percentage: -1 });

    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
};
