use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use tauri::Manager;

pub struct DbState {
    pub path: PathBuf,
}

pub fn get_connection(db_path: &PathBuf) -> Connection {
    Connection::open(db_path).expect("Failed to open database")
}

/// Retrieves the managed database path from the app handle. This lets
/// command handlers (which only receive `AppHandle`) reach the database
/// without re-resolving the app data directory.
pub fn db_path<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> PathBuf {
    let state = app.state::<DbState>();
    state.path.clone()
}

pub fn insert_task(conn: &Connection, task: &super::super::commands::tasks::Task) -> Result<()> {
    conn.execute(
        "INSERT INTO tasks (id, title, description, status, priority, due_date, category, tags,
         progress, notes, estimated_time, actual_time, color, is_pinned, is_recurring,
         recurring_rule, parent_id, dependencies, order_index, created_at, updated_at,
         completed_at, archived_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23)",
        params![
            task.id, task.title, task.description, task.status, task.priority,
            task.due_date, task.category, task.tags, task.progress, task.notes,
            task.estimated_time, task.actual_time, task.color, task.is_pinned as i32,
            task.is_recurring as i32, task.recurring_rule, task.parent_id,
            task.dependencies, task.order_index, task.created_at, task.updated_at,
            task.completed_at, task.archived_at
        ],
    )?;
    Ok(())
}

pub fn update_task(conn: &Connection, task: &super::super::commands::tasks::Task) -> Result<()> {
    conn.execute(
        "UPDATE tasks SET title=?1, description=?2, status=?3, priority=?4, due_date=?5,
         category=?6, tags=?7, progress=?8, notes=?9, estimated_time=?10, actual_time=?11,
         color=?12, is_pinned=?13, is_recurring=?14, recurring_rule=?15, parent_id=?16,
         dependencies=?17, order_index=?18, updated_at=?19, completed_at=?20, archived_at=?21
         WHERE id=?22",
        params![
            task.title, task.description, task.status, task.priority,
            task.due_date, task.category, task.tags, task.progress, task.notes,
            task.estimated_time, task.actual_time, task.color, task.is_pinned as i32,
            task.is_recurring as i32, task.recurring_rule, task.parent_id,
            task.dependencies, task.order_index, task.updated_at,
            task.completed_at, task.archived_at, task.id
        ],
    )?;
    Ok(())
}

pub fn delete_task(conn: &Connection, id: &str) -> Result<()> {
    conn.execute("DELETE FROM tasks WHERE id = ?1", params![id])?;
    Ok(())
}

/// Counts non-archived tasks. Used to detect the first run of the application.
pub fn count_tasks(conn: &Connection) -> Result<i64> {
    conn.query_row(
        "SELECT COUNT(*) FROM tasks WHERE status != 'archived'",
        [],
        |row| row.get(0),
    )
}

pub fn get_all_tasks(conn: &Connection) -> Result<Vec<super::super::commands::tasks::Task>> {
    let mut stmt = conn.prepare(
        "SELECT id, title, description, status, priority, due_date, category, tags,
         progress, notes, estimated_time, actual_time, color, is_pinned, is_recurring,
         recurring_rule, parent_id, dependencies, order_index, created_at, updated_at,
         completed_at, archived_at
         FROM tasks ORDER BY order_index ASC, created_at DESC"
    )?;

    let tasks = stmt.query_map([], |row| {
        Ok(super::super::commands::tasks::Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            status: row.get(3)?,
            priority: row.get(4)?,
            due_date: row.get(5)?,
            category: row.get(6)?,
            tags: row.get(7)?,
            progress: row.get(8)?,
            notes: row.get(9)?,
            estimated_time: row.get(10)?,
            actual_time: row.get(11)?,
            color: row.get(12)?,
            is_pinned: row.get::<_, i32>(13)? != 0,
            is_recurring: row.get::<_, i32>(14)? != 0,
            recurring_rule: row.get(15)?,
            parent_id: row.get(16)?,
            dependencies: row.get(17)?,
            order_index: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
            completed_at: row.get(21)?,
            archived_at: row.get(22)?,
        })
    })?;

    let mut result = Vec::new();
    for task in tasks {
        result.push(task?);
    }
    Ok(result)
}

pub fn get_task_by_id(conn: &Connection, id: &str) -> Result<super::super::commands::tasks::Task> {
    conn.query_row(
        "SELECT id, title, description, status, priority, due_date, category, tags,
         progress, notes, estimated_time, actual_time, color, is_pinned, is_recurring,
         recurring_rule, parent_id, dependencies, order_index, created_at, updated_at,
         completed_at, archived_at FROM tasks WHERE id = ?1",
        params![id],
        |row| {
            Ok(super::super::commands::tasks::Task {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                due_date: row.get(5)?,
                category: row.get(6)?,
                tags: row.get(7)?,
                progress: row.get(8)?,
                notes: row.get(9)?,
                estimated_time: row.get(10)?,
                actual_time: row.get(11)?,
                color: row.get(12)?,
                is_pinned: row.get::<_, i32>(13)? != 0,
                is_recurring: row.get::<_, i32>(14)? != 0,
                recurring_rule: row.get(15)?,
                parent_id: row.get(16)?,
                dependencies: row.get(17)?,
                order_index: row.get(18)?,
                created_at: row.get(19)?,
                updated_at: row.get(20)?,
                completed_at: row.get(21)?,
                archived_at: row.get(22)?,
            })
        },
    )
}

pub fn reorder_task(conn: &Connection, id: &str, status: &str, order_index: i32) -> Result<()> {
    conn.execute(
        "UPDATE tasks SET status = ?1, order_index = ?2, updated_at = datetime('now') WHERE id = ?3",
        params![status, order_index, id],
    )?;
    Ok(())
}

pub fn insert_history(
    conn: &Connection,
    task_id: &str,
    action: &str,
    old_value: Option<&str>,
    new_value: Option<&str>,
) -> Result<()> {
    let id = uuid::Uuid::new_v4().to_string();
    let timestamp = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO task_history (id, task_id, action, old_value, new_value, timestamp)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, task_id, action, old_value, new_value, timestamp],
    )?;
    Ok(())
}

pub fn insert_history_entry(
    conn: &Connection,
    entry: &super::super::commands::tasks::TaskHistory,
) -> Result<()> {
    conn.execute(
        "INSERT INTO task_history (id, task_id, action, old_value, new_value, timestamp)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![entry.id, entry.task_id, entry.action, entry.old_value, entry.new_value, entry.timestamp],
    )?;
    Ok(())
}

pub fn get_history(
    conn: &Connection,
    task_id: Option<&str>,
) -> Result<Vec<super::super::commands::tasks::TaskHistory>> {
    let mut query = String::from(
        "SELECT id, task_id, action, old_value, new_value, timestamp FROM task_history",
    );
    if task_id.is_some() {
        query.push_str(" WHERE task_id = ?1");
    }
    query.push_str(" ORDER BY timestamp DESC LIMIT 100");

    let mut stmt = conn.prepare(&query)?;

    let mut result = Vec::new();
    if let Some(tid) = task_id {
        let entries = stmt.query_map(params![tid], |row| {
            Ok(super::super::commands::tasks::TaskHistory {
                id: row.get(0)?,
                task_id: row.get(1)?,
                action: row.get(2)?,
                old_value: row.get(3)?,
                new_value: row.get(4)?,
                timestamp: row.get(5)?,
            })
        })?;
        for entry in entries {
            result.push(entry?);
        }
    } else {
        let entries = stmt.query_map([], |row| {
            Ok(super::super::commands::tasks::TaskHistory {
                id: row.get(0)?,
                task_id: row.get(1)?,
                action: row.get(2)?,
                old_value: row.get(3)?,
                new_value: row.get(4)?,
                timestamp: row.get(5)?,
            })
        })?;
        for entry in entries {
            result.push(entry?);
        }
    }
    Ok(result)
}

pub fn get_today_stats(
    conn: &Connection,
) -> Result<super::super::commands::stats::TodayStats, rusqlite::Error> {
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    let total: i64 =
        conn.query_row("SELECT COUNT(*) FROM tasks WHERE status != 'archived'", [], |row| {
            row.get(0)
        })?;

    let completed: i64 = conn.query_row(
        "SELECT COUNT(*) FROM tasks WHERE status = 'completed' AND date(completed_at) = ?1",
        params![today],
        |row| row.get(0),
    )?;

    let remaining: i64 = conn.query_row(
        "SELECT COUNT(*) FROM tasks WHERE status IN ('todo', 'in_progress')",
        [],
        |row| row.get(0),
    )?;

    let productivity = if total > 0 {
        (completed as f64 / total as f64) * 100.0
    } else {
        0.0
    };

    let completion_rate = if total > 0 {
        (completed as f64 / total.max(1) as f64) * 100.0
    } else {
        0.0
    };

    Ok(super::super::commands::stats::TodayStats {
        total,
        completed,
        remaining,
        productivity,
        completion_rate,
    })
}

pub fn get_weekly_stats(
    conn: &Connection,
) -> Result<super::super::commands::stats::WeeklyStats, rusqlite::Error> {
    let mut daily_counts = Vec::new();
    let mut stmt = conn.prepare(
        "SELECT date(completed_at) as d, COUNT(*) as c
         FROM tasks
         WHERE status = 'completed'
         AND completed_at >= datetime('now', '-7 days')
         GROUP BY d
         ORDER BY d ASC",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(super::super::commands::stats::DayCount {
            date: row.get(0)?,
            count: row.get(1)?,
        })
    })?;

    for row in rows {
        daily_counts.push(row?);
    }

    let total_completed: i64 = daily_counts.iter().map(|d| d.count).sum();

    Ok(super::super::commands::stats::WeeklyStats {
        total_completed,
        daily_counts,
    })
}

pub fn get_streak(conn: &Connection) -> Result<super::super::commands::stats::Streak, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT DISTINCT date(completed_at) as d
         FROM tasks
         WHERE status = 'completed'
         ORDER BY d DESC LIMIT 365",
    )?;

    let dates: Vec<String> = stmt
        .query_map([], |row| row.get(0))?
        .filter_map(|r| r.ok())
        .collect();

    let mut longest = 0i64;
    let mut streak = 0i64;
    let today = chrono::Utc::now().date_naive();

    for i in 0..dates.len() {
        if let Ok(d) = chrono::NaiveDate::parse_from_str(&dates[i], "%Y-%m-%d") {
            let expected = today - chrono::Duration::days(i as i64);
            if d == expected {
                streak += 1;
                if streak > longest {
                    longest = streak;
                }
            } else {
                break;
            }
        }
    }
    let current = streak;

    // compute longest streak
    streak = 0;
    let mut prev: Option<chrono::NaiveDate> = None;
    for date_str in &dates {
        if let Ok(d) = chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
            if let Some(p) = prev {
                if (p - d).num_days() == 1 {
                    streak += 1;
                } else {
                    streak = 1;
                }
            } else {
                streak = 1;
            }
            if streak > longest {
                longest = streak;
            }
            prev = Some(d);
        }
    }

    Ok(super::super::commands::stats::Streak { current, longest })
}

pub fn get_all_settings(
    conn: &Connection,
) -> Result<std::collections::HashMap<String, String>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;

    let mut map = std::collections::HashMap::new();
    for row in rows {
        let (k, v) = row?;
        map.insert(k, v);
    }
    Ok(map)
}

pub fn upsert_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2)
         ON CONFLICT(key) DO UPDATE SET value = ?2",
        params![key, value],
    )?;
    Ok(())
}
