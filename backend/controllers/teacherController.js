"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacher = exports.createTeacher = exports.listTeachers = void 0;
const Teacher_1 = require("../models/Teacher");
const User_1 = require("../models/User");
const Tenant_1 = require("../models/Tenant");
const auth_1 = require("../middleware/auth");
const listTeachers = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { department, status, search } = req.query;
        const filter = { tenantId };
        if (department)
            filter.department = department;
        if (status)
            filter.status = status;
        if (search) {
            const regex = new RegExp(String(search), 'i');
            filter.$or = [{ name: regex }, { employeeId: regex }, { email: regex }, { designation: regex }];
        }
        const teachers = await Teacher_1.Teacher.find(filter)
            .populate('assignedClasses.classId', 'className section roomNumber')
            .sort({ employeeId: 1 });
        res.json({ success: true, teachers });
    }
    catch (error) {
        next(error);
    }
};
exports.listTeachers = listTeachers;
const createTeacher = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const tenant = await Tenant_1.Tenant.findById(tenantId);
        if (!tenant) {
            res.status(404).json({ success: false, message: 'Tenant not found.' });
            return;
        }
        // Check staff limits
        const currentStaffCount = await Teacher_1.Teacher.countDocuments({ tenantId, status: 'ACTIVE' });
        if (currentStaffCount >= tenant.subscription.staffLimit) {
            res.status(400).json({
                success: false,
                message: `Tenant staff limit of ${tenant.subscription.staffLimit} reached. Upgrade subscription plan to add more teachers.`,
            });
            return;
        }
        const { employeeId: customId, name, gender, email, phone, designation, department, qualification, salaryPaise, assignedClasses, createUserAccount, } = req.body;
        let employeeId = customId;
        if (!employeeId) {
            const count = await Teacher_1.Teacher.countDocuments({ tenantId });
            employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
        }
        const existing = await Teacher_1.Teacher.findOne({ tenantId, $or: [{ employeeId }, { email: email.toLowerCase() }] });
        if (existing) {
            res.status(400).json({ success: false, message: 'Teacher with this employee ID or email already exists in this school.' });
            return;
        }
        const teacher = await Teacher_1.Teacher.create({
            tenantId,
            employeeId,
            name,
            gender: gender || 'Female',
            email: email.toLowerCase(),
            phone: phone || '',
            designation: designation || 'Teacher',
            department: department || 'General',
            qualification: qualification || 'B.Ed',
            salaryPaise: salaryPaise || 4500000,
            assignedClasses: assignedClasses || [],
            status: 'ACTIVE',
        });
        let teacherUser = null;
        if (createUserAccount !== false) {
            teacherUser = await User_1.User.create({
                name: teacher.name,
                email: teacher.email,
                password: 'Password@123',
                role: 'TEACHER',
                tenantId,
                linkedTeacherId: teacher._id,
                phone: teacher.phone,
            });
        }
        await (0, auth_1.recordAuditLog)({
            tenantId,
            userId: req.userId,
            userName: req.user?.name,
            userRole: req.userRole,
            action: 'TEACHER_CREATED',
            resourceType: 'TEACHER',
            resourceId: teacher._id.toString(),
            details: { employeeId, name, designation },
        });
        res.status(201).json({
            success: true,
            message: 'Teacher added successfully.',
            teacher,
            credentials: teacherUser ? { email: teacherUser.email, defaultPassword: 'Password@123' } : undefined,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTeacher = createTeacher;
const updateTeacher = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const teacher = await Teacher_1.Teacher.findOneAndUpdate({ _id: id, tenantId }, req.body, { new: true });
        if (!teacher) {
            res.status(404).json({ success: false, message: 'Teacher not found.' });
            return;
        }
        res.json({ success: true, message: 'Teacher updated successfully.', teacher });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTeacher = updateTeacher;
