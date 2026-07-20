use rusqlite::Connection;

pub fn run_migrations(conn: &Connection) {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'todo',
            priority TEXT NOT NULL DEFAULT 'medium',
            due_date TEXT,
            category TEXT DEFAULT '',
            tags TEXT DEFAULT '[]',
            progress INTEGER DEFAULT 0,
            notes TEXT DEFAULT '',
            estimated_time INTEGER,
            actual_time INTEGER,
            color TEXT DEFAULT '',
            is_pinned INTEGER DEFAULT 0,
            is_recurring INTEGER DEFAULT 0,
            recurring_rule TEXT DEFAULT '',
            parent_id TEXT,
            dependencies TEXT DEFAULT '[]',
            order_index INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            completed_at TEXT,
            archived_at TEXT
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id TEXT PRIMARY KEY,
            task_id TEXT,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            duration INTEGER NOT NULL,
            session_type TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS task_history (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            action TEXT NOT NULL,
            old_value TEXT,
            new_value TEXT,
            timestamp TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at);
        CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_history_task ON task_history(task_id);

        INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'system');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('opacity', '0.9');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('glass_intensity', '0.6');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('notifications_enabled', 'true');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('always_on_top', 'false');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_launch', 'false');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('font_size', 'medium');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('accent_color', '#60cdff');
        INSERT OR IGNORE INTO settings (key, value) VALUES ('desktop_mode', 'false');
        ",
    )
    .expect("Failed to run database migrations");
}
