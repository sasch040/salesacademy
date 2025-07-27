-- Update courses table with the three specific products
DELETE FROM courses;

INSERT INTO courses (id, title, description, duration_hours, total_lessons) VALUES
(1, 'Smart Nexus Training', 'Comprehensive training for Smart Nexus platform and features', 2, 5),
(2, 'Smart Lens Training', 'Learn to use Smart Lens for optimal results', 2, 5), 
(3, 'Hacktracks Training', 'Master Hacktracks tools and methodologies', 3, 5)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_hours = EXCLUDED.duration_hours,
  total_lessons = EXCLUDED.total_lessons;

-- Update user progress for demo user
DELETE FROM user_progress WHERE user_email = 'demo@elearning.com';

INSERT INTO user_progress (user_email, course_id, progress_percentage, completed_lessons) VALUES
('demo@elearning.com', 1, 60, 3),
('demo@elearning.com', 2, 0, 0),
('demo@elearning.com', 3, 0, 0);
