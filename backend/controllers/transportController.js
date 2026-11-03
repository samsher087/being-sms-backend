"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStudentToRoute = exports.createRoute = exports.listRoutes = void 0;
const Transport_1 = require("../models/Transport");
const listRoutes = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const routes = await Transport_1.TransportRoute.find({ tenantId })
            .populate('assignedStudentIds', 'name admissionNumber rollNumber')
            .sort({ routeName: 1 });
        res.json({ success: true, routes });
    }
    catch (error) {
        next(error);
    }
};
exports.listRoutes = listRoutes;
const createRoute = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { routeName, vehicleNumber, vehicleModel, driverName, driverPhone, capacity, stops } = req.body;
        const route = await Transport_1.TransportRoute.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createRoute = createRoute;
const assignStudentToRoute = async (req, res, next) => {
    try {
        const tenantId = req.tenantId;
        const { id } = req.params;
        const { studentId } = req.body;
        const route = await Transport_1.TransportRoute.findOneAndUpdate({ _id: id, tenantId }, { $addToSet: { assignedStudentIds: studentId } }, { new: true });
        if (!route) {
            res.status(404).json({ success: false, message: 'Route not found.' });
            return;
        }
        res.json({ success: true, message: 'Student assigned to bus route.', route });
    }
    catch (error) {
        next(error);
    }
};
exports.assignStudentToRoute = assignStudentToRoute;
