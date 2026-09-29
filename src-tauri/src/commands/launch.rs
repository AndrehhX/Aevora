use serde::Serialize;
use std::process::Command;

#[derive(Debug, Serialize)]
pub struct LaunchResult {
    pub status: &'static str,
    pub message: String,
}

fn valid_app_id(app_id: &str) -> bool {
    !app_id.is_empty() && app_id.chars().all(|character| character.is_ascii_digit())
}

fn open_steam_uri(uri: &str) -> LaunchResult {
    let result = Command::new("cmd").args(["/C", "start", "", uri]).status();

    match result {
        Ok(status) if status.success() => LaunchResult {
            status: "started",
            message: "Steam opened the requested action.".to_string(),
        },
        Ok(_) => LaunchResult {
            status: "failed",
            message: "Windows could not open Steam. Check that the Steam client is installed."
                .to_string(),
        },
        Err(error) => LaunchResult {
            status: "failed",
            message: format!("Could not open Steam: {error}"),
        },
    }
}

#[tauri::command]
pub fn steam_launch_game(app_id: String) -> LaunchResult {
    if !valid_app_id(&app_id) {
        return LaunchResult {
            status: "unsupported",
            message: "The game does not have a valid Steam AppID.".to_string(),
        };
    }
    open_steam_uri(&format!("steam://rungameid/{app_id}"))
}

#[tauri::command]
pub fn steam_open_store(app_id: String) -> LaunchResult {
    if !valid_app_id(&app_id) {
        return LaunchResult {
            status: "unsupported",
            message: "The game does not have a valid Steam AppID.".to_string(),
        };
    }
    open_steam_uri(&format!("steam://store/{app_id}"))
}
