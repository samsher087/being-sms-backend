import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { Attendance } from '../models/Attendance';
import { FeePayment } from '../models/Fee';
import { recordAuditLog } from '../middleware/auth';

export const listStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId, search, status, page = '1', limit = '15' } = req.query;

    const filter: any = { tenantId };

    if (classId) {
      filter.classId = classId;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { admissionNumber: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'parents.fatherName': searchRegex },
        { 'parents.motherName': searchRegex },
        { 'parents.fatherPhone': searchRegex },
        { 'parents.emergencyContact': searchRegex },
      ];
    }

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .populate('classId', 'className section roomNumber')
      .sort({ admissionNumber: 1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const student = await Student.findOne({ _id: id, tenantId })
      .populate('classId', 'className section roomNumber subjects')
      .populate('academicSessionId', 'name');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student record not found.' });
      return;
    }

    // Attendance summary
    const attendanceRecords = await Attendance.find({
      tenantId,
      'records.studentId': student._id,
    });

    let totalDays = attendanceRecords.length;
    let presentDays = 0;

    attendanceRecords.forEach((att) => {
      const rec = att.records.find((r) => r.studentId.toString() === student._id.toString());
      if (rec && (rec.status === 'PRESENT' || rec.status === 'LATE')) {
        presentDays++;
      }
    });

    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    // Fee payments summary
    const payments = await FeePayment.find({ tenantId, studentId: student._id }).sort({ paymentDate: -1 });
    const totalPaidPaise = payments.reduce((acc, p) => acc + (p.status !== 'REVERSED' ? p.paidPaise : 0), 0);

    res.json({
      success: true,
      student,
      stats: {
        attendanceRate,
        totalAttendanceDays: totalDays,
        presentDays,
        totalPaidINR: (totalPaidPaise / 100).toFixed(2),
        paymentCount: payments.length,
      },
      recentPayments: payments.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      res.status(404).json({ success: false, message: 'Tenant not found.' });
      return;
    }

    // Check student limits under subscription
    const currentCount = await Student.countDocuments({ tenantId, status: 'ACTIVE' });
    if (currentCount >= tenant.subscription.studentLimit) {
      res.status(400).json({
        success: false,
        message: `Tenant student limit of ${tenant.subscription.studentLimit} reached. Upgrade subscription plan to admit more students.`,
      });
      return;
    }

    const {
      name,
      gender,
      dob,
      bloodGroup,
      email,
      phone,
      classId,
      academicSessionId,
      rollNumber,
      admissionNumber: customAdm,
      address,
      parents,
      concessionPercent,
      createUserAccount,
      createParentAccount,
    } = req.body;

    // Auto-generate admission number if not provided
    let admissionNumber = customAdm;
    if (!admissionNumber) {
      const prefix = tenant.settings?.admissionPrefix || 'ADM';
      const year = new Date().getFullYear();
      const count = await Student.countDocuments({ tenantId });
      admissionNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
    }

    const existing = await Student.findOne({ tenantId, admissionNumber });
    if (existing) {
      res.status(400).json({ success: false, message: `Admission number ${admissionNumber} is already in use.` });
      return;
    }

    const student = await Student.create({
      tenantId,
      academicSessionId: academicSessionId || tenant.settings?.currentSessionId,
      admissionNumber,
      rollNumber: rollNumber || '',
      name,
      gender,
      dob: new Date(dob),
      bloodGroup: bloodGroup || 'B+',
      email: email || '',
      phone: phone || '',
      classId,
      address: address || {},
      parents: parents || {},
      concessionPercent: concessionPercent || 0,
      admissionDate: new Date(),
      status: 'ACTIVE',
    });

    // Optionally create user account for student
    let studentUser = null;
    if (createUserAccount && email) {
      studentUser = await User.create({
        name: student.name,
        email: email.toLowerCase(),
        password: 'Password@123',
        role: 'STUDENT',
        tenantId,
        linkedStudentId: student._id,
      });
    }

    // Optionally create user account for parent
    if (createParentAccount && parents?.fatherPhone) {
      const parentEmail = `parent.${student.admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@dps.edu.in`;
      await User.create({
        name: parents.fatherName || `Guardian of ${student.name}`,
        email: parentEmail,
        password: 'Password@123',
        role: 'PARENT',
        tenantId,
        phone: parents.fatherPhone,
        linkedChildrenIds: [student._id],
      });
    }

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'STUDENT_ADMITTED',
      resourceType: 'STUDENT',
      resourceId: student._id.toString(),
      details: { admissionNumber, name, classId },
    });

    res.status(201).json({
      success: true,
      message: 'Student admitted successfully.',
      student,
      credentials: studentUser ? { email: studentUser.email, defaultPassword: 'Password@123' } : undefined,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const student = await Student.findOneAndUpdate({ _id: id, tenantId }, req.body, { new: true });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found.' });
      return;
    }

    res.json({ success: true, message: 'Student updated successfully.', student });
  } catch (error) {
    next(error);
  }
};

export const bulkImportStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ success: false, message: 'Please provide an array of student records.' });
      return;
    }

    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < students.length; i++) {
      const item = students[i];
      try {
        if (!item.name || !item.classId) {
          errors.push(`Row ${i + 1}: Missing student name or classId.`);
          continue;
        }

        const count = await Student.countDocuments({ tenantId });
        const adm = item.admissionNumber || `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

        await Student.create({
          tenantId,
          academicSessionId: item.academicSessionId,
          admissionNumber: adm,
          rollNumber: item.rollNumber || String(i + 1),
          name: item.name,
          gender: item.gender || 'Male',
          dob: item.dob ? new Date(item.dob) : new Date('2012-05-15'),
          classId: item.classId,
          parents: {
            fatherName: item.fatherName || 'Guardian',
            fatherPhone: item.fatherPhone || '+91 98765 00000',
            emergencyContact: item.emergencyContact || '+91 98765 00000',
          },
          status: 'ACTIVE',
        });
        imported++;
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${item.name}): ${err.message}`);
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${imported} students.`,
      importedCount: imported,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    next(error);
  }
};
