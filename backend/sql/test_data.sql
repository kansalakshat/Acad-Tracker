DELETE FROM users WHERE email = 'student.test@example.com';

INSERT INTO users (name, email, password_hash)
VALUES ('Test Student', 'student.test@example.com', 'not_a_real_hash');
SET @test_user_id = LAST_INSERT_ID();

INSERT INTO notification_preferences (user_id, email_enabled, browser_enabled, remind_before_hours)
VALUES (@test_user_id, TRUE, TRUE, '24,1');

INSERT INTO courses (user_id, name, code, min_attendance_percent)
VALUES (@test_user_id, 'Data Structures', 'CS201', 75);
SET @test_course_id = LAST_INSERT_ID();

INSERT INTO assignments (user_id, course_id, title, description, due_at, status, priority)
VALUES (
  @test_user_id,
  @test_course_id,
  'Linked List Lab Report',
  'Test assignment for the reminder worker',
  UTC_TIMESTAMP() + INTERVAL 2 HOUR,
  'pending',
  'high'
);
