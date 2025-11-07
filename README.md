# NexLibra (LocalStorage + Pico.css)

Lightweight web-based Library Management System. No build step. Open `index.html` in a modern browser.

Default credentials:
- Admin: admin@nexlibra.local / admin123
- Student: student1@college.edu / student123

Features:
- Admin: Books CRUD, issue/return, mark missing, students list, reports
- Student: Search/issue/return, profile with fines and history
- Fines: ₹2/day late; Missing: book price + ₹200 + pending late

Notes:
- Data stored in LocalStorage under `nexlibra:*`
- First-run seed creates demo users and books

Manual tests in `.plan.md`.


