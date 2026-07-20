use crate::db::repository;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub priority: String,
    pub due_date: Option<String>,
    pub category: String,
    pub tags: String,
    pub progress: i32,
    pub notes: String,
    pub estimated_time: Option<i32>,
    pub actual_time: Option<i32>,
    pub color: String,
    pub is_pinned: bool,
    pub is_recurring: bool,
    pub recurring_rule: String,
    pub parent_id: Option<String>,
    pub dependencies: String,
    pub order_index: i32,
    pub created_at: String,
    pub updated_at: String,
    pub completed_at: Option<String>,
    pub archived_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateTaskInput {
    pub title: String,
    pub description: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub category: Option<String>,
    pub tags: Option<String>,
    pub progress: Option<i32>,
    pub notes: Option<String>,
    pub estimated_time: Option<i32>,
    pub color: Option<String>,
    pub parent_id: Option<String>,
    pub dependencies: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateTaskInput {
    pub id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub category: Option<String>,
    pub tags: Option<String>,
    pub progress: Option<i32>,
    pub notes: Option<String>,
    pub estimated_time: Option<i32>,
    pub actual_time: Option<i32>,
    pub color: Option<String>,
    pub is_pinned: Option<bool>,
    pub is_recurring: Option<bool>,
    pub recurring_rule: Option<String>,
    pub parent_id: Option<String>,
    pub dependencies: Option<String>,
    pub order_index: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReorderInput {
    pub id: String,
    pub status: String,
    pub order_index: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskHistory {
    pub id: String,
    pub task_id: String,
    pub action: String,
    pub old_value: Option<String>,
    pub new_value: Option<String>,
    pub timestamp: String,
}

fn now_iso() -> String {
    Utc::now().to_rfc3339()
}

fn generate_id() -> String {
    Uuid::new_v4().to_string()
}

#[tauri::command]
pub fn create_task(
    state: State<repository::DbState>,
    input: CreateTaskInput,
) -> Result<Task, String> {
    let conn = repository::get_connection(&state.path);
    let now = now_iso();
    let id = generate_id();
    let task = Task {
        id: id.clone(),
        title: input.title,
        description: input.description.unwrap_or_default(),
        status: input.status.unwrap_or_else(|| "todo".to_string()),
        priority: input.priority.unwrap_or_else(|| "medium".to_string()),
        due_date: input.due_date,
        category: input.category.unwrap_or_default(),
        tags: input.tags.unwrap_or_else(|| "[]".to_string()),
        progress: input.progress.unwrap_or(0),
        notes: input.notes.unwrap_or_default(),
        estimated_time: input.estimated_time,
        actual_time: None,
        color: input.color.unwrap_or_default(),
        is_pinned: false,
        is_recurring: false,
        recurring_rule: String::new(),
        parent_id: input.parent_id,
        dependencies: input.dependencies.unwrap_or_else(|| "[]".to_string()),
        order_index: 0,
        created_at: now.clone(),
        updated_at: now.clone(),
        completed_at: None,
        archived_at: None,
    };

    repository::insert_task(&conn, &task).map_err(|e| e.to_string())?;
    repository::insert_history(&conn, &id, "created", None, Some(&task.status))
        .map_err(|e| e.to_string())?;

    Ok(task)
}

#[tauri::command]
pub fn update_task(
    state: State<repository::DbState>,
    input: UpdateTaskInput,
) -> Result<Task, String> {
    let conn = repository::get_connection(&state.path);
    let mut task = repository::get_task_by_id(&conn, &input.id).map_err(|e| e.to_string())?;

    if let Some(title) = input.title {
        task.title = title;
    }
    if let Some(description) = input.description {
        task.description = description;
    }
    if let Some(status) = input.status {
        if status != task.status {
            let old_status = task.status.clone();
            task.status = status.clone();
            if status == "completed" {
                task.completed_at = Some(now_iso());
                task.progress = 100;
            } else if old_status == "completed" {
                task.completed_at = None;
            }
            repository::insert_history(&conn, &task.id, "status_changed", Some(&old_status), Some(&status))
                .map_err(|e| e.to_string())?;
        } else {
            task.status = status;
        }
    }
    if let Some(priority) = input.priority {
        task.priority = priority;
    }
    if let Some(due_date) = input.due_date {
        task.due_date = Some(due_date);
    }
    if let Some(category) = input.category {
        task.category = category;
    }
    if let Some(tags) = input.tags {
        task.tags = tags;
    }
    if let Some(progress) = input.progress {
        task.progress = progress;
        if progress >= 100 {
            task.status = "completed".to_string();
            task.completed_at = Some(now_iso());
        }
    }
    if let Some(notes) = input.notes {
        task.notes = notes;
    }
    if let Some(estimated_time) = input.estimated_time {
        task.estimated_time = Some(estimated_time);
    }
    if let Some(actual_time) = input.actual_time {
        task.actual_time = Some(actual_time);
    }
    if let Some(color) = input.color {
        task.color = color;
    }
    if let Some(is_pinned) = input.is_pinned {
        task.is_pinned = is_pinned;
    }
    if let Some(is_recurring) = input.is_recurring {
        task.is_recurring = is_recurring;
    }
    if let Some(recurring_rule) = input.recurring_rule {
        task.recurring_rule = recurring_rule;
    }
    if let Some(parent_id) = input.parent_id {
        task.parent_id = Some(parent_id);
    }
    if let Some(dependencies) = input.dependencies {
        task.dependencies = dependencies;
    }
    if let Some(order_index) = input.order_index {
        task.order_index = order_index;
    }

    task.updated_at = now_iso();
    repository::update_task(&conn, &task).map_err(|e| e.to_string())?;

    Ok(task)
}

#[tauri::command]
pub fn delete_task(state: State<repository::DbState>, id: String) -> Result<(), String> {
    let conn = repository::get_connection(&state.path);
    repository::insert_history(&conn, &id, "deleted", None, None).map_err(|e| e.to_string())?;
    repository::delete_task(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_tasks(state: State<repository::DbState>) -> Result<Vec<Task>, String> {
    let conn = repository::get_connection(&state.path);
    repository::get_all_tasks(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_task_by_id(state: State<repository::DbState>, id: String) -> Result<Task, String> {
    let conn = repository::get_connection(&state.path);
    repository::get_task_by_id(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reorder_task(state: State<repository::DbState>, input: ReorderInput) -> Result<(), String> {
    let conn = repository::get_connection(&state.path);
    repository::reorder_task(&conn, &input.id, &input.status, input.order_index)
        .map_err(|e| e.to_string())
}

/// Persists the full ordering of a column after a drag-and-drop reorder.
/// `ordered_ids` is the complete, ordered list of task ids in `status`, and
/// each receives `order_index` equal to its position.
#[tauri::command]
pub fn reorder_tasks_batch(
    state: State<repository::DbState>,
    status: String,
    ordered_ids: Vec<String>,
) -> Result<(), String> {
    let mut conn = repository::get_connection(&state.path);
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    for (idx, id) in ordered_ids.iter().enumerate() {
        tx.execute(
            "UPDATE tasks SET status = ?1, order_index = ?2, updated_at = datetime('now') WHERE id = ?3",
            rusqlite::params![status, idx as i32, id],
        )
        .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn duplicate_task(state: State<repository::DbState>, id: String) -> Result<Task, String> {
    let conn = repository::get_connection(&state.path);
    let original = repository::get_task_by_id(&conn, &id).map_err(|e| e.to_string())?;
    let now = now_iso();
    let new_id = generate_id();
    let duplicate = Task {
        id: new_id.clone(),
        title: format!("{} (copy)", original.title),
        status: "todo".to_string(),
        progress: 0,
        completed_at: None,
        archived_at: None,
        created_at: now.clone(),
        updated_at: now,
        order_index: 0,
        ..original
    };

    repository::insert_task(&conn, &duplicate).map_err(|e| e.to_string())?;
    repository::insert_history(&conn, &new_id, "duplicated", Some(&id), None)
        .map_err(|e| e.to_string())?;

    Ok(duplicate)
}

#[tauri::command]
pub fn archive_task(state: State<repository::DbState>, id: String) -> Result<Task, String> {
    let conn = repository::get_connection(&state.path);
    let mut task = repository::get_task_by_id(&conn, &id).map_err(|e| e.to_string())?;
    let now = now_iso();
    task.status = "archived".to_string();
    task.archived_at = Some(now.clone());
    task.updated_at = now;
    repository::update_task(&conn, &task).map_err(|e| e.to_string())?;
    repository::insert_history(&conn, &id, "archived", None, None).map_err(|e| e.to_string())?;
    Ok(task)
}

#[tauri::command]
pub fn get_task_history(
    state: State<repository::DbState>,
    task_id: Option<String>,
) -> Result<Vec<TaskHistory>, String> {
    let conn = repository::get_connection(&state.path);
    repository::get_history(&conn, task_id.as_deref()).map_err(|e| e.to_string())
}

/// Returns the total number of non-archived tasks. Used to detect first-run.
#[tauri::command]
pub fn count_tasks(state: State<repository::DbState>) -> Result<i64, String> {
    let conn = repository::get_connection(&state.path);
    repository::count_tasks(&conn).map_err(|e| e.to_string())
}

/// Seeds the database with a curated set of sample tasks on first run only.
/// Returns the number of tasks inserted (0 if database already had tasks).
#[tauri::command]
pub fn seed_sample_tasks(state: State<repository::DbState>) -> Result<usize, String> {
    let conn = repository::get_connection(&state.path);
    let existing = repository::count_tasks(&conn).map_err(|e| e.to_string())?;
    if existing > 0 {
        return Ok(0);
    }

    let now = now_iso();
    let samples = build_sample_tasks(now);

    for (idx, task) in samples.iter().enumerate() {
        let mut t = task.clone();
        t.order_index = idx as i32;
        repository::insert_task(&conn, &t).map_err(|e| e.to_string())?;
        repository::insert_history(&conn, &t.id, "created", None, Some(&t.status))
            .map_err(|e| e.to_string())?;
    }

    Ok(samples.len())
}

fn build_sample_tasks(now: String) -> Vec<Task> {
    let make = |title: &str, status: &str, priority: &str, category: &str, tags: &[&str], due_offset_days: i64, progress: i32, est: i32| {
        let due = if due_offset_days == 0 {
            None
        } else {
            Some(Utc::now().checked_add_signed(chrono::Duration::days(due_offset_days)).unwrap().to_rfc3339())
        };
        let tags_json = serde_json::to_string(tags).unwrap_or_else(|_| "[]".to_string());
        Task {
            id: generate_id(),
            title: title.to_string(),
            description: String::new(),
            status: status.to_string(),
            priority: priority.to_string(),
            due_date: due,
            category: category.to_string(),
            tags: tags_json,
            progress,
            notes: String::new(),
            estimated_time: Some(est),
            actual_time: None,
            color: String::new(),
            is_pinned: false,
            is_recurring: false,
            recurring_rule: String::new(),
            parent_id: None,
            dependencies: "[]".to_string(),
            order_index: 0,
            created_at: now.clone(),
            updated_at: now.clone(),
            completed_at: if status == "completed" { Some(now.clone()) } else { None },
            archived_at: None,
        }
    };

    vec![
        make("Welcome to Todo App!", "todo", "high", "Personal", &["welcome"], 1, 0, 15),
        make("Review project roadmap", "todo", "medium", "Work", &["meeting"], 2, 0, 30),
        make("Plan weekly grocery trip", "todo", "low", "Personal", &["errand"], 3, 0, 20),
        make("Read 'Atomic Habits' chapter 3", "in_progress", "medium", "Education", &["reading"], 0, 50, 45),
        make("Finish quarterly report draft", "in_progress", "high", "Work", &["report", "deadline"], -1, 75, 120),
        make("Morning workout - 30min run", "in_progress", "medium", "Health", &["fitness"], 0, 25, 30),
        make("Set up development environment", "completed", "high", "Work", &["setup"], -2, 100, 60),
        make("Reply to team emails", "completed", "low", "Work", &["email"], -1, 100, 15),
        make("Schedule dentist appointment", "completed", "medium", "Health", &["call"], -3, 100, 5),
        make("Organize desk workspace", "todo", "low", "Personal", &["tidy"], 7, 0, 25),
    ]
}
