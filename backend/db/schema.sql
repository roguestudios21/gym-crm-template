PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS members (
  memberID TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT,
  DOB TEXT,
  profilePicture TEXT,
  biometric BLOB,
  contact1 TEXT,
  contact2 TEXT,
  email TEXT,
  address TEXT,
  emergencyName TEXT,
  emergencyNumber TEXT,
  status TEXT,
  subscription TEXT,
  spaHistory TEXT,
  dietHistory TEXT
);

CREATE TABLE IF NOT EXISTS staff (
  staffID TEXT PRIMARY KEY,
  profilePicture TEXT,
  biometric BLOB,
  name TEXT NOT NULL,
  gender TEXT,
  DOB TEXT,
  contact1 TEXT,
  contact2 TEXT,
  email TEXT,
  address TEXT,
  emergencyName TEXT,
  emergencyNumber TEXT,
  designation TEXT,
  workingHours REAL,
  beliefs TEXT,
  interest TEXT,
  leaveBucket INTEGER DEFAULT 0,
  reportingManager TEXT
);

CREATE TABLE IF NOT EXISTS appointments (
  appointmentID TEXT PRIMARY KEY,
  date TEXT,
  time TEXT,
  appointmentType TEXT,
  gender TEXT,
  memberID TEXT,
  FOREIGN KEY(memberID) REFERENCES members(memberID) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales (
  transactionID TEXT PRIMARY KEY,
  date TEXT,
  memberID TEXT,
  subscription TEXT,
  amount REAL,
  discount REAL,
  tax REAL,
  paymentMode TEXT,
  salesType TEXT,
  staffID TEXT,
  status TEXT,
  remark TEXT,
  FOREIGN KEY(memberID) REFERENCES members(memberID),
  FOREIGN KEY(staffID) REFERENCES staff(staffID)
);

CREATE TABLE IF NOT EXISTS enquiries (
  enquiryId TEXT PRIMARY KEY,
  date TEXT,
  time TEXT,
  staffId TEXT,
  remarks TEXT,
  FOREIGN KEY(staffId) REFERENCES staff(staffID)
);

CREATE TABLE IF NOT EXISTS reports (
  reportID TEXT PRIMARY KEY,
  reportType TEXT,
  periodStart TEXT,
  periodEnd TEXT,
  staffID TEXT,
  generateOn TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memberID TEXT,
  timestamp TEXT,
  staffID TEXT,
  FOREIGN KEY(memberID) REFERENCES members(memberID),
  FOREIGN KEY(staffID) REFERENCES staff(staffID)
);
