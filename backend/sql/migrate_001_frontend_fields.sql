-- Run once on a database created from the older schema.sql.
ALTER TABLE users ADD COLUMN semester INT NOT NULL DEFAULT 1 AFTER password_hash;
ALTER TABLE courses ADD COLUMN credits INT NOT NULL DEFAULT 3 AFTER min_attendance_percent;
ALTER TABLE attendance_records MODIFY status ENUM('present','absent','cancelled') NOT NULL;
ALTER TABLE attendance_records ADD INDEX idx_attendance_user_date (user_id, class_date), DROP INDEX idx_attendance_user;
ALTER TABLE assignments ADD COLUMN type ENUM('Exam','Assignment','Quiz','Project','Other') NOT NULL DEFAULT 'Assignment' AFTER priority;

CREATE TABLE timetable_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  weekday ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  start_time TIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_timetable_user (user_id)
);
