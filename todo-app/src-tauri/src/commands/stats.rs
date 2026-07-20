use crate::db::repository;
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize)]
pub struct TodayStats {
    pub total: i64,
    pub completed: i64,
    pub remaining: i64,
    pub productivity: f64,
    pub completion_rate: f64,
}

#[derive(Debug, Serialize)]
pub struct WeeklyStats {
    pub total_completed: i64,
    pub daily_counts: Vec<DayCount>,
}

#[derive(Debug, Serialize)]
pub struct DayCount {
    pub date: String,
    pub count: i64,
}

#[derive(Debug, Serialize)]
pub struct Streak {
    pub current: i64,
    pub longest: i64,
}

#[tauri::command]
pub fn get_today_stats(state: State<repository::DbState>) -> Result<TodayStats, String> {
    let conn = repository::get_connection(&state.path);
    repository::get_today_stats(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_weekly_stats(state: State<repository::DbState>) -> Result<WeeklyStats, String> {
    let conn = repository::get_connection(&state.path);
    repository::get_weekly_stats(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_streak(state: State<repository::DbState>) -> Result<Streak, String> {
    let conn = repository::get_connection(&state.path);
    repository::get_streak(&conn).map_err(|e| e.to_string())
}
