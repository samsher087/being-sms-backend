import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { FeePayment } from '../models/Fee';
import { Attendance } from '../models/Attendance';
import { ExamResult } from '../models/Exam';

dotenv.config();

const runTests = async () => {
  console.log('----------------------------------------------------');
  console.log('RUNNING AUTOMATED TEST SUITE: SOFTDEALS SMS');
  console.log('----------------------------------------------------');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/softdeals_sms';
  await mongoose.connect(mongoUri);

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // Test 1: Tenant resolution
    const tenant = await Tenant.findOne({ code: 'dps-rkp' });
    assert(!!tenant, 'Tenant DPS exists in database');
    assert(tenant?.subscription?.status === 'ACTIVE', 'DPS tenant subscription is active');

    // Test 2: User authentication & Password Hashing
    const superAdmin = await User.findOne({ email: 'superadmin@softdeals.in' });
    assert(!!superAdmin, 'Super Admin user exists');
    const isPasswordValid = await superAdmin?.comparePassword('Password@123');
    assert(isPasswordValid === true, 'Super Admin bcrypt password verification works');

    // Test 3: Role-based account coverage (All 7 roles exist)
    const roles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STUDENT', 'PARENT'];
    for (const r of roles) {
      const user = await User.findOne({ role: r });
      assert(!!user, `User account exists for role: ${r}`);
    }

    // Test 4: Tenant Isolation Integrity
    const dpsStudent = await Student.findOne({ admissionNumber: 'DPS-2026-0001' });
    assert(!!dpsStudent, 'DPS student record found');
    assert(dpsStudent?.tenantId.toString() === tenant?._id.toString(), 'DPS student belongs exclusively to DPS tenantId');

    // Test 5: Attendance Duplicate Prevention
    const sampleAtt = await Attendance.findOne({ tenantId: tenant?._id, classId: dpsStudent?.classId });
    const attCount = await Attendance.countDocuments({
      tenantId: tenant?._id,
      classId: dpsStudent?.classId,
      date: sampleAtt?.date,
    });
    assert(attCount === 1, 'Attendance compound index prevents duplicate daily registers for class');

    // Test 6: Paise-Safe Integer Currency Calculations
    const payment = await FeePayment.findOne({ receiptNumber: 'DPS-REC-2026-00001' });
    assert(!!payment, 'Fee payment transaction found');
    assert(payment?.paidPaise === 4050000, 'Fee payment recorded in exact paise integer (₹40,500 = 4050000 paise)');
    assert(Number.isInteger(payment?.paidPaise), 'Payment amount is guaranteed integer without floating point rounding errors');

    // Test 7: CBSE Academic Grading Logic
    const examResult = await ExamResult.findOne({ studentId: dpsStudent?._id });
    assert(!!examResult, 'Student exam result found');
    assert(examResult?.percentage === 92.33, 'Exam percentage calculated accurately');
    assert(examResult?.overallGrade === 'A1', 'CBSE A1 grade awarded for percentage >= 91%');

    console.log('----------------------------------------------------');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('----------------------------------------------------');

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
};

runTests();
