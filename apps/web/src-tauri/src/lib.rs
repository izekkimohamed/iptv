use std::process::Command;
use tokio::time::sleep;
use std::time::Duration;
use tauri::Emitter;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::Manager;

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    if let Some(splashscreen) = window.get_webview_window("splashscreen") {
        let _ = splashscreen.close();
    }
    if let Some(main_window) = window.get_webview_window("main") {
        let _ = main_window.show();
    }
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn minimize_app(window: tauri::Window) {
    let _ = window.minimize();
}

fn find_vlc_binary() -> Option<String> {
    let vlc_binaries = ["vlc", "/snap/bin/vlc", "/usr/bin/vlc", "/usr/local/bin/vlc"];
    for binary in &vlc_binaries {
        if Command::new(binary)
            .arg("--version")
            .output()
            .is_ok()
        {
            return Some(binary.to_string());
        }
    }
    None
}

#[tauri::command]
async fn open_in_vlc(app: tauri::AppHandle, url: String, aspect_ratio: Option<String>, start_position: Option<f64>) -> Result<f64, String> {
    let vlc_binary = find_vlc_binary().ok_or("VLC not found")?;
    let password = "tauri_internal";
    let port = "8080";

    let mut cmd = Command::new(&vlc_binary);

    // Set aspect ratio if provided
    if let Some(ratio) = aspect_ratio {
        cmd.arg(format!("--aspect-ratio={}", ratio));
    }

    // Hide video title
    cmd.arg("--no-video-title-show");

    // toggle fullscreen
    cmd.arg("--fullscreen");

    // Start from position if provided (in seconds)
    if let Some(pos) = start_position {
        cmd.arg(format!("--start-time={}", pos));
    }

    cmd.arg(&url);
    cmd.arg("--extraintf=http");
    cmd.arg(format!("--http-password={}", password));
    cmd.arg(format!("--http-port={}", port));

    let mut child = cmd.spawn()
        .map_err(|e| format!("Failed to launch VLC: {}", e))?;

    let mut last_position = 0.0;
    let client = reqwest::Client::new();
    let status_url = format!("http://localhost:{}/requests/status.json", port);

    // Poll VLC status until the process exits
    loop {
        match child.try_wait() {
            Ok(Some(_status)) => break, // VLC closed
            Ok(None) => {
                // VLC is still running, try to get the time
                if let Ok(resp) = client.get(&status_url)
                    .basic_auth("", Some(password.to_string()))
                    .send()
                    .await {

                    if let Ok(json) = resp.json::<serde_json::Value>().await {
                        // VLC returns 'time' in seconds
                        if let Some(time) = json["time"].as_f64() {
                            last_position = time;
                            // Emit position update to frontend
                            let _ = app.emit("vlc-position-update", time);
                        }
                    }
                }
                sleep(Duration::from_millis(1000)).await;
            }
            Err(e) => return Err(format!("Error waiting for VLC: {}", e)),
        }
    }

    // Emit vlc-closed event to frontend
    let _ = app.emit("vlc-closed", last_position);

    println!("VLC closed at: {} seconds", last_position);
    Ok(last_position)
}
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![close_splashscreen, quit_app, minimize_app, open_in_vlc])
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
