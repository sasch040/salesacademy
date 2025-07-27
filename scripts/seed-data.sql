-- Füge autorisierte Benutzer hinzu
INSERT INTO authorized_users (email) VALUES
('admin@example.com'),
('student1@example.com'),
('student2@example.com'),
('teacher@example.com'),
('demo@elearning.com')
ON CONFLICT (email) DO NOTHING;

-- Füge Beispielkurse hinzu
INSERT INTO courses (title, description, duration_hours, total_lessons) VALUES
('Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript', 8, 24),
('React Fundamentals', 'Master the fundamentals of React development', 12, 36),
('Database Design', 'Learn how to design efficient databases', 6, 18)
ON CONFLICT DO NOTHING;

-- Füge Beispiel-Fortschritt hinzu
INSERT INTO user_progress (user_email, course_id, progress_percentage, completed_lessons) VALUES
('demo@elearning.com', 1, 75, 18),
('demo@elearning.com', 2, 45, 16),
('demo@elearning.com', 3, 0, 0)
ON CONFLICT (user_email, course_id) DO NOTHING;

-- Füge Beispiel-Lektionen hinzu
INSERT INTO lessons (course_id, title, description, duration_minutes, lesson_order) VALUES
(1, 'HTML Basics', 'Introduction to HTML structure and elements', 30, 1),
(1, 'CSS Fundamentals', 'Learn CSS styling and layout', 45, 2),
(1, 'JavaScript Introduction', 'Basic JavaScript concepts and syntax', 60, 3),
(2, 'React Components', 'Understanding React components', 40, 1),
(2, 'State Management', 'Managing state in React applications', 50, 2),
(3, 'Database Concepts', 'Introduction to database design principles', 35, 1)
ON CONFLICT DO NOTHING;
