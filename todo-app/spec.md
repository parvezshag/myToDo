# myToDo — Technical Specification

## Overview

myToDo is a premium Windows desktop Todo application built with **Tauri v2 + React 18 + TypeScript**. It features a Kanban-style task manager with Fluent Design, Mica effects, drag-and-drop, Pomodoro timer, and multiple views.

## Architecture

```
todo-app/
├── src/              # React frontend
│   ├── components/   # UI components (kanban, task, dashboard, settings, pomodoro, views, common)
│   ├── hooks/        # Custom React hooks
│   ├── store/        # Zustand state management (taskStore, settingsStore, uiStore)
│   ├── services/     # API service layer (taskService, notificationService, exportService)
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions (date, formatters, logger, validators, constants)
│   └── context/      # React context providers (ThemeContext)
├── src-tauri/        # Rust backend
│   ├── src/commands/ # Tauri command handlers (tasks, settings, stats, backup, window)
│   ├── src/db/       # SQLite database layer (repository, migrations)
│   └── src/window/   # Windows DWM effects (Mica material)
└── package.json
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Shell | Tauri v2 |
| UI Framework | React 18 + TypeScript |
| State Management | Zustand |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |
| Database | SQLite (rusqlite, bundled) |
| Window Effects | Windows DWM API |
| Build Tool | Vite 6 |
| Installer | MSI / NSIS |

## Data Model

### Task

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID v4) | Primary key |
| `title` | `string` | Task title |
| `description` | `string` | Task description |
| `status` | `'todo' \| 'in_progress' \| 'completed' \| 'archived' \| 'hold'` | Current status |
| `priority` | `'critical' \| 'high' \| 'medium' \| 'low'` | Priority level |
| `due_date` | `string \| null` (ISO 8601) | Scheduled due date/time |
| `completed_at` | `string \| null` (ISO 8601) | When task was completed |
| `category` | `string` | Task category |
| `tags` | `string[]` | Tags (JSON array in DB) |
| `progress` | `0 \| 25 \| 50 \| 75 \| 100` | Progress percentage |
| `notes` | `string` | Markdown notes |
| `estimated_time` | `number \| null` | Estimated minutes |
| `actual_time` | `number \| null` | Actual minutes spent |
| `color` | `string` | Card accent color (hex) |
| `is_pinned` | `boolean` | Pinned flag |
| `order_index` | `number` | Drag-and-drop order |
| `created_at` | `string` (ISO 8601) | Creation timestamp |
| `updated_at` | `string` (ISO 8601) | Last update timestamp |

### Task Status Flow

```
hold ──→ todo ──→ in_progress ──→ completed
  ↑                                      │
  └──────────────────────────────────────┘
                    │
                    ↓
               archived
```

- **hold**: Task saved without a due date. Auto-exits to `todo` when a due date is assigned, or to `in_progress` if assigned via QuickAdd with a date.
- **todo**: Ready to start.
- **in_progress**: Currently being worked on. Cards turn red when the due date has passed (overdue).
- **completed**: Task finished. Shows delay badge (late / on time) based on `due_date` vs `completed_at`.
- **archived**: Hidden from default views.

### Settings

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `theme` | `'dark' \| 'light' \| 'system'` | `'dark'` | Color theme |
| `accent_color` | `string` | `'#60cdff'` | Accent color (hex) |
| `opacity` | `number` | `0.85` | Glass panel opacity |
| `glass_intensity` | `number` | `20` | Blur intensity |
| `font_size` | `'small' \| 'medium' \| 'large'` | `'medium'` | UI font size |
| `always_on_top` | `boolean` | `false` | Pin window to top |
| `pomodoro_duration` | `number` | `25` | Pomodoro timer (min) |
| `short_break` | `number` | `5` | Short break (min) |
| `long_break` | `number` | `15` | Long break (min) |
| `pomodoro_auto_start` | `boolean` | `false` | Auto-start next session |
| `notifications_enabled` | `boolean` | `true` | Desktop notifications |
| `notify_before_minutes` | `number` | `10` | Reminder lead time |

## API (Tauri Commands)

### Tasks

| Command | Input | Output | Description |
|---------|-------|--------|-------------|
| `create_task` | `CreateTaskInput` | `Task` | Create a new task |
| `update_task` | `UpdateTaskInput` | `Task` | Update a task (sets `completed_at` when status → completed, progress=100 auto-completes) |
| `delete_task` | `id: string` | `()` | Delete a task |
| `get_tasks` | — | `Vec<Task>` | Get all non-archived tasks |
| `get_task_by_id` | `id: string` | `Task` | Get single task |
| `duplicate_task` | `id: string` | `Task` | Clone a task (new id, status=todo) |
| `archive_task` | `id: string` | `Task` | Archive a task |
| `reorder_tasks_batch` | `status, ordered_ids` | `()` | Batch update ordering after drag-and-drop |
| `count_tasks` | — | `i64` | Count tasks (first-run detection) |
| `seed_sample_tasks` | — | `usize` | Seed sample data (if empty) |

### Task History

| Command | Input | Output | Description |
|---------|-------|--------|-------------|
| `get_task_history` | `task_id?: string` | `Vec<TaskHistory>` | Get audit log entries |

### Settings

| Command | Input | Output | Description |
|---------|-------|--------|-------------|
| `get_settings` | — | `String` (JSON) | Get all settings |
| `update_setting` | `key, value` | `()` | Update a single setting |

### Stats

| Command | Input | Output | Description |
|---------|-------|--------|-------------|
| `get_today_stats` | — | `TodayStats` | Today's task counts |
| `get_weekly_stats` | — | `WeeklyStats` | Weekly completion data |
| `get_streak` | — | `Streak` | Current streak info |

### Backup / Export

| Command | Input | Output | Description |
|---------|-------|--------|-------------|
| `export_tasks_json` | — | `String` | JSON export |
| `export_tasks_csv` | — | `String` | CSV export |

## Views

| View | Description |
|------|-------------|
| **Kanban** | Drag-and-drop columns (Todo, In Progress, Completed) |
| **Calendar** | Tasks displayed on a monthly calendar |
| **Timeline** | Chronological task timeline |
| **Heatmap** | GitHub-style contribution heatmap |

## Column Sorting

| Column | Sort Order |
|--------|-----------|
| Todo | `order_index` ascending |
| In Progress | `due_date` ascending (earliest deadline first) |
| Completed | `completed_at` descending (newest first) |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New Task (QuickAdd) |
| `Ctrl+F` | Search |
| `Ctrl+Z` | Undo |
| `Ctrl+D` | Duplicate selected task |
| `Ctrl+P` | Pomodoro Timer |
| `Ctrl+,` | Settings |
| `Delete` | Delete selected task |
| `Space` | Toggle complete |
| `Escape` | Close dialog |

## Window Configuration

- **Decorations**: False (custom title bar)
- **Transparent**: True (acrylic/Mica effects)
- **Resizable**: True
- **Maximizable**: False (maximize button removed)
- **Min Width**: 900px
- **Min Height**: 600px
- **Default Size**: 1280x800

## Database

- **Engine**: SQLite via `rusqlite` (bundled, no external dependencies)
- **File**: `todo.db` stored at `app_data_dir/com.todoapp.desktop/todo.db`
- **Migrations**: Auto-run on startup (`db/migrations.rs`)
- **Performance**: SQLite WAL mode for concurrent read/write
