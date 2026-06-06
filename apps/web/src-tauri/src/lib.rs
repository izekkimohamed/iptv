use std::net::TcpListener;
use std::process::Command;
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
    let vlc_binaries = [
        "vlc",
        "/snap/bin/vlc",
        "/usr/bin/vlc",
        "/usr/local/bin/vlc",
        "/var/lib/flatpak/exports/bin/org.videolan.VLC",
        "/app/bin/vlc",
    ];
    for binary in &vlc_binaries {
        if Command::new(binary).arg("--version").output().is_ok() {
            return Some(binary.to_string());
        }
    }
    None
}

fn find_available_port() -> u16 {
    for port in 8080..=8090 {
        if let Ok(listener) = TcpListener::bind(("127.0.0.1", port)) {
            drop(listener);
            return port;
        }
    }
    8080
}

#[tauri::command]
async fn open_in_vlc(
    app: tauri::AppHandle,
    url: String,
    aspect_ratio: Option<String>,
    start_position: Option<f64>,
) -> Result<(), String> {
    let vlc_binary = find_vlc_binary().ok_or_else(|| {
        "VLC not found. Install VLC media player to use this feature.".to_string()
    })?;

    let port = find_available_port();
    let password = "tauri_internal";

    let mut cmd = Command::new(&vlc_binary);

    // Flags BEFORE the URL (ordering matters for some VLC builds)
    if let Some(ratio) = aspect_ratio {
        cmd.arg(format!("--aspect-ratio={}", ratio));
    }
    cmd.arg("--no-video-title-show");
    cmd.arg("--fullscreen");
    cmd.arg("--play-and-exit");
    cmd.arg("--extraintf=http");
    cmd.arg(format!("--http-password={}", password));
    cmd.arg(format!("--http-port={}", port));

    if let Some(pos) = start_position {
        cmd.arg(format!("--start-time={}", pos));
    }

    cmd.arg(&url);

    let mut child = cmd
        .spawn()
        .map_err(|e| format!("Failed to launch VLC: {}", e))?;

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;

    let status_url = format!("http://127.0.0.1:{}/requests/status.json", port);
    let app_clone = app.clone();

    // Spawn background task to monitor VLC (non-blocking)
    tokio::spawn(async move {
        let mut last_position = 0.0;

        loop {
            match child.try_wait() {
                Ok(Some(_)) => {
                    let _ = app_clone.emit("vlc-closed", last_position);
                    break;
                }
                Ok(None) => {
                    if let Ok(resp) = client
                        .get(&status_url)
                        .basic_auth("", Some(password))
                        .send()
                        .await
                    {
                        if let Ok(json) = resp.json::<serde_json::Value>().await {
                            if let Some(time) = json["time"].as_f64() {
                                last_position = time;
                                let _ = app_clone.emit("vlc-position-update", time);
                            }
                        }
                    }
                    tokio::time::sleep(Duration::from_millis(1000)).await;
                }
                Err(e) => {
                    log::error!("VLC monitoring error: {}", e);
                    let _ = app_clone.emit("vlc-closed", last_position);
                    break;
                }
            }
        }
    });

    Ok(())
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
            let main_window = app.get_webview_window("main").expect("main window not found");

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
