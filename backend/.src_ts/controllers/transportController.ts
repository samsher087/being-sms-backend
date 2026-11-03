import { Request, Response, NextFunction } from 'express';
import { TransportRoute } from '../models/Transport';

export const listRoutes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const routes = await TransportRoute.find({ tenantId })
      .populate('assignedStudentIds', 'name admissionNumber rollNumber')
      .sort({ routeName: 1 });

    res.json({ success: true, routes });
  } catch (error) {
    next(error);
  }
};

export const createRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { routeName, vehicleNumber, vehicleModel, driverName, driverPhone, capacity, stops } = req.body;

    const route = await TransportRoute.create({
      tenantId,
      routeName,
      vehicleNumber,
      vehicleModel,
      driverName,
      driverPhone,
      capacity: capacity || 32,
      stops: stops || [],
      status: 'ACTIVE',
    });

    res.status(201).json({ success: true, message: 'Transport route created successfully.', route });
  } catch (error) {
    next(error);
  }
};

export const assignStudentToRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { studentId } = req.body;

    const route = await TransportRoute.findOneAndUpdate(
      { _id: id, tenantId },
      { $addToSet: { assignedStudentIds: studentId } },
      { new: true }
    );

    if (!route) {
      res.status(404).json({ success: false, message: 'Route not found.' });
      return;
    }

    res.json({ success: true, message: 'Student assigned to bus route.', route });
  } catch (error) {
    next(error);
  }
};
