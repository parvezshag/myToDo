# Todo App

A premium Windows desktop Todo application with Fluent Design, Mica effects, and Kanban-style task management. Built with Tauri v2 + React + TypeScript.

## Features

- **Kanban Board**: Drag-and-drop tasks across Todo, In Progress, and Completed columns
- **Fluent Design**: Mica material, acrylic glass effects, rounded corners, dark/light mode
- **Desktop Widget**: Always-on-top mode, transparent background, resizable window
- **Rich Task Cards**: Priority, due dates, tags, categories, progress bars, estimated time
- **Quick Add**: Ctrl+N for instant task creation
- **Search & Filters**: Instant search by title, category, tags; filter by status, priority, date
- **Statistics Dashboard**: Today's tasks, completion rate, weekly progress, streaks
- **Pomodoro Timer**: Built-in focus timer with floating widget
- **Focus Mode**: Distraction-free fullscreen focus mode
- **Multiple Views**: Kanban, Calendar, Timeline, Heatmap
- **Notifications**: Desktop toast notifications for reminders
- **Keyboard Shortcuts**: Ctrl+N, Ctrl+F, Ctrl+Z, Ctrl+D, Delete, Space
- **Themes**: Light, Dark, System auto-detection
- **Customizable**: Accent color, opacity, glass intensity, font size
- **SQLite Persistence**: All data stored locally, auto-save after every change
- **Export/Import**: JSON and CSV export
- **Context Menu**: Right-click tasks for quick actions
- **Confetti Animation**: Visual celebration on task completion

## Prerequisites

- Node.js 18+
- Rust toolchain (install via https://rustup.rs)

## Development

```bash
# Install frontend dependencies
npm install

# Run in development mode
npm run tauri:dev
```

## Build

```bash
# Build production installer (MSI)
npm run tauri:build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New Task |
| Ctrl+F | Search |
| Ctrl+Z | Undo |
| Ctrl+D | Duplicate Task |
| Ctrl+P | Pomodoro Timer |
| Ctrl+, | Settings |
| Delete | Delete Task |
| Space | Toggle Complete |
| Escape | Close Dialog |

## Project Structure

```
todo-app/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── commands/   # Tauri command handlers
│   │   ├── db/         # SQLite database layer
│   │   └── window/     # Windows DWM effects
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                # React frontend
│   ├── components/     # UI components
│   │   ├── kanban/     # Kanban board & cards
│   │   ├── task/       # Task dialog & quick add
│   │   ├── dashboard/  # Statistics cards
│   │   ├── settings/   # Settings panel
│   │   ├── pomodoro/   # Timer & focus mode
│   │   ├── views/      # Calendar, Timeline, Heatmap
│   │   └── common/     # Shared components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand state management
│   ├── services/       # API services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities
│   └── context/        # React context providers
└── package.json
```

## Tech Stack

- **Desktop Shell**: Tauri v2
- **UI**: React 18 + TypeScript
- **State**: Zustand
- **Drag & Drop**: @dnd-kit
- **Animations**: Framer Motion
- **Database**: SQLite (rusqlite)
- **Window Effects**: Windows DWM API
- **Build**: Vite 6
