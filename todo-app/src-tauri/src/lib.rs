mod commands;
mod db;
mod window;
mod tray;

use db::migrations;
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use window::effects;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![])))
        .setup(|app| {
            {
                let handle = app.handle();
                let db_path = handle
                    .path()
                    .app_data_dir()
                    .expect("failed to get app data dir");
                std::fs::create_dir_all(&db_path).ok();
                let db_path = db_path.join("todo.db");
                let conn = db::repository::get_connection(&db_path);
                migrations::run_migrations(&conn);
                handle.manage(db::repository::DbState { path: db_path });
            }

            {
                let window = app.get_webview_window("main").unwrap();
                effects::apply_mica(&window);
                effects::apply_rounded_corners(&window);
                effects::apply_theme(&window, true);
            }

            // The window-state plugin automatically persists and restores
            // position/size. Nothing else is required here.

            // System tray with show/hide/quit.
            if let Err(e) = tray::create_tray(app.handle()) {
                eprintln!("Failed to create tray: {e}");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::tasks::create_task,
            commands::tasks::update_task,
            commands::tasks::delete_task,
            commands::tasks::get_tasks,
            commands::tasks::get_task_by_id,
            commands::tasks::reorder_task,
            commands::tasks::reorder_tasks_batch,
            commands::tasks::duplicate_task,
            commands::tasks::archive_task,
            commands::tasks::get_task_history,
            commands::tasks::seed_sample_tasks,
            commands::tasks::count_tasks,
            commands::stats::get_today_stats,
            commands::stats::get_weekly_stats,
            commands::stats::get_streak,
            commands::settings::get_settings,
            commands::settings::update_setting,
            commands::backup::export_tasks,
            commands::backup::import_tasks,
            commands::window::toggle_always_on_top,
            commands::window::set_window_alpha,
            commands::window::set_desktop_mode,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
