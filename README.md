Agile State Manager 📋
A logic-driven task management board built with Vanilla JavaScript. Unlike standard To-Do lists, this application enforces Agile workflow rules, manages "Work In Progress" (WIP) limits, and handles task blocking states automatically.

🔗 https://barotnisarg.github.io/Agile-State-Manager/

🔗 https://agile-state-manager.vercel.app/

🚀 Key Features
Workflow Enforcement: Tasks must follow a strict path (Backlog → In Progress → In Review → Done).

WIP Limits: To prevent burnout, the board limits how many tasks can be active:

In Progress: Max 3 tasks.

In Review: Max 2 tasks.

Smart Blocking: If a user tries to move a task into a full column, the task is automatically sent to the Blocked state (Red column) and tagged with a specific reason.

Auto-Unblocking: When space clears up in a column, the app attempts to automatically move blocked cards back into the workflow.

Data Persistence: Uses localStorage so your tasks remain saved even after refreshing the page.

🛠️ Tech Stack
HTML5 (Semantic structure)

CSS3 (Flexbox, Dark Mode theme, Glassmorphism effects)

JavaScript (ES6+) (DOM Manipulation, Drag & Drop API, State Logic)

🧠 Project Learnings & Retrospective
This project was built to master Vanilla JavaScript fundamentals before moving to a framework. While the core features work well, I have identified specific areas where the code can be improved in future versions:

1. Refactoring Conditional Logic
Currently, the drag-and-drop validation relies on nested if/else if/else statements.

The Issue: This makes the code harder to read and scale if new columns were added.

The Solution: In the next version, I plan to refactor this using a State Map Object or a State Machine pattern to handle transitions cleaner.

2. Mobile Responsiveness
The application currently uses the native HTML5 Drag and Drop API (draggable="true").

The Issue: This API does not natively support touch events on mobile devices. As a result, the drag functionality works best on Desktop/Laptop screens.

The Solution: Implementing Touch Events or using a library to map mouse events to touch events would make this fully responsive.

🔮 Future Improvements
Refactor drop event listeners to remove nested conditions.

Add touch support for mobile devices.

Migrate the state management to a JavaScript Object (Model-View approach) rather than reading from the DOM.

Created by Nisarg Barot as part of my Full Stack Development journey.
