-- Seed data for e-learning platform

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@salesacademy.com', '$2b$10$example', 'Admin', 'User', 'admin'),
('student@example.com', '$2b$10$example', 'John', 'Doe', 'student'),
('instructor@example.com', '$2b$10$example', 'Jane', 'Smith', 'instructor')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, title, description, instructor, duration, level, logo, gradient) VALUES
(20, 'Smart Lens Grundlagen', 'Lernen Sie die Grundlagen von Smart Lens kennen', 'Dr. Sarah Weber', '2 Stunden', 'Beginner', '/images/smart-lens-clean.png', 'from-blue-500 to-blue-700'),
(21, 'Smart Nexus Advanced', 'Fortgeschrittene Techniken mit Smart Nexus', 'Prof. Michael Klein', '3 Stunden', 'Advanced', '/images/smart-nexus-clean.png', 'from-green-500 to-green-700'),
(22, 'Hacktracks Mastery', 'Meistern Sie Hacktracks von Grund auf', 'Alex Johnson', '4 Stunden', 'Intermediate', '/images/hacktracks-clean.png', 'from-purple-500 to-purple-700'),
(23, 'Sales Academy Komplett', 'Vollständiger Sales-Kurs', 'Maria Rodriguez', '5 Stunden', 'All Levels', '/images/sales-academy-new-logo.png', 'from-red-500 to-red-700'),
(24, 'Digital Marketing Basics', 'Grundlagen des digitalen Marketings', 'Tom Wilson', '2.5 Stunden', 'Beginner', '/placeholder.svg', 'from-yellow-500 to-yellow-700')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    instructor = EXCLUDED.instructor,
    duration = EXCLUDED.duration,
    level = EXCLUDED.level,
    logo = EXCLUDED.logo,
    gradient = EXCLUDED.gradient;

-- Insert sample modules
INSERT INTO modules (id, course_id, title, description, video_url, video_title, duration, order_index) VALUES
-- Smart Lens Grundlagen (Course 20)
(1, 20, 'Einführung in Smart Lens', 'Grundlegende Konzepte und Überblick', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Smart Lens Einführung', '30 Min', 1),
(2, 20, 'Installation und Setup', 'Schritt-für-Schritt Installationsanleitung', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Smart Lens Installation', '45 Min', 2),
(3, 20, 'Erste Schritte', 'Ihre ersten Projekte mit Smart Lens', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Smart Lens Erste Schritte', '45 Min', 3),

-- Smart Nexus Advanced (Course 21)
(4, 21, 'Nexus Architektur', 'Verstehen Sie die Nexus-Architektur', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Nexus Architektur Überblick', '60 Min', 1),
(5, 21, 'Advanced Features', 'Erweiterte Funktionen von Smart Nexus', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Nexus Advanced Features', '90 Min', 2),

-- Hacktracks Mastery (Course 22)
(6, 22, 'Hacktracks Basics', 'Grundlagen von Hacktracks', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Hacktracks Grundlagen', '50 Min', 1),
(7, 22, 'Security Concepts', 'Sicherheitskonzepte verstehen', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Security Grundlagen', '70 Min', 2),
(8, 22, 'Advanced Techniques', 'Fortgeschrittene Hacktracks-Techniken', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Advanced Hacktracks', '80 Min', 3),

-- Sales Academy Komplett (Course 23)
(9, 23, 'Sales Fundamentals', 'Grundlagen des Verkaufens', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Sales Basics', '60 Min', 1),
(10, 23, 'Customer Relations', 'Kundenbeziehungen aufbauen', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Customer Relations', '75 Min', 2),

-- Digital Marketing Basics (Course 24)
(11, 24, 'Marketing Overview', 'Überblick über digitales Marketing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Marketing Überblick', '40 Min', 1),
(12, 24, 'Social Media Marketing', 'Social Media Strategien', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Social Media Marketing', '55 Min', 2),
(13, 24, 'Email Marketing', 'Effektives Email Marketing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Email Marketing', '45 Min', 3)
ON CONFLICT (id) DO UPDATE SET
    course_id = EXCLUDED.course_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    video_url = EXCLUDED.video_url,
    video_title = EXCLUDED.video_title,
    duration = EXCLUDED.duration,
    order_index = EXCLUDED.order_index;

-- Insert sample quiz questions
INSERT INTO quiz_questions (module_id, question, options, correct_answer, explanation, order_index) VALUES
-- Module 1 Quiz (Smart Lens Einführung)
(1, 'Was ist Smart Lens?', '["Eine Brille", "Eine Software-Plattform", "Ein Mikroskop", "Ein Kamerasystem"]', 1, 'Smart Lens ist eine innovative Software-Plattform für intelligente Bildanalyse.', 1),
(1, 'Welche Hauptfunktion bietet Smart Lens?', '["Bildbearbeitung", "Intelligente Bildanalyse", "Videostreaming", "Datenspeicherung"]', 1, 'Die Hauptfunktion von Smart Lens ist die intelligente Bildanalyse mit KI-Unterstützung.', 2),

-- Module 2 Quiz (Installation)
(2, 'Welches Betriebssystem wird für Smart Lens empfohlen?', '["Windows 10+", "macOS", "Linux", "Alle genannten"]', 3, 'Smart Lens ist plattformübergreifend und läuft auf allen modernen Betriebssystemen.', 1),
(2, 'Wie viel Speicherplatz benötigt Smart Lens mindestens?', '["1 GB", "2 GB", "5 GB", "10 GB"]', 2, 'Smart Lens benötigt mindestens 2 GB freien Speicherplatz für die Installation.', 2),

-- Module 3 Quiz (Erste Schritte)
(3, 'Wie erstellen Sie ein neues Projekt in Smart Lens?', '["File > New", "Projekt > Neu", "Strg+N", "Alle Antworten sind richtig"]', 3, 'Es gibt mehrere Wege, ein neues Projekt zu erstellen. Alle genannten Optionen funktionieren.', 1),

-- Module 4 Quiz (Nexus Architektur)
(4, 'Was ist das Herzstück der Nexus-Architektur?', '["Der Core Engine", "Die Benutzeroberfläche", "Die Datenbank", "Das Netzwerk"]', 0, 'Der Core Engine ist das zentrale Element der Nexus-Architektur.', 1),
(4, 'Welche Programmiersprache wird hauptsächlich für Nexus verwendet?', '["Java", "Python", "C++", "JavaScript"]', 1, 'Nexus wurde hauptsächlich in Python entwickelt für bessere Flexibilität.', 2),

-- Module 5 Quiz (Advanced Features)
(5, 'Welches Feature ermöglicht die Echtzeitanalyse in Nexus?', '["Stream Processor", "Batch Analyzer", "File Manager", "User Interface"]', 0, 'Der Stream Processor ermöglicht die Echtzeitanalyse von Datenströmen.', 1),

-- Module 6 Quiz (Hacktracks Basics)
(6, 'Was bedeutet "Ethical Hacking"?', '["Illegales Hacken", "Autorisiertes Penetrationstesting", "Virus erstellen", "Daten stehlen"]', 1, 'Ethical Hacking bezeichnet autorisierte Sicherheitstests zum Schutz von Systemen.', 1),
(6, 'Welches ist das erste Prinzip der IT-Sicherheit?', '["Verfügbarkeit", "Vertraulichkeit", "Integrität", "Alle sind gleich wichtig"]', 3, 'Die CIA-Triade (Confidentiality, Integrity, Availability) bildet die Grundlage der IT-Sicherheit.', 2),

-- Module 7 Quiz (Security Concepts)
(7, 'Was ist ein Penetrationstest?', '["Ein Stresstest", "Ein Sicherheitsaudit", "Ein Performance-Test", "Ein Usability-Test"]', 1, 'Ein Penetrationstest ist ein systematisches Sicherheitsaudit zur Identifikation von Schwachstellen.', 1),

-- Module 8 Quiz (Advanced Techniques)
(8, 'Welche Methode wird für Social Engineering verwendet?', '["SQL Injection", "Phishing", "Buffer Overflow", "DDoS"]', 1, 'Phishing ist eine häufige Social Engineering Methode zur Täuschung von Benutzern.', 1),

-- Module 9 Quiz (Sales Fundamentals)
(9, 'Was ist der wichtigste Aspekt im Verkaufsgespräch?', '["Der Preis", "Das Zuhören", "Das Produkt", "Die Präsentation"]', 1, 'Aktives Zuhören ist der Schlüssel für erfolgreiche Verkaufsgespräche.', 1),
(9, 'Welche Verkaufsmethode ist am effektivsten?', '["Hard Selling", "Consultative Selling", "Cold Calling", "Mass Marketing"]', 1, 'Consultative Selling fokussiert auf Kundenberatung und Problemlösung.', 2),

-- Module 10 Quiz (Customer Relations)
(10, 'Wie baut man langfristige Kundenbeziehungen auf?', '["Niedrige Preise", "Vertrauen und Service", "Aggressive Werbung", "Häufige Anrufe"]', 1, 'Vertrauen und exzellenter Service sind die Basis für langfristige Kundenbeziehungen.', 1),

-- Module 11 Quiz (Marketing Overview)
(11, 'Was ist der Hauptvorteil von digitalem Marketing?', '["Niedrige Kosten", "Messbarkeit", "Globale Reichweite", "Alle genannten"]', 3, 'Digitales Marketing bietet niedrige Kosten, Messbarkeit und globale Reichweite.', 1),

-- Module 12 Quiz (Social Media Marketing)
(12, 'Welche Plattform eignet sich am besten für B2B Marketing?', '["Instagram", "TikTok", "LinkedIn", "Snapchat"]', 2, 'LinkedIn ist die führende Plattform für Business-to-Business Marketing.', 1),

-- Module 13 Quiz (Email Marketing)
(13, 'Was ist die wichtigste Metrik im Email Marketing?', '["Öffnungsrate", "Klickrate", "Conversion Rate", "Alle sind wichtig"]', 3, 'Alle Metriken sind wichtig und sollten gemeinsam betrachtet werden für optimale Ergebnisse.', 1)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, logo, category, features) VALUES
('Smart Lens Pro', 'Professionelle Bildanalysesoftware mit KI-Unterstützung', '/images/smart-lens-clean.png', 'Software', ARRAY['KI-Bildanalyse', 'Echtzeit-Verarbeitung', 'Cloud-Integration']),
('Smart Nexus Enterprise', 'Enterprise-Lösung für komplexe Datenanalyse', '/images/smart-nexus-clean.png', 'Enterprise Software', ARRAY['Big Data Analytics', 'Machine Learning', 'Skalierbare Architektur']),
('Hacktracks Security Suite', 'Umfassende Cybersecurity-Lösung', '/images/hacktracks-clean.png', 'Security', ARRAY['Penetrationstests', 'Vulnerability Scanning', 'Security Monitoring']),
('Sales Academy Platform', 'Komplette Verkaufstraining-Plattform', '/images/sales-academy-new-logo.png', 'Training', ARRAY['Interaktive Kurse', 'Progress Tracking', 'Zertifizierungen'])
ON CONFLICT DO NOTHING;

-- Insert sample sales materials
INSERT INTO sales_materials (title, description, type, file_url, thumbnail, category, tags) VALUES
('Smart Lens Produktbroschüre', 'Detaillierte Übersicht über Smart Lens Features', 'PDF', '/files/smart-lens-brochure.pdf', '/images/smart-lens-clean.png', 'Produktinformation', ARRAY['smart-lens', 'broschüre', 'features']),
('Nexus ROI Calculator', 'Berechnen Sie den ROI von Smart Nexus', 'Excel', '/files/nexus-roi-calculator.xlsx', '/images/smart-nexus-clean.png', 'Tools', ARRAY['nexus', 'roi', 'calculator']),
('Hacktracks Demo Video', 'Demonstration der Hacktracks Funktionen', 'Video', '/videos/hacktracks-demo.mp4', '/images/hacktracks-clean.png', 'Demo', ARRAY['hacktracks', 'demo', 'video']),
('Sales Presentation Template', 'Vorlage für Verkaufspräsentationen', 'PowerPoint', '/files/sales-template.pptx', '/images/sales-academy-new-logo.png', 'Template', ARRAY['sales', 'presentation', 'template'])
ON CONFLICT DO NOTHING;
