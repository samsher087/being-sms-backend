import { Request, Response, NextFunction } from 'express';
import { Timetable } from '../models/Timetable';

export const getClassTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId } = req.params;

    const timetable = await Timetable.findOne({ tenantId, classId })
      .populate('days.periods.teacherId', 'name employeeId')
      .populate('classId', 'className section roomNumber');

    res.json({ success: true, timetable });
  } catch (error) {
    next(error);
  }
};

export const saveClassTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { classId } = req.params;
    const { days, academicSessionId } = req.body;

    // Conflict detection check: Ensure no teacher is scheduled for two different classes at the exact same day & period
    if (Array.isArray(days)) {
      for (const day of days) {
        for (const period of day.periods || []) {
          if (period.teacherId && !period.isBreak) {
            const conflict = await Timetable.findOne({
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
              const conflictCls: any = conflict.classId;
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

    const timetable = await Timetable.findOneAndUpdate(
      { tenantId, classId },
      {
        tenantId,
        classId,
        academicSessionId,
        days,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: 'Class timetable updated successfully.', timetable });
  } catch (error) {
    next(error);
  }
};

export const getTeacherTimetable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { teacherId } = req.params;

    const timetables = await Timetable.find({
      tenantId,
      'days.periods.teacherId': teacherId,
    }).populate('classId', 'className section roomNumber');

    // Aggregate teacher periods by day
    const daysMap: Record<string, any[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    timetables.forEach((tt) => {
      const cls: any = tt.classId;
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
  } catch (error) {
    next(error);
  }
};
