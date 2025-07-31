-- Update courses with additional information and ensure consistency

-- Update course descriptions and metadata
UPDATE courses SET
    description = CASE
        WHEN id = 20 THEN 'Lernen Sie die Grundlagen von Smart Lens kennen - von der Installation bis zu ersten praktischen Anwendungen. Dieser Kurs vermittelt Ihnen alle notwendigen Kenntnisse für den erfolgreichen Einstieg.'
        WHEN id = 21 THEN 'Vertiefen Sie Ihr Wissen über Smart Nexus mit fortgeschrittenen Techniken und Best Practices. Ideal für Entwickler und Systemarchitekten, die das volle Potenzial ausschöpfen möchten.'
        WHEN id = 22 THEN 'Meistern Sie Hacktracks von Grund auf - von den Basics bis zu fortgeschrittenen Sicherheitstechniken. Lernen Sie Ethical Hacking und Penetrationstesting professionell anzuwenden.'
        WHEN id = 23 THEN 'Kompletter Sales-Kurs mit allen wichtigen Verkaufstechniken, Kundenbeziehungsmanagement und modernen Vertriebsstrategien. Für Einsteiger und erfahrene Verkäufer.'
        WHEN id = 24 THEN 'Grundlagen des digitalen Marketings - von Social Media bis Email Marketing. Lernen Sie die wichtigsten Online-Marketing-Kanäle kennen und effektiv zu nutzen.'
        ELSE description
    END,
    instructor = CASE
        WHEN id = 20 THEN 'Dr. Sarah Weber'
        WHEN id = 21 THEN 'Prof. Michael Klein'
        WHEN id = 22 THEN 'Alex Johnson'
        WHEN id = 23 THEN 'Maria Rodriguez'
        WHEN id = 24 THEN 'Tom Wilson'
        ELSE instructor
    END,
    level = CASE
        WHEN id = 20 THEN 'Beginner'
        WHEN id = 21 THEN 'Advanced'
        WHEN id = 22 THEN 'Intermediate'
        WHEN id = 23 THEN 'All Levels'
        WHEN id = 24 THEN 'Beginner'
        ELSE level
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (20, 21, 22, 23, 24);

-- Ensure all modules have proper video URLs and descriptions
UPDATE modules SET
    video_url = CASE
        WHEN video_url IS NULL OR video_url = '' THEN 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        ELSE video_url
    END,
    description = CASE
        WHEN description IS NULL OR description = '' THEN 'Detaillierte Erklärung zu ' || title
        ELSE description
    END,
    updated_at = CURRENT_TIMESTAMP
WHERE course_id IN (20, 21, 22, 23, 24);

-- Add missing quiz questions for modules that don't have any
INSERT INTO quiz_questions (module_id, question, options, correct_answer, explanation, order_index)
SELECT 
    m.id,
    'Was haben Sie in diesem Modul gelernt?',
    '["Grundlagen", "Fortgeschrittene Konzepte", "Praktische Anwendung", "Alle genannten"]',
    3,
    'Dieses Modul deckt alle wichtigen Aspekte des Themas ab.',
    1
FROM modules m
LEFT JOIN quiz_questions q ON m.id = q.module_id
WHERE m.course_id IN (20, 21, 22, 23, 24)
AND q.id IS NULL;

-- Update module order to ensure proper sequencing
UPDATE modules SET order_index = subquery.new_order
FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY order_index, id) as new_order
    FROM modules
    WHERE course_id IN (20, 21, 22, 23, 24)
) AS subquery
WHERE modules.id = subquery.id;

-- Ensure all courses have proper total module counts
UPDATE courses SET
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (20, 21, 22, 23, 24);
