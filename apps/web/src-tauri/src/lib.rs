#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::Manager;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![quit_app])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // ✅ Correct API in Tauri v2
            let main_window = app.get_webview_window("main").unwrap();

            // Force fullscreen on startup
            main_window.set_fullscreen(true).unwrap();

            // Listen for events to keep it fullscreen
            let window_clone = main_window.clone();
            main_window.on_window_event(move |_event| {
                let _ = window_clone.set_fullscreen(true);
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}
