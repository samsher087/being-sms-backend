import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { AcademicSession } from '../models/AcademicSession';
import { ClassSection } from '../models/ClassSection';
import { Student } from '../models/Student';
import { Teacher } from '../models/Teacher';
import { Attendance } from '../models/Attendance';
import { FeeStructure, FeePayment } from '../models/Fee';
import { ExamSchedule, ExamResult } from '../models/Exam';
import { Timetable } from '../models/Timetable';
import { Notice } from '../models/Notice';
import { Assignment } from '../models/Assignment';
import { AdmissionEnquiry } from '../models/Admission';
import { Book, BookIssue } from '../models/Library';
import { TransportRoute } from '../models/Transport';
import { WebsiteContent } from '../models/WebsiteContent';
import { AuditLog } from '../models/AuditLog';

dotenv.config();

export const seedDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/softdeals_sms';
  console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri, {
    dbName: 'softdeals_sms',
  });

  console.log('[Seed] Clearing existing collections...');
  await Promise.all([
    Tenant.deleteMany({}),
    User.deleteMany({}),
    AcademicSession.deleteMany({}),
    ClassSection.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Attendance.deleteMany({}),
    FeeStructure.deleteMany({}),
    FeePayment.deleteMany({}),
    ExamSchedule.deleteMany({}),
    ExamResult.deleteMany({}),
    Timetable.deleteMany({}),
    Notice.deleteMany({}),
    Assignment.deleteMany({}),
    AdmissionEnquiry.deleteMany({}),
    Book.deleteMany({}),
    BookIssue.deleteMany({}),
    TransportRoute.deleteMany({}),
    WebsiteContent.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seed] Creating tenants...');
  const dpsTenant = await Tenant.create({
    name: 'D.A.V Public School, Pindersot',
    code: 'dps-rkp',
    subdomain: 'dps',
    tagline: 'Service Before Self — Academic Distinction & Holistic Leadership',
    logo: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=200&q=80',
    contact: {
      email: 'info@dps.edu.in',
      phone: '+91 11 4911 5500',
      address: 'Sector 12, R.K. Puram',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110022',
      website: 'https://dpsrkp.net',
    },
    subscription: {
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      studentLimit: 5000,
      staffLimit: 300,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    themeConfig: {
      primaryColor: '#0B192C',
      secondaryColor: '#1E3E62',
      accentColor: '#008170',
      schoolMotto: 'Service Before Self',
    },
    settings: {
      currencySymbol: '₹',
      receiptPrefix: 'DPS-REC',
      admissionPrefix: 'DPS-ADM',
    },
    isActive: true,
  });

  const stXavierTenant = await Tenant.create({
    name: "St. Xavier's Senior Secondary School",
    code: 'st-xavier',
    subdomain: 'stxavier',
    tagline: 'For God and Country — Nurturing Character Since 1974',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
    contact: {
      email: 'office@stxavierschool.org',
      phone: '+91 11 2395 1200',
      address: '4, Raj Niwas Marg, Civil Lines',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110054',
      website: 'https://stxaviersdelhi.com',
    },
    subscription: {
      plan: 'GROWTH',
      status: 'ACTIVE',
      studentLimit: 2500,
      staffLimit: 150,
      expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    },
    themeConfig: {
      primaryColor: '#1B263B',
      secondaryColor: '#415A77',
      accentColor: '#0077B6',
      schoolMotto: 'Esto Vir — Be a Man of Character',
    },
    settings: {
      currencySymbol: '₹',
      receiptPrefix: 'STX-REC',
      admissionPrefix: 'STX-ADM',
    },
    isActive: true,
  });

  console.log('[Seed] Creating academic sessions...');
  const currentSession = await AcademicSession.create({
    tenantId: dpsTenant._id,
    name: '2026-2027',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2027-03-31'),
    isCurrent: true,
    status: 'ACTIVE',
  });

  dpsTenant.settings.currentSessionId = currentSession._id as any;
  await dpsTenant.save();

  console.log('[Seed] Creating teachers & faculty...');
  const tSharma = await Teacher.create({
    tenantId: dpsTenant._id,
    employeeId: 'EMP-001',
    name: 'Dr. Rajesh Sharma',
    gender: 'Male',
    email: 'teacher@dps.edu.in', // Main demo teacher account
    phone: '+91 98111 22334',
    designation: 'Senior PGT Mathematics & HOD',
    department: 'Mathematics',
    qualification: 'Ph.D., M.Sc. Mathematics, B.Ed',
    joiningDate: new Date('2015-07-01'),
    salaryPaise: 7500000,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  });

  const tKaur = await Teacher.create({
    tenantId: dpsTenant._id,
    employeeId: 'EMP-002',
    name: 'Mrs. Simran Kaur',
    gender: 'Female',
    email: 'simran.kaur@dps.edu.in',
    phone: '+91 98111 33445',
    designation: 'TGT Science & Biology Lead',
    department: 'Sciences',
    qualification: 'M.Sc. Biotechnology, B.Ed',
    joiningDate: new Date('2018-04-10'),
    salaryPaise: 5800000,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  });

  const tMenon = await Teacher.create({
    tenantId: dpsTenant._id,
    employeeId: 'EMP-003',
    name: 'Mr. Arvind Menon',
    gender: 'Male',
    email: 'arvind.menon@dps.edu.in',
    phone: '+91 98111 44556',
    designation: 'PGT English Literature & Debate Coach',
    department: 'Humanities',
    qualification: 'M.A. English, B.Ed',
    joiningDate: new Date('2019-06-15'),
    salaryPaise: 6200000,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    status: 'ACTIVE',
  });

  console.log('[Seed] Creating classes and sections...');
  const class10A = await ClassSection.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    className: 'Class 10',
    section: 'A',
    roomNumber: 'Room 204',
    capacity: 40,
    classTeacherId: tSharma._id,
    subjects: [
      { name: 'Mathematics Core', code: 'MATH-101', teacherId: tSharma._id, maxMarks: 100, passingMarks: 33 },
      { name: 'Science & Lab', code: 'SCI-101', teacherId: tKaur._id, maxMarks: 100, passingMarks: 33 },
      { name: 'English Communicative', code: 'ENG-101', teacherId: tMenon._id, maxMarks: 100, passingMarks: 33 },
      { name: 'Social Studies', code: 'SST-101', maxMarks: 100, passingMarks: 33 },
      { name: 'Hindi Course A', code: 'HIN-101', maxMarks: 100, passingMarks: 33 },
      { name: 'Artificial Intelligence & Coding', code: 'AI-101', maxMarks: 100, passingMarks: 33 },
    ],
  });

  const class10B = await ClassSection.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    className: 'Class 10',
    section: 'B',
    roomNumber: 'Room 205',
    capacity: 40,
    classTeacherId: tKaur._id,
    subjects: [
      { name: 'Mathematics Core', code: 'MATH-101', teacherId: tSharma._id, maxMarks: 100, passingMarks: 33 },
      { name: 'Science & Lab', code: 'SCI-101', teacherId: tKaur._id, maxMarks: 100, passingMarks: 33 },
      { name: 'English Communicative', code: 'ENG-101', teacherId: tMenon._id, maxMarks: 100, passingMarks: 33 },
    ],
  });

  const class9A = await ClassSection.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    className: 'Class 9',
    section: 'A',
    roomNumber: 'Room 108',
    capacity: 40,
    classTeacherId: tMenon._id,
    subjects: [
      { name: 'Mathematics', code: 'MATH-901', teacherId: tSharma._id, maxMarks: 100, passingMarks: 33 },
      { name: 'Science', code: 'SCI-901', teacherId: tKaur._id, maxMarks: 100, passingMarks: 33 },
      { name: 'English', code: 'ENG-901', teacherId: tMenon._id, maxMarks: 100, passingMarks: 33 },
    ],
  });

  // Assign classes to teachers
  tSharma.assignedClasses = [
    { classId: class10A._id as any, subject: 'Mathematics Core' },
    { classId: class10B._id as any, subject: 'Mathematics Core' },
    { classId: class9A._id as any, subject: 'Mathematics' },
  ];
  await tSharma.save();

  console.log('[Seed] Creating students...');
  const studentAarav = await Student.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    admissionNumber: 'DPS-2026-0001',
    rollNumber: '101',
    name: 'Aarav Sharma',
    gender: 'Male',
    dob: new Date('2010-08-14'),
    bloodGroup: 'O+',
    email: 'student@dps.edu.in', // Main demo student account
    phone: '+91 98100 11223',
    classId: class10A._id,
    address: { street: 'B-44, Hauz Khas Enclave', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
    parents: {
      fatherName: 'Vikas Sharma',
      fatherPhone: '+91 98100 11223',
      fatherOccupation: 'Senior Software Architect',
      motherName: 'Sunita Sharma',
      motherPhone: '+91 98100 11224',
      motherOccupation: 'Chartered Accountant',
      emergencyContact: '+91 98100 11223',
    },
    admissionDate: new Date('2020-04-05'),
    concessionPercent: 10, // 10% merit scholarship
    status: 'ACTIVE',
  });

  const studentAnanya = await Student.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    admissionNumber: 'DPS-2026-0002',
    rollNumber: '102',
    name: 'Ananya Verma',
    gender: 'Female',
    dob: new Date('2010-11-22'),
    bloodGroup: 'B+',
    email: 'ananya.verma@dps.edu.in',
    phone: '+91 98100 22334',
    classId: class10A._id,
    address: { street: 'C-12, Green Park Main', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
    parents: {
      fatherName: 'Alok Verma',
      fatherPhone: '+91 98100 22334',
      fatherOccupation: 'Executive Engineer, PWD',
      motherName: 'Pooja Verma',
      motherPhone: '+91 98100 22335',
      motherOccupation: 'Professor, DU',
      emergencyContact: '+91 98100 22334',
    },
    admissionDate: new Date('2021-04-06'),
    status: 'ACTIVE',
  });

  const studentRohan = await Student.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    admissionNumber: 'DPS-2026-0003',
    rollNumber: '103',
    name: 'Rohan Gupta',
    gender: 'Male',
    dob: new Date('2010-03-09'),
    bloodGroup: 'A+',
    email: 'rohan.gupta@dps.edu.in',
    phone: '+91 98100 33445',
    classId: class10A._id,
    address: { street: '18, Safdarjung Enclave', city: 'New Delhi', state: 'Delhi', pincode: '110029' },
    parents: {
      fatherName: 'Deepak Gupta',
      fatherPhone: '+91 98100 33445',
      motherName: 'Rekha Gupta',
      motherPhone: '+91 98100 33446',
      emergencyContact: '+91 98100 33445',
    },
    admissionDate: new Date('2021-04-10'),
    status: 'ACTIVE',
  });

  const studentDiya = await Student.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    admissionNumber: 'DPS-2026-0004',
    rollNumber: '104',
    name: 'Diya Patel',
    gender: 'Female',
    dob: new Date('2010-09-17'),
    bloodGroup: 'AB+',
    email: 'diya.patel@dps.edu.in',
    phone: '+91 98100 44556',
    classId: class10A._id,
    address: { street: '42, Vasant Vihar Block A', city: 'New Delhi', state: 'Delhi', pincode: '110057' },
    parents: {
      fatherName: 'Jayesh Patel',
      fatherPhone: '+91 98100 44556',
      motherName: 'Kiran Patel',
      motherPhone: '+91 98100 44557',
      emergencyContact: '+91 98100 44556',
    },
    admissionDate: new Date('2022-04-12'),
    status: 'ACTIVE',
  });

  const studentAditya = await Student.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    admissionNumber: 'DPS-2026-0005',
    rollNumber: '105',
    name: 'Aditya Kumar',
    gender: 'Male',
    dob: new Date('2010-05-30'),
    bloodGroup: 'O+',
    email: 'aditya.kumar@dps.edu.in',
    phone: '+91 98100 55667',
    classId: class10A._id,
    address: { street: 'D-9, Saket', city: 'New Delhi', state: 'Delhi', pincode: '110017' },
    parents: {
      fatherName: 'Sanjay Kumar',
      fatherPhone: '+91 98100 55667',
      motherName: 'Anita Kumar',
      motherPhone: '+91 98100 55668',
      emergencyContact: '+91 98100 55667',
    },
    admissionDate: new Date('2022-04-15'),
    status: 'ACTIVE',
  });

  console.log('[Seed] Creating demo user accounts for all 7 roles...');
  const users = [
    // 1. Super Admin
    {
      name: 'SoftDeals Platform Super Admin',
      email: 'superadmin@softdeals.in',
      password: 'Password@123',
      role: 'SUPER_ADMIN',
      phone: '+91 99999 00001',
    },
    // 2. School Admin (DPS)
    {
      name: 'DPS Administration Desk',
      email: 'admin@dps.edu.in',
      password: 'Password@123',
      role: 'SCHOOL_ADMIN',
      tenantId: dpsTenant._id,
      phone: '+91 11 4911 5501',
    },
    // 3. Principal (DPS)
    {
      name: 'Dr. Sunita Sharma, Ph.D.',
      email: 'principal@dps.edu.in',
      password: 'Password@123',
      role: 'PRINCIPAL',
      tenantId: dpsTenant._id,
      phone: '+91 11 4911 5502',
    },
    // 4. Teacher (DPS)
    {
      name: 'Dr. Rajesh Sharma',
      email: 'teacher@dps.edu.in',
      password: 'Password@123',
      role: 'TEACHER',
      tenantId: dpsTenant._id,
      linkedTeacherId: tSharma._id,
      phone: '+91 98111 22334',
    },
    // 5. Accountant (DPS)
    {
      name: 'Rameshwar Nath (Bursar)',
      email: 'accounts@dps.edu.in',
      password: 'Password@123',
      role: 'ACCOUNTANT',
      tenantId: dpsTenant._id,
      phone: '+91 11 4911 5505',
    },
    // 6. Student (DPS)
    {
      name: 'Aarav Sharma',
      email: 'student@dps.edu.in',
      password: 'Password@123',
      role: 'STUDENT',
      tenantId: dpsTenant._id,
      linkedStudentId: studentAarav._id,
      phone: '+91 98100 11223',
    },
    // 7. Parent (DPS)
    {
      name: 'Vikas Sharma (Father of Aarav)',
      email: 'parent@dps.edu.in',
      password: 'Password@123',
      role: 'PARENT',
      tenantId: dpsTenant._id,
      linkedChildrenIds: [studentAarav._id],
      phone: '+91 98100 11223',
    },
    // St Xavier Admin
    {
      name: "St. Xavier's Admin",
      email: 'admin@stxavier.edu.in',
      password: 'Password@123',
      role: 'SCHOOL_ADMIN',
      tenantId: stXavierTenant._id,
    },
  ];

  const createdUsers: any[] = [];
  for (const u of users) {
    const doc = await User.create(u);
    createdUsers.push(doc);
  }

  console.log('[Seed] Creating attendance registers...');
  const todayStr = new Date().toISOString().split('T')[0];
  await Attendance.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    classId: class10A._id,
    date: todayStr,
    records: [
      { studentId: studentAarav._id, status: 'PRESENT', remarks: 'On time' },
      { studentId: studentAnanya._id, status: 'PRESENT', remarks: 'On time' },
      { studentId: studentRohan._id, status: 'LATE', remarks: 'Bus delayed 10 mins' },
      { studentId: studentDiya._id, status: 'PRESENT', remarks: 'On time' },
      { studentId: studentAditya._id, status: 'EXCUSED', remarks: 'Medical leave approved' },
    ],
    markedBy: tSharma._id as any,
    type: 'STUDENT',
  });

  console.log('[Seed] Creating fee structures and payments...');
  const feeStructure10 = await FeeStructure.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    classId: class10A._id,
    frequency: 'QUARTERLY',
    dueDateDay: 10,
    heads: [
      { name: 'Tuition & Academic Fee', amountPaise: 3200000 }, // ₹32,000
      { name: 'Smart Class & AI Lab Fee', amountPaise: 500000 }, // ₹5,000
      { name: 'Development & Infrastructure', amountPaise: 400000 }, // ₹4,000
      { name: 'Sports, Library & Activities', amountPaise: 400000 }, // ₹4,000
    ],
    totalPaise: 4500000, // Total ₹45,000 / quarter
  });

  const accountantUser = await User.findOne({ email: 'accounts@dps.edu.in' });

  // Record realistic fee payment for Aarav
  await FeePayment.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    receiptNumber: 'DPS-REC-2026-00001',
    studentId: studentAarav._id,
    classId: class10A._id,
    feeMonth: 'Quarter 1 (Apr - Jun 2026)',
    totalDuePaise: 4500000,
    discountPaise: 450000, // 10% concession = ₹4,500
    paidPaise: 4050000, // ₹40,500 paid in full
    balancePaise: 0,
    paymentMethod: 'UPI',
    status: 'PAID',
    paymentDate: new Date('2026-04-08'),
    transactionRef: 'UPI/610298451120/HDFC',
    notes: 'Q1 School Fees paid via UPI with 10% Merit Concession',
    collectedBy: accountantUser?._id,
  });

  await FeePayment.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    receiptNumber: 'DPS-REC-2026-00002',
    studentId: studentAnanya._id,
    classId: class10A._id,
    feeMonth: 'Quarter 1 (Apr - Jun 2026)',
    totalDuePaise: 4500000,
    discountPaise: 0,
    paidPaise: 4500000,
    balancePaise: 0,
    paymentMethod: 'NET_BANKING',
    status: 'PAID',
    paymentDate: new Date('2026-04-09'),
    transactionRef: 'NEFT/SBI/992817263',
    notes: 'Quarter 1 NetBanking payment verified',
    collectedBy: accountantUser?._id,
  });

  console.log('[Seed] Creating exam schedules & marks...');
  const examTerm1 = await ExamSchedule.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    name: 'Half Yearly Examination 2026',
    examType: 'TERM_1',
    classIds: [class10A._id, class10B._id],
    startDate: new Date('2026-09-15'),
    endDate: new Date('2026-09-26'),
    status: 'RESULTS_PUBLISHED',
    subjects: [
      { subjectName: 'Mathematics Core', subjectCode: 'MATH-101', examDate: new Date('2026-09-15'), startTime: '09:00 AM', endTime: '12:00 PM', maxMarks: 100, passingMarks: 33 },
      { subjectName: 'Science & Lab', subjectCode: 'SCI-101', examDate: new Date('2026-09-18'), startTime: '09:00 AM', endTime: '12:00 PM', maxMarks: 100, passingMarks: 33 },
      { subjectName: 'English Communicative', subjectCode: 'ENG-101', examDate: new Date('2026-09-21'), startTime: '09:00 AM', endTime: '12:00 PM', maxMarks: 100, passingMarks: 33 },
    ],
  });

  // Marks for Aarav
  await ExamResult.create({
    tenantId: dpsTenant._id,
    examId: examTerm1._id,
    studentId: studentAarav._id,
    classId: class10A._id,
    subjectMarks: [
      { subjectName: 'Mathematics Core', subjectCode: 'MATH-101', marksObtained: 96, maxMarks: 100, grade: 'A1', remarks: 'Outstanding analytical prowess' },
      { subjectName: 'Science & Lab', subjectCode: 'SCI-101', marksObtained: 92, maxMarks: 100, grade: 'A1', remarks: 'Thorough conceptual understanding' },
      { subjectName: 'English Communicative', subjectCode: 'ENG-101', marksObtained: 89, maxMarks: 100, grade: 'A2', remarks: 'Articulate writing' },
    ],
    totalObtained: 277,
    totalMax: 300,
    percentage: 92.33,
    overallGrade: 'A1',
    resultStatus: 'PASS',
    teacherRemarks: 'Exemplary academic achievement! Well deserved A1 aggregate.',
  });

  console.log('[Seed] Creating timetables...');
  await Timetable.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    classId: class10A._id,
    days: [
      {
        day: 'Monday',
        periods: [
          { periodNumber: 1, startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Mathematics Core', teacherId: tSharma._id, roomNumber: 'Room 204' },
          { periodNumber: 2, startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Science & Lab', teacherId: tKaur._id, roomNumber: 'Physics Lab' },
          { periodNumber: 3, startTime: '10:00 AM', endTime: '10:20 AM', subject: 'Recess / Snack Break', isBreak: true },
          { periodNumber: 4, startTime: '10:20 AM', endTime: '11:05 AM', subject: 'English Communicative', teacherId: tMenon._id, roomNumber: 'Room 204' },
          { periodNumber: 5, startTime: '11:05 AM', endTime: '11:50 AM', subject: 'Social Studies', roomNumber: 'Room 204' },
          { periodNumber: 6, startTime: '11:50 AM', endTime: '12:35 PM', subject: 'Hindi Course A', roomNumber: 'Room 204' },
          { periodNumber: 7, startTime: '12:35 PM', endTime: '01:20 PM', subject: 'Artificial Intelligence & Robotics', roomNumber: 'Robotics Lab' },
        ],
      },
      {
        day: 'Tuesday',
        periods: [
          { periodNumber: 1, startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Science & Lab', teacherId: tKaur._id, roomNumber: 'Chemistry Lab' },
          { periodNumber: 2, startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Mathematics Core', teacherId: tSharma._id, roomNumber: 'Room 204' },
          { periodNumber: 3, startTime: '10:00 AM', endTime: '10:20 AM', subject: 'Recess', isBreak: true },
          { periodNumber: 4, startTime: '10:20 AM', endTime: '11:05 AM', subject: 'Social Studies', roomNumber: 'Room 204' },
          { periodNumber: 5, startTime: '11:05 AM', endTime: '11:50 AM', subject: 'English Communicative', teacherId: tMenon._id, roomNumber: 'Room 204' },
        ],
      },
    ],
  });

  console.log('[Seed] Creating notices and homework assignments...');
  await Notice.create({
    tenantId: dpsTenant._id,
    title: 'Admissions Open for Academic Session 2026-27 (Pre-School to Grade 11)',
    content: 'D.A.V Public School, Pindersot announces registration for fresh admissions across Pre-School, Nursery, and Grade 11 Science/Commerce/Humanities streams. Apply online through the portal or visit the school office.',
    targetRole: 'ALL',
    priority: 'HIGH',
    postedBy: createdUsers[1]._id,
    isPinned: true,
  });

  await Notice.create({
    tenantId: dpsTenant._id,
    title: 'Inter-House Science & Robotics Innovation Exhibition 2026',
    content: 'Students of Grades 8 to 12 are invited to present working prototypes in AI, Green Energy, and Space Technology on 28th October at the Dr. Sarvepalli Radhakrishnan Auditorium.',
    targetRole: 'STUDENTS',
    priority: 'NORMAL',
    postedBy: createdUsers[3]._id,
  });

  await Notice.create({
    tenantId: dpsTenant._id,
    title: 'Quarterly Parent-Teacher Meeting (PTM) Schedule',
    content: 'The Term 1 Parent-Teacher Interaction will be held on Saturday between 8:30 AM to 1:00 PM. Parents can check their assigned slot in the parent portal.',
    targetRole: 'PARENTS',
    priority: 'HIGH',
    postedBy: createdUsers[1]._id,
  });

  await Assignment.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    classId: class10A._id,
    teacherId: tSharma._id,
    subject: 'Mathematics Core',
    title: 'Quadratic Equations & Arithmetic Progressions Problem Set',
    instructions: 'Solve NCERT Exemplar Chapter 4 & 5 exercises. Submit neatly in your homework assignment register.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    maxMarks: 20,
  });

  console.log('[Seed] Creating online admissions enquiries...');
  await AdmissionEnquiry.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    applicationNumber: 'DPS-ENQ-2026-0012',
    applicantName: 'Kabir Singhania',
    gender: 'Male',
    dob: new Date('2014-06-18'),
    classAppliedFor: 'Class 6',
    parentName: 'Gaurav Singhania',
    relationship: 'Father',
    email: 'gaurav.singhania@gmail.com',
    phone: '+91 98200 44551',
    address: 'Flat 402, Pinnacle Tower, Vasant Kunj, New Delhi',
    previousSchool: 'The Heritage School, Vasant Kunj',
    previousPercentage: 91.5,
    status: 'INTERVIEW_SCHEDULED',
    interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    notes: 'Candidate has outstanding achievements in state-level swimming and academic Olympiads.',
  });

  await AdmissionEnquiry.create({
    tenantId: dpsTenant._id,
    academicSessionId: currentSession._id,
    applicationNumber: 'DPS-ENQ-2026-0013',
    applicantName: 'Mira Nair',
    gender: 'Female',
    dob: new Date('2009-12-05'),
    classAppliedFor: 'Class 11 Science (PCM)',
    parentName: 'Dr. Suresh Nair',
    relationship: 'Father',
    email: 'drsureshnair@apollohospitals.org',
    phone: '+91 98110 99887',
    address: '38, Shanti Niketan, New Delhi',
    previousSchool: 'Modern School, Barakhamba Road',
    previousPercentage: 95.8,
    status: 'APPROVED',
    notes: 'Merit category approved. Ready for enrollment conversion.',
  });

  console.log('[Seed] Creating library catalogue & transport routes...');
  const b1 = await Book.create({
    tenantId: dpsTenant._id,
    title: 'Concepts of Physics (Vol 1 & 2)',
    author: 'Dr. H.C. Verma',
    isbn: '978-8177091878',
    accessionNumber: 'LIB-PHY-0142',
    category: 'Physics',
    totalCopies: 15,
    availableCopies: 14,
    rackLocation: 'Rack 4B - Science',
  });

  await BookIssue.create({
    tenantId: dpsTenant._id,
    bookId: b1._id,
    borrowerType: 'STUDENT',
    studentId: studentAarav._id,
    issueDate: new Date('2026-10-10'),
    dueDate: new Date('2026-10-24'),
    status: 'ISSUED',
  });

  await TransportRoute.create({
    tenantId: dpsTenant._id,
    routeName: 'Route 12 — Pindersot',
    vehicleNumber: 'JH-11-4920',
    vehicleModel: 'Tata Marcopolo 42-Seater AC Bus',
    driverName: 'Manjeet Singh',
    driverPhone: '+91 98105 12345',
    capacity: 42,
    stops: [
      { stopName: 'Bholapur', pickupTime: '07:10 AM', dropTime: '02:50 PM', monthlyFeePaise: 250000 },
      { stopName: 'Kusaiya', pickupTime: '07:20 AM', dropTime: '02:40 PM', monthlyFeePaise: 250000 },
      { stopName: 'Jarsoti', pickupTime: '07:30 AM', dropTime: '02:30 PM', monthlyFeePaise: 220000 },
      { stopName: 'Kathwara', pickupTime: '07:40 AM', dropTime: '02:20 PM', monthlyFeePaise: 200000 },
      { stopName: 'Pindersot', pickupTime: '07:55 AM', dropTime: '02:00 PM', monthlyFeePaise: 0 },
    ],
    assignedStudentIds: [studentAarav._id as any, studentAnanya._id as any],
    status: 'ACTIVE',
  });

  console.log('[Seed] Creating public website CMS content...');
  await WebsiteContent.create({
    tenantId: dpsTenant._id,
    hero: {
      badge: 'Admissions Open 2026-27',
      title: 'D.A.V Public School, Pindersot',
      subtitle: 'A premier Indian institution empowering young minds with academic distinction, ethical integrity, and 21st-century technological leadership.',
      ctaPrimaryText: 'Apply for Admission',
      ctaPrimaryLink: '/admissions',
      ctaSecondaryText: 'Explore Campus',
      ctaSecondaryLink: '/facilities',
      heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
    },
    about: {
      heading: 'Over 5 Decades of Educational Distinction',
      description: 'D.A.V Public School, Pindersot is one of India’s most acclaimed educational institutions. Ranked consistently among the top schools nationwide, we blend academic rigor with sports, performing arts, and character leadership.',
      foundedYear: '1972',
      affiliation: 'Affiliated to Central Board of Secondary Education (CBSE), New Delhi',
      vision: 'To nurture globally minded, culturally rooted leaders who serve society with intellect, empathy, and innovation.',
      mission: 'To provide a stimulating learning ecosystem inspired by NEP 2020 where every child explores their unique potential.',
      stats: [
        { label: 'Enrolled Students', value: '4,500+' },
        { label: 'Distinguished Faculty', value: '220+' },
        { label: 'CBSE Board Merit Rankers', value: '100%' },
        { label: 'IIT / AIIMS / Ivy League Selections', value: '180+' },
      ],
    },
    principalMessage: {
      principalName: 'Dr. Sunita Sharma, Ph.D.',
      principalTitle: 'Principal & Academic Director',
      principalImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      quote: 'Education is not merely the learning of facts, but the ignition of intellectual curiosity, empathy, and courage.',
      fullMessage: 'At D.A.V Public School, Pindersot, we believe that each student is endowed with boundless potential. Our endeavor is to guide them to discover their passions, hone their analytical rigor, and emerge as responsible citizens equipped to navigate an interconnected world with courage and empathy.',
    },
    academics: {
      intro: 'Our curriculum follows the National Education Policy (NEP 2020) and CBSE guidelines, encouraging experiential inquiry, coding literacy, and holistic development.',
      levels: [
        {
          title: 'Foundational & Primary Wing (Nursery to Grade 5)',
          ageGroup: 'Ages 3 - 10',
          description: 'Play-way pedagogy, foundational literacy and numeracy, storytelling, phonics, and sensory discovery modules.',
          highlights: ['Montessori-inspired activity rooms', 'Smart board interactive learning', 'Foundational coding with scratch'],
        },
        {
          title: 'Middle School Wing (Grade 6 to Grade 8)',
          ageGroup: 'Ages 11 - 13',
          description: 'Integrated sciences, algebraic thinking, foreign languages (French, German, Sanskrit), and environmental projects.',
          highlights: ['Makerspace robotics & AI lab', 'Model United Nations (MUN)', 'Mathematical olympiad coaching'],
        },
        {
          title: 'Senior Secondary Wing (Grade 9 to Grade 12)',
          ageGroup: 'Ages 14 - 18',
          description: 'Intensive preparation across Science (PCM/PCB), Commerce with Applied Maths, and Humanities streams with career mentoring.',
          highlights: ['Integrated IIT-JEE / NEET / CLAT support', 'State-of-the-art computer and biotech labs', 'Global university counseling'],
        },
      ],
    },
    facilities: [
      {
        title: 'Smart Digital Classrooms',
        icon: 'MonitorPlay',
        description: 'Ultra HD interactive touch panels, high-speed fiber Wi-Fi, digital recording for revision, and ergonomic furniture.',
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Modern Science & AI Innovation Maker Labs',
        icon: 'FlaskConical',
        description: 'Advanced Physics, Chemistry, Biology, and 3D printing & AI robotics labs adhering to international safety standards.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Olympic-Standard Sports Complex',
        icon: 'Trophy',
        description: 'All-weather half-Olympic swimming pool, synthetic athletic track, football turf, tennis and squash courts.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Central Library & Digital Knowledge Hub',
        icon: 'BookOpen',
        description: 'Over 45,000 titles, national & international journals, Kindle e-readers, and research cubicles for senior scholars.',
        image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      },
    ],
    gallery: [
      {
        title: 'Annual Sports Meet 2026',
        category: 'Sports',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'National Robotics Olympiad',
        category: 'Academics',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Orchestra & Annual Cultural Evening',
        category: 'Arts',
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      },
    ],
    testimonials: [
      {
        name: 'Vikas Sharma',
        role: 'Parent of Aarav Sharma (Grade 10)',
        content: 'SoftDeals SMS has transformed how we stay connected with the school. We receive real-time attendance alerts, fee receipts via UPI in seconds, and detailed CBSE report cards online.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        rating: 5,
      },
      {
        name: 'Pooja Verma',
        role: 'Parent of Ananya Verma (Grade 10)',
        content: 'The academic mentorship and holistic encouragement DPS provides is unmatched. The teachers are dedicated, and the digital portal gives us complete peace of mind.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        rating: 5,
      },
    ],
    contactInfo: {
      address: 'Sector 12, R.K. Puram, New Delhi - 110022, India',
      phone: '+91 11 4911 5500 / +91 11 4911 5501',
      email: 'admissions@dps.edu.in',
      officeHours: 'Monday to Saturday: 8:00 AM - 3:30 PM',
      googleMapsEmbedUrl: 'https://maps.google.com',
    },
  });

  console.log('[Seed] Seeding completed successfully!');
  console.log('====================================================');
  console.log('SOFTDEALS SCHOOL MANAGEMENT SYSTEM — DEMO CREDENTIALS');
  console.log('Password for ALL accounts: Password@123');
  console.log('----------------------------------------------------');
  console.log('1. Super Admin:  superadmin@softdeals.in');
  console.log('2. School Admin: admin@dps.edu.in');
  console.log('3. Principal:    principal@dps.edu.in');
  console.log('4. Teacher:      teacher@dps.edu.in');
  console.log('5. Accountant:   accounts@dps.edu.in');
  console.log('6. Student:      student@dps.edu.in');
  console.log('7. Parent:       parent@dps.edu.in');
  console.log('====================================================');
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
