import { Request, Response, NextFunction } from 'express';
import { AdmissionEnquiry } from '../models/Admission';
import { Student } from '../models/Student';
import { Tenant } from '../models/Tenant';
import { ClassSection } from '../models/ClassSection';
import { recordAuditLog } from '../middleware/auth';

export const submitPublicEnquiry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) {
      res.status(400).json({ success: false, message: 'School tenant context could not be resolved.' });
      return;
    }

    const { applicantName, gender, dob, classAppliedFor, parentName, relationship, email, phone, address, previousSchool } = req.body;

    const count = await AdmissionEnquiry.countDocuments({ tenantId });
    const year = new Date().getFullYear();
    const applicationNumber = `ENQ-${year}-${String(count + 1).padStart(4, '0')}`;

    const enquiry = await AdmissionEnquiry.create({
      tenantId,
      applicationNumber,
      applicantName,
      gender: gender || 'Male',
      dob: new Date(dob),
      classAppliedFor,
      parentName,
      relationship: relationship || 'Father',
      email: email.toLowerCase(),
      phone,
      address: address || '',
      previousSchool: previousSchool || '',
      status: 'ENQUIRY',
    });

    res.status(201).json({
      success: true,
      message: 'Admission enquiry submitted successfully. The school admissions office will contact you shortly.',
      applicationNumber,
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const listEnquiries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { status, search } = req.query;

    const filter: any = { tenantId };
    if (status) filter.status = status;
    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [{ applicantName: regex }, { applicationNumber: regex }, { parentName: regex }, { phone: regex }];
    }

    const enquiries = await AdmissionEnquiry.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { status, interviewDate, notes } = req.body;

    const enquiry = await AdmissionEnquiry.findOneAndUpdate(
      { _id: id, tenantId },
      { status, interviewDate: interviewDate ? new Date(interviewDate) : undefined, notes },
      { new: true }
    );

    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found.' });
      return;
    }

    res.json({ success: true, message: 'Application status updated.', enquiry });
  } catch (error) {
    next(error);
  }
};

export const convertEnquiryToStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { classId, rollNumber } = req.body;

    const enquiry = await AdmissionEnquiry.findOne({ _id: id, tenantId });
    if (!enquiry) {
      res.status(404).json({ success: false, message: 'Enquiry not found.' });
      return;
    }

    if (enquiry.status === 'ENROLLED' && enquiry.convertedStudentId) {
      res.status(400).json({ success: false, message: 'This applicant is already enrolled as a student.' });
      return;
    }

    const cls = await ClassSection.findOne({ _id: classId, tenantId });
    if (!cls) {
      res.status(400).json({ success: false, message: 'Valid class and section assignment is required.' });
      return;
    }

    const tenant = await Tenant.findById(tenantId);
    const prefix = tenant?.settings?.admissionPrefix || 'ADM';
    const year = new Date().getFullYear();
    const count = await Student.countDocuments({ tenantId });
    const admissionNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;

    const student = await Student.create({
      tenantId,
      academicSessionId: cls.academicSessionId,
      admissionNumber,
      rollNumber: rollNumber || String(count + 1),
      name: enquiry.applicantName,
      gender: enquiry.gender,
      dob: enquiry.dob,
      classId: cls._id,
      email: enquiry.email,
      phone: enquiry.phone,
      address: { street: enquiry.address, city: 'Delhi', state: 'Delhi', pincode: '110001' },
      parents: {
        fatherName: enquiry.parentName,
        fatherPhone: enquiry.phone,
        emergencyContact: enquiry.phone,
      },
      admissionDate: new Date(),
      status: 'ACTIVE',
    });

    enquiry.status = 'ENROLLED';
    enquiry.convertedStudentId = student._id as any;
    await enquiry.save();

    await recordAuditLog({
      tenantId,
      userId: req.userId,
      userName: req.user?.name,
      userRole: req.userRole,
      action: 'ADMISSION_CONVERTED',
      resourceType: 'STUDENT',
      resourceId: student._id.toString(),
      details: { admissionNumber, studentName: student.name, enquiryId: enquiry._id },
    });

    res.status(201).json({
      success: true,
      message: `Applicant converted successfully! Enrolled as ${student.name} with Admission No. ${admissionNumber}`,
      student,
    });
  } catch (error) {
    next(error);
  }
};
