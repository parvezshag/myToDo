use tauri::WebviewWindow;
use windows::Win32::Foundation::HWND;
use windows::Win32::Graphics::Dwm::*;

pub fn get_hwnd(window: &WebviewWindow) -> Option<HWND> {
    window.hwnd().ok()
}

pub fn apply_mica(window: &WebviewWindow) {
    if let Some(hwnd) = get_hwnd(window) {
        unsafe {
            let mut enabled: i32 = 1;
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWINDOWATTRIBUTE(38),
                &mut enabled as *mut i32 as *mut std::ffi::c_void,
                std::mem::size_of::<i32>() as u32,
            );
        }
    }
}

pub fn apply_rounded_corners(window: &WebviewWindow) {
    if let Some(hwnd) = get_hwnd(window) {
        unsafe {
            let mut pref = DWMWINDOWATTRIBUTE(2); // DWMWCP_ROUND
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWINDOWATTRIBUTE(33),
                &mut pref as *mut DWMWINDOWATTRIBUTE as *mut std::ffi::c_void,
                std::mem::size_of::<DWMWINDOWATTRIBUTE>() as u32,
            );
        }
    }
}

pub fn apply_theme(window: &WebviewWindow, is_dark: bool) {
    if let Some(hwnd) = get_hwnd(window) {
        unsafe {
            let mut dark_mode: i32 = is_dark as i32;
            let _ = DwmSetWindowAttribute(
                hwnd,
                DWMWINDOWATTRIBUTE(20),
                &mut dark_mode as *mut i32 as *mut std::ffi::c_void,
                std::mem::size_of::<i32>() as u32,
            );
        }
    }
}
