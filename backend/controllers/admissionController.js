"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertEnquiryToStudent = exports.updateEnquiryStatus = exports.listEnquiries = exports.submitPublicEnquiry = void 0;
const Admission_1 = require("../models/Admission");
const Student_1 = require("../models/Student");
const Tenant_1 = require("../models/Tenant");
const ClassSection_1 = require("../models/ClassSection");
const auth_1 = require("../middleware/auth");
const submitPublicEnquiry = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        if (!tenantId) {
            res.status(400).json({ success: false, message: 'School tenant context could not be resolved.' });
            return;
        }
        const { applicantName, gender, dob, classAppliedFor, parentName, relationship, email, phone, address, previousSchool } = req.body;
        const count = await Admission_1.AdmissionEnquiry.countDocuments({ tenantId });
        const year = new Date().getFullYear();
        const applicationNumber = `ENQ-${year}-${String(count + 1).padStart(4, '0')}`;
        const enquiry = await Admission_1.AdmissionEnquiry.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.submitPublicEnquiry = submitPublicEnquiry;
const listEnquiries = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { status, search } = req.query;
        const filter = { tenantId };
        if (status)
            filter.status = status;
        if (search) {
            const regex = new RegExp(String(search), 'i');
            filter.$or = [{ applicantName: regex }, { applicationNumber: regex }, { parentName: regex }, { phone: regex }];
        }
        const enquiries = await Admission_1.AdmissionEnquiry.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, enquiries });
    }
    catch (error) {
        next(error);
    }
};
exports.listEnquiries = listEnquiries;
const updateEnquiryStatus = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const { status, interviewDate, notes } = req.body;
        const enquiry = await Admission_1.AdmissionEnquiry.findOneAndUpdate({ _id: id, tenantId }, { status, interviewDate: interviewDate ? new Date(interviewDate) : undefined, notes }, { new: true });
        if (!enquiry) {
            res.status(404).json({ success: false, message: 'Enquiry not found.' });
            return;
        }
        res.json({ success: true, message: 'Application status updated.', enquiry });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEnquiryStatus = updateEnquiryStatus;
const convertEnquiryToStudent = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const { classId, rollNumber } = req.body;
        const enquiry = await Admission_1.AdmissionEnquiry.findOne({ _id: id, tenantId });
        if (!enquiry) {
            res.status(404).json({ success: false, message: 'Enquiry not found.' });
            return;
        }
        if (enquiry.status === 'ENROLLED' && enquiry.convertedStudentId) {
            res.status(400).json({ success: false, message: 'This applicant is already enrolled as a student.' });
            return;
        }
        const cls = await ClassSection_1.ClassSection.findOne({ _id: classId, tenantId });
        if (!cls) {
            res.status(400).json({ success: false, message: 'Valid class and section assignment is required.' });
            return;
        }
        const tenant = await Tenant_1.Tenant.findById(tenantId);
        const prefix = tenant?.settings?.admissionPrefix || 'ADM';
        const year = new Date().getFullYear();
        const count = await Student_1.Student.countDocuments({ tenantId });
        const admissionNumber = `${prefix}-${year}-${String(count + 1).padStart(4, '0')}`;
        const student = await Student_1.Student.create({
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
        enquiry.convertedStudentId = student._id;
        await enquiry.save();
        await (0, auth_1.recordAuditLog)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.convertEnquiryToStudent = convertEnquiryToStudent;
