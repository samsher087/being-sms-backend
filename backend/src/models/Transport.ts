import mongoose, { Document, Schema } from 'mongoose';

export interface IRouteStop {
  stopName: string;
  pickupTime: string; // e.g. "07:15 AM"
  dropTime: string; // e.g. "02:45 PM"
  monthlyFeePaise: number;
}

export interface ITransportRoute extends Document {
  tenantId: mongoose.Types.ObjectId;
  routeName: string; // e.g. "Route 4 - Rohini Sector 15 to School"
  vehicleNumber: string; // e.g. "DL-1V-4920"
  vehicleModel: string; // e.g. "Tata Starbus 32 Seater"
  driverName: string;
  driverPhone: string;
  driverLicense: string;
  attendantName?: string;
  attendantPhone?: string;
  capacity: number;
  stops: IRouteStop[];
  assignedStudentIds: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
}

const RouteStopSchema = new Schema<IRouteStop>(
  {
    stopName: { type: String, required: true },
    pickupTime: { type: String, required: true },
    dropTime: { type: String, required: true },
    monthlyFeePaise: { type: Number, default: 200000 }, // ₹2,000
  },
  { _id: false }
);

const TransportRouteSchema = new Schema<ITransportRoute>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    routeName: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleModel: { type: String, default: 'School Bus' },
    driverName: { type: String, required: true },
    driverPhone: { type: String, required: true },
    driverLicense: { type: String, default: '' },
    attendantName: { type: String, default: '' },
    attendantPhone: { type: String, default: '' },
    capacity: { type: Number, default: 32 },
    stops: [RouteStopSchema],
    assignedStudentIds: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    status: { type: String, enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

TransportRouteSchema.index({ tenantId: 1, routeName: 1 }, { unique: true });

export const TransportRoute = mongoose.model<ITransportRoute>('TransportRoute', TransportRouteSchema);
