use tauri::{AppHandle, Manager};

use crate::db::repository;

#[tauri::command]
pub async fn toggle_always_on_top(app: AppHandle) -> Result<bool, String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    let current = window.is_always_on_top().map_err(|e| e.to_string())?;
    window
        .set_always_on_top(!current)
        .map_err(|e| e.to_string())?;
    let conn = repository::get_connection(&repository::db_path(&app));
    repository::upsert_setting(&conn, "always_on_top", &(!current).to_string())
        .map_err(|e| e.to_string())?;
    Ok(!current)
}

#[tauri::command]
pub async fn set_window_alpha(app: AppHandle, alpha: f64) -> Result<(), String> {
    // The window is launched transparent; the visual opacity is driven from the
    // frontend via the `.app-container { opacity: var(--window-opacity) }` rule.
    // Here we only persist the preference so it survives restarts.
    let clamped = alpha.clamp(0.15, 1.0);
    let conn = repository::get_connection(&repository::db_path(&app));
    repository::upsert_setting(&conn, "opacity", &clamped.to_string())
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn set_desktop_mode(app: AppHandle, enabled: bool) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    // In desktop mode we drop the window below other windows and keep it click-through friendly.
    window
        .set_always_on_top(!enabled)
        .map_err(|e| e.to_string())?;
    let conn = repository::get_connection(&repository::db_path(&app));
    repository::upsert_setting(&conn, "desktop_mode", &enabled.to_string())
        .map_err(|e| e.to_string())?;
    Ok(())
}
