mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::credentials::steam_save_credentials,
            commands::credentials::steam_has_credentials,
            commands::credentials::steam_clear_credentials,
            commands::launch::steam_launch_game,
            commands::launch::steam_open_store,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Aevora");
}
