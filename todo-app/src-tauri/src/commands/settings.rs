use crate::db::repository;
use serde::Serialize;
use std::collections::HashMap;
use tauri::State;
use tauri_plugin_autostart::ManagerExt;

#[derive(Debug, Serialize)]
pub struct SettingsMap {
    pub settings: HashMap<String, String>,
}

#[tauri::command]
pub fn get_settings(state: State<repository::DbState>) -> Result<SettingsMap, String> {
    let conn = repository::get_connection(&state.path);
    let settings = repository::get_all_settings(&conn).map_err(|e| e.to_string())?;
    Ok(SettingsMap { settings })
}

#[tauri::command]
pub fn update_setting(
    app: tauri::AppHandle,
    state: State<repository::DbState>,
    key: String,
    value: String,
) -> Result<(), String> {
    let conn = repository::get_connection(&state.path);
    repository::upsert_setting(&conn, &key, &value).map_err(|e| e.to_string())?;

    if key == "auto_launch" {
        let autostart_manager = app.autolaunch();
        if value == "true" {
            let _ = autostart_manager.enable();
        } else {
            let _ = autostart_manager.disable();
        }
    }

    Ok(())
}
