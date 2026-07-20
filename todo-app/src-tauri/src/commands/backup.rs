use crate::db::repository;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub tasks: Vec<super::tasks::Task>,
    pub history: Vec<super::tasks::TaskHistory>,
}

#[tauri::command]
pub fn export_tasks(state: State<repository::DbState>) -> Result<ExportData, String> {
    let conn = repository::get_connection(&state.path);
    let tasks = repository::get_all_tasks(&conn).map_err(|e| e.to_string())?;
    let history = repository::get_history(&conn, None).map_err(|e| e.to_string())?;
    Ok(ExportData { tasks, history })
}

#[tauri::command]
pub fn import_tasks(
    state: State<repository::DbState>,
    data: ExportData,
) -> Result<(), String> {
    let conn = repository::get_connection(&state.path);
    for task in &data.tasks {
        repository::insert_task(&conn, task).map_err(|e| e.to_string())?;
    }
    for entry in &data.history {
        repository::insert_history_entry(&conn, entry).map_err(|e| e.to_string())?;
    }
    Ok(())
}
