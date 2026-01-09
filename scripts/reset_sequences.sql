SELECT setval(pg_get_serial_sequence('"User"', 'id'), coalesce(max(id), 0) + 1, false) FROM "User";
SELECT setval(pg_get_serial_sequence('"Post"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Post";
SELECT setval(pg_get_serial_sequence('"Project"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Project";
SELECT setval(pg_get_serial_sequence('"Comment"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Comment";
SELECT setval(pg_get_serial_sequence('"Tag"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Tag";
SELECT setval(pg_get_serial_sequence('"Guestbook"', 'id'), coalesce(max(id), 0) + 1, false) FROM "Guestbook";
SELECT setval(pg_get_serial_sequence('"ProjectStar"', 'id'), coalesce(max(id), 0) + 1, false) FROM "ProjectStar";
