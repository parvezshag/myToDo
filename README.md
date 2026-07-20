# myToDo

A premium Windows desktop **Todo** application with Fluent Design, Mica effects, and Kanban-style task management. Built with **Tauri v2 + React + TypeScript**.

> The application lives in the [`todo-app/`](./todo-app) directory — a Tauri v2 desktop app bundling a React + TypeScript frontend with a Rust/SQLite backend.

## Features

- **Kanban Board** — drag-and-drop tasks across Todo, In Progress, and Completed columns
- **Fluent Design** — Mica material, acrylic glass effects, rounded corners, dark/light mode
- **Desktop Widget** — always-on-top mode, transparent background, resizable window
- **Rich Task Cards** — priority, due dates, tags, categories, progress bars, estimated time
- **Quick Add** — `Ctrl+N` for instant task creation
- **Search & Filters** — instant search by title, category, tags; filter by status, priority, date
- **Statistics Dashboard** — today's tasks, completion rate, weekly progress, streaks
- **Pomodoro Timer** — built-in focus timer with floating widget
- **Focus Mode** — distraction-free fullscreen focus mode
- **Multiple Views** — Kanban, Calendar, Timeline, Heatmap
- **Notifications** — desktop toast notifications for reminders
- **Keyboard Shortcuts** — `Ctrl+N`, `Ctrl+F`, `Ctrl+Z`, `Ctrl+D`, `Delete`, `Space`
- **Themes** — light, dark, system auto-detection
- **Customizable** — accent color, opacity, glass intensity, font size
- **SQLite Persistence** — all data stored locally, auto-save after every change
- **Export/Import** — JSON and CSV export
- **Confetti Animation** — visual celebration on task completion

## Repository Layout

```
myToDo/
├── todo-app/          # The Tauri + React desktop application
│   ├── src/           # React frontend (components, store, services, hooks, types)
│   ├── src-tauri/     # Rust backend (commands, db, window, tray)
│   └── package.json
├── opencode.json      # opencode MCP configuration (GitHub server)
└── README.md
```

See [`todo-app/README.md`](./todo-app/README.md) for the full feature list, keyboard shortcuts, project structure, and tech stack.

## Prerequisites

- **Node.js** 18+
- **Rust toolchain** — install via https://rustup.rs
- **Windows** (required for the Mica/DWM window effects and MSI build target)

## Getting Started

```bash
# Move into the app directory
cd todo-app

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri:dev
```

## Build

```bash
cd todo-app

# Build production installer (MSI)
npm run tauri:build
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Shell | Tauri v2 |
| UI | React 18 + TypeScript |
| State | Zustand |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |
| Database | SQLite (rusqlite) |
| Window Effects | Windows DWM API |
| Build | Vite 6 |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Task |
| `Ctrl+F` | Search |
| `Ctrl+Z` | Undo |
| `Ctrl+D` | Duplicate Task |
| `Ctrl+P` | Pomodoro Timer |
| `Ctrl+,` | Settings |
| `Delete` | Delete Task |
| `Space` | Toggle Complete |
| `Escape` | Close Dialog |

## License

This project is provided as-is for personal use.
