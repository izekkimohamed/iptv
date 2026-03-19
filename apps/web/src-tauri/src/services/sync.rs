use crate::db::schema::Schema;
use crate::services::xtream::XtreamClient;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tauri::{AppHandle, Emitter};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncResult {
    pub channels: i64,
    pub movies: i64,
    pub series: i64,
    pub categories: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncProgress {
    pub stage: String,
    pub done: bool,
    pub count: Option<i64>,
    pub total: Option<i64>,
}

const BATCH_SIZE: usize = 500;

pub async fn sync_playlist(
    pool: &PgPool,
    app: &AppHandle,
    playlist_id: i32,
    url: &str,
    username: &str,
    password: &str,
) -> Result<SyncResult, String> {
    let client = XtreamClient::new(url, username, password);

    emit_progress(app, "starting", false, None, None).await;

    let mut total_channels: i64 = 0;
    let mut total_movies: i64 = 0;
    let mut total_series: i64 = 0;
    let mut total_categories: i64 = 0;

    // Channels Categories
    emit_progress(app, "channels_categories", false, None, None).await;
    match client.get_live_categories().await {
        Ok(cats) => {
            let cat_tuples: Vec<(i32, String, String, i32)> = cats
                .into_iter()
                .map(|c| {
                    (
                        c.category_id.parse().unwrap_or(0),
                        c.category_name,
                        "channels".to_string(),
                        playlist_id,
                    )
                })
                .collect();
            let n = Schema::upsert_categories(pool, &cat_tuples)
                .await
                .map_err(|e| format!("Database error (categories): {}", e))?;
            total_categories += n as i64;
            emit_progress(app, "channels_categories", true, Some(total_categories), None).await;
        }
        Err(e) => {
            emit_error(app, "channels_categories", &e.to_string()).await;
            return Err(format!("Failed to fetch channel categories: {}", e));
        }
    }

    // Channels
    emit_progress(app, "channels", false, None, None).await;
    match client.get_live_streams().await {
        Ok(streams) => {
            let total = streams.len() as i64;
            emit_progress(app, "channels", false, Some(0), Some(total)).await;

            for chunk in streams.chunks(BATCH_SIZE) {
                let channel_tuples: Vec<(i32, String, String, i32, Option<String>, i32, String)> =
                    chunk
                        .iter()
                        .map(|c| {
                            (
                                c.category_id.parse().unwrap_or(0),
                                c.name.clone(),
                                c.stream_type.clone(),
                                c.stream_id,
                                c.stream_icon.clone(),
                                playlist_id,
                                format!(
                                    "{}/{}/{}/{}/{}",
                                    url.trim_end_matches('/'),
                                    "live",
                                    username,
                                    password,
                                    c.stream_id
                                ),
                            )
                        })
                        .collect();
                let n = Schema::upsert_channels(pool, &channel_tuples)
                    .await
                    .map_err(|e| format!("Database error (channels): {}", e))?;
                total_channels += n as i64;
                emit_progress(
                    app,
                    "channels",
                    false,
                    Some(total_channels),
                    Some(total),
                )
                .await;
            }
            emit_progress(app, "channels", true, Some(total_channels), Some(total)).await;
        }
        Err(e) => {
            emit_error(app, "channels", &e.to_string()).await;
            return Err(format!("Failed to fetch channels: {}", e));
        }
    }

    // Movies Categories
    emit_progress(app, "movies_categories", false, None, None).await;
    match client.get_vod_categories().await {
        Ok(cats) => {
            let cat_tuples: Vec<(i32, String, String, i32)> = cats
                .into_iter()
                .map(|c| {
                    (
                        c.category_id.parse().unwrap_or(0),
                        c.category_name,
                        "movies".to_string(),
                        playlist_id,
                    )
                })
                .collect();
            let n = Schema::upsert_categories(pool, &cat_tuples)
                .await
                .map_err(|e| format!("Database error (movie categories): {}", e))?;
            total_categories += n as i64;
            emit_progress(app, "movies_categories", true, Some(total_categories), None).await;
        }
        Err(e) => {
            emit_error(app, "movies_categories", &e.to_string()).await;
            return Err(format!("Failed to fetch movie categories: {}", e));
        }
    }

    // Movies
    emit_progress(app, "movies", false, None, None).await;
    match client.get_vod_streams().await {
        Ok(streams) => {
            let total = streams.len() as i64;
            emit_progress(app, "movies", false, Some(0), Some(total)).await;

            for chunk in streams.chunks(BATCH_SIZE) {
                let movie_tuples: Vec<(
                    i32,
                    String,
                    String,
                    i32,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    i32,
                    String,
                )> = chunk
                    .iter()
                    .map(|m| {
                        (
                            m.category_id.parse().unwrap_or(0),
                            m.name.clone(),
                            m.stream_type.clone(),
                            m.stream_id,
                            Some(m.stream_icon.clone().unwrap_or_default()),
                            Some(m.rating.clone().unwrap_or_default()),
                            Some(m.added.clone().unwrap_or_default()),
                            Some(m.container_extension.clone().unwrap_or_default()),
                            playlist_id,
                            format!(
                                "{}/{}/{}/{}/{}",
                                url.trim_end_matches('/'),
                                "movie",
                                username,
                                password,
                                m.stream_id
                            ),
                        )
                    })
                    .collect();
                let n = Schema::upsert_movies(pool, &movie_tuples)
                    .await
                    .map_err(|e| format!("Database error (movies): {}", e))?;
                total_movies += n as i64;
                emit_progress(
                    app,
                    "movies",
                    false,
                    Some(total_movies),
                    Some(total),
                )
                .await;
            }
            emit_progress(app, "movies", true, Some(total_movies), Some(total)).await;
        }
        Err(e) => {
            emit_error(app, "movies", &e.to_string()).await;
            return Err(format!("Failed to fetch movies: {}", e));
        }
    }

    // Series Categories
    emit_progress(app, "series_categories", false, None, None).await;
    match client.get_series_categories().await {
        Ok(cats) => {
            let cat_tuples: Vec<(i32, String, String, i32)> = cats
                .into_iter()
                .map(|c| {
                    (
                        c.category_id.parse().unwrap_or(0),
                        c.category_name,
                        "series".to_string(),
                        playlist_id,
                    )
                })
                .collect();
            let n = Schema::upsert_categories(pool, &cat_tuples)
                .await
                .map_err(|e| format!("Database error (series categories): {}", e))?;
            total_categories += n as i64;
            emit_progress(app, "series_categories", true, Some(total_categories), None).await;
        }
        Err(e) => {
            emit_error(app, "series_categories", &e.to_string()).await;
            return Err(format!("Failed to fetch series categories: {}", e));
        }
    }

    // Series
    emit_progress(app, "series", false, None, None).await;
    match client.get_series().await {
        Ok(streams) => {
            let total = streams.len() as i64;
            emit_progress(app, "series", false, Some(0), Some(total)).await;

            for chunk in streams.chunks(BATCH_SIZE) {
                let series_tuples: Vec<(
                    i32,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    Option<String>,
                    i32,
                    i32,
                )> = chunk
                    .iter()
                    .map(|s| {
                        (
                            s.series_id,
                            Some(s.name.clone().unwrap_or_else(|| "Unknown Series".to_string())),
                            Some(s.cover.clone().unwrap_or_default()),
                            s.plot.clone(),
                            s.cast.clone(),
                            s.director.clone(),
                            s.genre.clone(),
                            s.release_date.clone(),
                            Some(s.last_modified.clone()),
                            Some(s.rating.clone().unwrap_or_default()),
                            s.backdrop_path.clone(),
                            s.youtube_trailer.clone(),
                            s.episode_run_time.clone(),
                            s.category_id.parse().unwrap_or(0),
                            playlist_id,
                        )
                    })
                    .collect();
                let n = Schema::upsert_series(pool, &series_tuples)
                    .await
                    .map_err(|e| format!("Database error (series): {}", e))?;
                total_series += n as i64;
                emit_progress(
                    app,
                    "series",
                    false,
                    Some(total_series),
                    Some(total),
                )
                .await;
            }
            emit_progress(app, "series", true, Some(total_series), Some(total)).await;
        }
        Err(e) => {
            emit_error(app, "series", &e.to_string()).await;
            return Err(format!("Failed to fetch series: {}", e));
        }
    }

    emit_progress(app, "completed", true, None, None).await;

    Ok(SyncResult {
        channels: total_channels,
        movies: total_movies,
        series: total_series,
        categories: total_categories,
    })
}

async fn emit_progress(
    app: &AppHandle,
    stage: &str,
    done: bool,
    count: Option<i64>,
    total: Option<i64>,
) {
    let _ = app.emit(
        "sync:progress",
        SyncProgress {
            stage: stage.to_string(),
            done,
            count,
            total,
        },
    );
}

async fn emit_error(app: &AppHandle, stage: &str, error: &str) {
    let _ = app.emit(
        "sync:error",
        serde_json::json!({
            "stage": stage,
            "error": error
        }),
    );
}
