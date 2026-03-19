use crate::db::schema::Schema;
use crate::services::sync::{sync_playlist, SyncResult};
use crate::services::xtream::XtreamClient;
use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncPlaylistInput {
    pub url: String,
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePlaylistResult {
    pub playlist: crate::commands::playlists::Playlist,
    pub sync_result: SyncResult,
}

#[tauri::command]
pub async fn create_playlist(
    state: tauri::State<'_, AppState>,
    app: tauri::AppHandle,
    url: String,
    username: String,
    password: String,
) -> Result<CreatePlaylistResult, String> {
    let xtream = XtreamClient::new(&url, &username, &password);

    let profile = xtream.get_profile().await.map_err(|e| {
        format!("Failed to validate credentials: {}", e)
    })?;

    Schema::ensure_anonymous_user(&state.db)
        .await
        .map_err(|e| format!("Failed to ensure anonymous user: {}", e))?;

    let playlist = Schema::insert_playlist(
        &state.db,
        "anonymous",
        &url.trim_end_matches('/'),
        &username,
        &password,
        &profile.user_info.status,
        profile.user_info.exp_date.as_deref().unwrap_or(""),
        profile.user_info.is_trial.as_deref().unwrap_or("no"),
    )
    .await
    .map_err(|e| format!("Failed to save playlist: {}", e))?;

    let sync_result = sync_playlist(
        &state.db,
        &app,
        playlist.id,
        &url,
        &username,
        &password,
    )
    .await?;

    Ok(CreatePlaylistResult {
        playlist,
        sync_result,
    })
}

#[tauri::command]
pub async fn update_playlist(
    state: tauri::State<'_, AppState>,
    app: tauri::AppHandle,
    playlist_id: i32,
) -> Result<SyncResult, String> {
    let playlist = Schema::get_playlist_by_id(&state.db, playlist_id)
        .await
        .map_err(|e| format!("Database error: {}", e))?
        .ok_or("Playlist not found")?;

    sync_playlist(
        &state.db,
        &app,
        playlist_id,
        &playlist.base_url,
        &playlist.username,
        &playlist.password,
    )
    .await
}

#[tauri::command]
pub async fn delete_playlist(
    state: tauri::State<'_, AppState>,
    playlist_id: i32,
) -> Result<bool, String> {
    Schema::delete_playlist_cascade(&state.db, playlist_id)
        .await
        .map_err(|e| format!("Failed to delete playlist: {}", e))?;
    Ok(true)
}
