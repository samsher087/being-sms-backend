"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherTimetable = exports.saveClassTimetable = exports.getClassTimetable = void 0;
const Timetable_1 = require("../models/Timetable");
const getClassTimetable = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { classId } = req.params;
        const timetable = await Timetable_1.Timetable.findOne({ tenantId, classId })
            .populate('days.periods.teacherId', 'name employeeId')
            .populate('classId', 'className section roomNumber');
        res.json({ success: true, timetable });
    }
    catch (error) {
        next(error);
    }
};
exports.getClassTimetable = getClassTimetable;
const saveClassTimetable = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { classId } = req.params;
        const { days, academicSessionId } = req.body;
        // Conflict detection check: Ensure no teacher is scheduled for two different classes at the exact same day & period
        if (Array.isArray(days)) {
            for (const day of days) {
                for (const period of day.periods || []) {
                    if (period.teacherId && !period.isBreak) {
                        const conflict = await Timetable_1.Timetable.findOne({
                            tenantId,
                            classId: { $ne: classId },
                            'days.day': day.day,
                            'days.periods': {
                                $elemMatch: {
                                    periodNumber: period.periodNumber,
                                    teacherId: period.teacherId,
                                    isBreak: false,
                                },
                            },
                        }).populate('classId', 'className section');
                        if (conflict) {
                            const conflictCls = conflict.classId;
                            res.status(400).json({
                                success: false,
                                message: `Teacher assignment clash detected: The assigned teacher is already booked on ${day.day} period ${period.periodNumber} in ${conflictCls?.className}-${conflictCls?.section}.`,
                            });
                            return;
                        }
                    }
                }
            }
        }
        const timetable = await Timetable_1.Timetable.findOneAndUpdate({ tenantId, classId }, {
            tenantId,
            classId,
            academicSessionId,
            days,
        }, { upsert: true, new: true, setDefaultsOnInsert: true });
        res.json({ success: true, message: 'Class timetable updated successfully.', timetable });
    }
    catch (error) {
        next(error);
    }
};
exports.saveClassTimetable = saveClassTimetable;
const getTeacherTimetable = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { teacherId } = req.params;
        const timetables = await Timetable_1.Timetable.find({
            tenantId,
            'days.periods.teacherId': teacherId,
        }).populate('classId', 'className section roomNumber');
        // Aggregate teacher periods by day
        const daysMap = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
        };
        timetables.forEach((tt) => {
            const cls = tt.classId;
            tt.days.forEach((d) => {
                d.periods.forEach((p) => {
                    if (p.teacherId && p.teacherId.toString() === teacherId.toString()) {
                        daysMap[d.day].push({
                            periodNumber: p.periodNumber,
                            startTime: p.startTime,
                            endTime: p.endTime,
                            subject: p.subject,
                            className: `${cls?.className} - ${cls?.section}`,
                            roomNumber: p.roomNumber || cls?.roomNumber,
                        });
                    }
                });
            });
        });
        // Sort periods for each day
        Object.keys(daysMap).forEach((day) => {
            daysMap[day].sort((a, b) => a.periodNumber - b.periodNumber);
        });
        res.json({ success: true, teacherSchedule: daysMap });
    }
    catch (error) {
        next(error);
    }
};
exports.getTeacherTimetable = getTeacherTimetable;
