use super::credentials::load_credentials;
use reqwest::Client;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::time::Duration;

#[cfg(target_os = "windows")]
use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE};
#[cfg(target_os = "windows")]
use winreg::RegKey;

const STEAM_API: &str = "https://api.steampowered.com";
const STEAM_STORE_API: &str = "https://store.steampowered.com/api/appdetails";
const STEAM_REQUEST_TIMEOUT_SECS: u64 = 20;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamOwnedGame {
    pub appid: u32,
    pub name: String,
    #[serde(default)]
    pub playtime_forever: Option<u64>,
    #[serde(default)]
    pub rtime_last_played: Option<i64>,
    #[serde(default)]
    pub img_icon_url: Option<String>,
    #[serde(default)]
    pub img_logo_url: Option<String>,
    #[serde(default)]
    pub installed: bool,
    #[serde(
        rename = "installPath",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub install_path: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamReleaseDate {
    #[serde(default)]
    pub coming_soon: Option<bool>,
    #[serde(default)]
    pub date: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamGenre {
    #[serde(default)]
    pub id: Option<String>,
    #[serde(default)]
    pub description: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamAppDetails {
    #[serde(alias = "steam_appid")]
    pub appid: u32,
    pub name: String,
    #[serde(rename = "type", default)]
    pub type_: Option<String>,
    #[serde(default)]
    pub is_free: Option<bool>,
    #[serde(default)]
    pub short_description: Option<String>,
    #[serde(default)]
    pub header_image: Option<String>,
    #[serde(default)]
    pub background: Option<String>,
    #[serde(default)]
    pub background_raw: Option<String>,
    #[serde(default)]
    pub capsule_image: Option<String>,
    #[serde(default)]
    pub logo: Option<String>,
    #[serde(default)]
    pub developers: Vec<String>,
    #[serde(default)]
    pub publishers: Vec<String>,
    #[serde(default)]
    pub release_date: Option<SteamReleaseDate>,
    #[serde(default)]
    pub genres: Vec<SteamGenre>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamNewsItem {
    pub gid: String,
    pub title: String,
    pub url: String,
    #[serde(default)]
    pub date: i64,
    #[serde(default)]
    pub contents: String,
    #[serde(default)]
    pub feedlabel: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamAppNews {
    #[serde(default)]
    pub newsitems: Vec<SteamNewsItem>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamNewsResponse {
    pub appnews: SteamAppNews,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamConnectionResponse {
    pub status: &'static str,
    #[serde(rename = "steamId")]
    pub steam_id: String,
    #[serde(rename = "displayName", skip_serializing_if = "Option::is_none")]
    pub display_name: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OwnedEnvelope {
    response: OwnedResponse,
}

#[derive(Debug, Deserialize)]
struct OwnedResponse {
    games: Option<Vec<SteamOwnedGame>>,
}

#[derive(Debug, Deserialize)]
struct AppDetailsEnvelope {
    success: bool,
    data: Option<SteamAppDetails>,
}

#[derive(Debug, Deserialize)]
struct VanityEnvelope {
    response: VanityResponse,
}

#[derive(Debug, Deserialize)]
struct VanityResponse {
    success: u8,
    steamid: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SummaryEnvelope {
    response: SummaryResponse,
}

#[derive(Debug, Deserialize)]
struct SummaryResponse {
    players: Vec<SteamPlayerSummary>,
}

#[derive(Debug, Deserialize)]
struct SteamPlayerSummary {
    steamid: String,
    personaname: Option<String>,
}

fn new_client() -> Result<Client, String> {
    Client::builder()
        .user_agent("Aevora/0.1.0")
        .connect_timeout(Duration::from_secs(8))
        .timeout(Duration::from_secs(STEAM_REQUEST_TIMEOUT_SECS))
        .build()
        .map_err(|_| "Could not prepare the Steam connection.".to_string())
}

pub fn normalize_steam_account(account: &str) -> String {
    let trimmed = account.trim().trim_end_matches('/');
    let without_scheme = trimmed
        .strip_prefix("https://")
        .or_else(|| trimmed.strip_prefix("http://"))
        .unwrap_or(trimmed);
    let without_host = without_scheme
        .strip_prefix("steamcommunity.com/")
        .unwrap_or(without_scheme);
    let path = without_host
        .strip_prefix("id/")
        .or_else(|| without_host.strip_prefix("profiles/"))
        .unwrap_or(without_host);
    path.split(['/', '?', '#'])
        .next()
        .unwrap_or(path)
        .to_string()
}

async fn get_json<T: DeserializeOwned>(
    client: &Client,
    url: &str,
    params: Vec<(&str, String)>,
) -> Result<T, String> {
    let response = client
        .get(url)
        .query(&params)
        .send()
        .await
        .map_err(|_| "Steam could not be reached. Check your connection.".to_string())?;
    if !response.status().is_success() {
        return Err("Steam returned an error for this request.".to_string());
    }
    response
        .json::<T>()
        .await
        .map_err(|_| "Steam returned an invalid response.".to_string())
}

async fn resolve_steam_id(client: &Client, account: &str, api_key: &str) -> Result<String, String> {
    let account = normalize_steam_account(account);
    if account.chars().all(|character| character.is_ascii_digit()) && account.len() >= 10 {
        return Ok(account);
    }
    let payload: VanityEnvelope = get_json(
        client,
        &format!("{STEAM_API}/ISteamUser/ResolveVanityURL/v0001/"),
        vec![
            ("key", api_key.to_string()),
            ("vanityurl", account),
            ("format", "json".to_string()),
        ],
    )
    .await?;
    if payload.response.success == 1 {
        if let Some(steam_id) = payload.response.steamid {
            return Ok(steam_id);
        }
    }
    Err("Steam could not resolve that account. Use a SteamID64 or vanity URL.".to_string())
}

pub fn parse_owned_games(payload: &str) -> Result<Vec<SteamOwnedGame>, String> {
    let envelope: OwnedEnvelope = serde_json::from_str(payload)
        .map_err(|_| "Steam returned invalid library data.".to_string())?;
    let games = envelope.response.games.ok_or_else(|| {
        "Steam did not expose this profile's library. Check that game details are public."
            .to_string()
    })?;
    Ok(games
        .into_iter()
        .filter(|game| game.appid > 0 && !game.name.trim().is_empty())
        .collect())
}

fn parse_vdf_values(line: &str) -> Vec<String> {
    let mut values = Vec::new();
    let mut current = String::new();
    let mut quoted = false;
    let mut escaped = false;

    for character in line.chars() {
        if escaped {
            current.push(character);
            escaped = false;
            continue;
        }
        if quoted && character == '\\' {
            current.push(character);
            escaped = true;
            continue;
        }
        if character == '"' {
            if quoted {
                values.push(current.clone());
                current.clear();
            }
            quoted = !quoted;
        } else if quoted {
            current.push(character);
        }
    }

    values
}

fn unescape_vdf_path(value: &str) -> String {
    value.replace("\\\\", "\\")
}

pub fn parse_library_folder_paths(payload: &str) -> Vec<String> {
    payload
        .lines()
        .filter_map(|line| {
            let values = parse_vdf_values(line);
            (values.first().map(String::as_str) == Some("path"))
                .then(|| values.get(1).map(|value| unescape_vdf_path(value)))
                .flatten()
        })
        .collect()
}

pub fn parse_manifest_install_dir(payload: &str) -> Option<String> {
    payload.lines().find_map(|line| {
        let values = parse_vdf_values(line);
        (values.first().map(String::as_str) == Some("installdir"))
            .then(|| values.get(1).cloned())
            .flatten()
    })
}

pub fn parse_manifest_name(payload: &str) -> Option<String> {
    payload.lines().find_map(|line| {
        let values = parse_vdf_values(line);
        (values.first().map(String::as_str) == Some("name"))
            .then(|| values.get(1).cloned())
            .flatten()
    })
}

fn parse_manifest_state_flags(payload: &str) -> Option<u32> {
    payload.lines().find_map(|line| {
        let values = parse_vdf_values(line);
        (values.first().map(String::as_str) == Some("StateFlags"))
            .then(|| values.get(1).and_then(|value| value.parse::<u32>().ok()))
            .flatten()
    })
}

fn push_unique_path(paths: &mut Vec<PathBuf>, path: PathBuf) {
    if path.as_os_str().is_empty() {
        return;
    }
    let normalized = path.to_string_lossy().replace('/', "\\");
    if !paths.iter().any(|existing| {
        existing
            .to_string_lossy()
            .replace('/', "\\")
            .eq_ignore_ascii_case(&normalized)
    }) {
        paths.push(path);
    }
}

#[cfg(target_os = "windows")]
fn registry_steam_roots() -> Vec<PathBuf> {
    let locations = [
        (HKEY_CURRENT_USER, "Software\\Valve\\Steam"),
        (HKEY_CURRENT_USER, "Software\\WOW6432Node\\Valve\\Steam"),
        (HKEY_LOCAL_MACHINE, "SOFTWARE\\WOW6432Node\\Valve\\Steam"),
        (HKEY_LOCAL_MACHINE, "SOFTWARE\\Valve\\Steam"),
    ];
    let mut roots = Vec::new();
    for (hive, key_path) in locations {
        let hive = RegKey::predef(hive);
        if let Ok(key) = hive.open_subkey(key_path) {
            for name in ["SteamPath", "InstallPath"] {
                if let Ok(value) = key.get_value::<String, _>(name) {
                    push_unique_path(&mut roots, PathBuf::from(value.replace('/', "\\")));
                }
            }
        }
    }
    roots
}

#[cfg(not(target_os = "windows"))]
fn registry_steam_roots() -> Vec<PathBuf> {
    Vec::new()
}

fn steam_library_roots() -> Vec<PathBuf> {
    let mut roots = registry_steam_roots();
    for path in [
        PathBuf::from(r"C:\Program Files (x86)\Steam"),
        PathBuf::from(r"C:\Program Files\Steam"),
    ] {
        push_unique_path(&mut roots, path);
    }

    let mut all_roots = Vec::new();
    for root in roots {
        push_unique_path(&mut all_roots, root.clone());
        let library_file = root.join("steamapps").join("libraryfolders.vdf");
        if let Ok(payload) = fs::read_to_string(library_file) {
            for path in parse_library_folder_paths(&payload) {
                push_unique_path(&mut all_roots, PathBuf::from(path));
            }
        }
    }
    all_roots
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct LocalSteamGame {
    name: String,
    install_path: String,
}

fn installed_games_from_roots(roots: &[PathBuf]) -> HashMap<u32, LocalSteamGame> {
    let mut installed = HashMap::new();
    for root in roots {
        let steamapps = root.join("steamapps");
        let Ok(entries) = fs::read_dir(&steamapps) else {
            continue;
        };
        for entry in entries.flatten() {
            let path = entry.path();
            let Some(file_name) = path.file_name().and_then(|name| name.to_str()) else {
                continue;
            };
            let Some(app_id) = file_name
                .strip_prefix("appmanifest_")
                .and_then(|name| name.strip_suffix(".acf"))
                .and_then(|id| id.parse::<u32>().ok())
            else {
                continue;
            };
            let Ok(payload) = fs::read_to_string(&path) else {
                continue;
            };
            if parse_manifest_state_flags(&payload).is_some_and(|flags| flags & 4 == 0) {
                continue;
            }
            let install_path = parse_manifest_install_dir(&payload)
                .map(|directory| {
                    steamapps
                        .join("common")
                        .join(directory)
                        .to_string_lossy()
                        .to_string()
                })
                .unwrap_or_else(|| steamapps.to_string_lossy().to_string());
            installed.insert(
                app_id,
                LocalSteamGame {
                    name: parse_manifest_name(&payload)
                        .unwrap_or_else(|| format!("Steam App {app_id}")),
                    install_path,
                },
            );
        }
    }
    installed
}

fn annotate_installed_games(
    games: &mut [SteamOwnedGame],
    installed: &HashMap<u32, LocalSteamGame>,
) {
    for game in games {
        if let Some(local) = installed.get(&game.appid) {
            game.installed = true;
            game.install_path = Some(local.install_path.clone());
        }
    }
}

fn merge_local_games(games: &mut Vec<SteamOwnedGame>, installed: &HashMap<u32, LocalSteamGame>) {
    let known = games
        .iter()
        .map(|game| game.appid)
        .collect::<std::collections::HashSet<_>>();
    for (appid, local) in installed {
        if known.contains(appid) {
            continue;
        }
        games.push(SteamOwnedGame {
            appid: *appid,
            name: local.name.clone(),
            playtime_forever: None,
            rtime_last_played: None,
            img_icon_url: None,
            img_logo_url: None,
            installed: true,
            install_path: Some(local.install_path.clone()),
        });
    }
}

pub fn parse_app_details(payload: &str, app_id: u32) -> Result<SteamAppDetails, String> {
    let root: HashMap<String, AppDetailsEnvelope> = serde_json::from_str(payload)
        .map_err(|_| "Steam returned invalid game details.".to_string())?;
    let item = root
        .get(&app_id.to_string())
        .ok_or_else(|| "Steam did not return details for this game.".to_string())?;
    if !item.success {
        return Err("Steam could not find details for this game.".to_string());
    }
    item.data
        .clone()
        .ok_or_else(|| "Steam returned empty game details.".to_string())
}

pub fn parse_news(payload: &str) -> Result<SteamNewsResponse, String> {
    serde_json::from_str(payload).map_err(|_| "Steam returned invalid news data.".to_string())
}

#[tauri::command]
pub async fn steam_connect() -> Result<SteamConnectionResponse, String> {
    let credentials = load_credentials()?;
    let client = new_client()?;
    let steam_id = resolve_steam_id(&client, &credentials.account, &credentials.api_key).await?;
    let summary: SummaryEnvelope = get_json(
        &client,
        &format!("{STEAM_API}/ISteamUser/GetPlayerSummaries/v0002/"),
        vec![
            ("key", credentials.api_key),
            ("steamids", steam_id.clone()),
            ("format", "json".to_string()),
        ],
    )
    .await?;
    let player = summary
        .response
        .players
        .into_iter()
        .find(|player| player.steamid == steam_id)
        .ok_or_else(|| "Steam did not return that account. Check the identifier.".to_string())?;
    Ok(SteamConnectionResponse {
        status: "connected",
        steam_id,
        display_name: player.personaname,
    })
}

#[tauri::command]
pub async fn steam_get_owned_games() -> Result<Vec<SteamOwnedGame>, String> {
    let credentials = load_credentials()?;
    let client = new_client()?;
    let steam_id = resolve_steam_id(&client, &credentials.account, &credentials.api_key).await?;
    let payload: String = client
        .get(format!("{STEAM_API}/IPlayerService/GetOwnedGames/v0001/"))
        .query(&[
            ("key", credentials.api_key.as_str()),
            ("steamid", steam_id.as_str()),
            ("include_appinfo", "1"),
            ("include_played_free_games", "1"),
            ("format", "json"),
        ])
        .send()
        .await
        .map_err(|_| "Steam could not be reached. Check your connection.".to_string())?
        .text()
        .await
        .map_err(|_| "Steam returned an invalid library response.".to_string())?;
    let mut games = parse_owned_games(&payload)?;
    let installed = installed_games_from_roots(&steam_library_roots());
    annotate_installed_games(&mut games, &installed);
    merge_local_games(&mut games, &installed);
    Ok(games)
}

#[tauri::command]
pub async fn steam_get_app_details(app_id: u32) -> Result<SteamAppDetails, String> {
    if app_id == 0 {
        return Err("Steam AppID must be a positive number.".to_string());
    }
    let client = new_client()?;
    let payload: String = client
        .get(STEAM_STORE_API)
        .query(&[("appids", app_id.to_string()), ("l", "english".to_string())])
        .send()
        .await
        .map_err(|_| "Steam game details are unavailable right now.".to_string())?
        .text()
        .await
        .map_err(|_| "Steam returned an invalid game-details response.".to_string())?;
    parse_app_details(&payload, app_id)
}

#[tauri::command]
pub async fn steam_get_news(app_id: u32) -> Result<SteamNewsResponse, String> {
    if app_id == 0 {
        return Err("Steam AppID must be a positive number.".to_string());
    }
    let client = new_client()?;
    get_json(
        &client,
        &format!("{STEAM_API}/ISteamNews/GetNewsForApp/v0002/"),
        vec![
            ("appid", app_id.to_string()),
            ("count", "10".to_string()),
            ("maxlength", "1000".to_string()),
            ("format", "json".to_string()),
        ],
    )
    .await
    .and_then(|payload: SteamNewsResponse| {
        parse_news(&serde_json::to_string(&payload).unwrap_or_default())
    })
}

#[tauri::command]
pub fn steam_disconnect() {}

#[cfg(test)]
mod tests {
    use super::{
        merge_local_games, normalize_steam_account, parse_app_details, parse_library_folder_paths,
        parse_manifest_install_dir, parse_manifest_name, parse_news, parse_owned_games,
        LocalSteamGame, SteamOwnedGame,
    };
    use std::collections::HashMap;

    #[test]
    fn normalizes_steam_profile_urls_before_vanity_resolution() {
        assert_eq!(
            normalize_steam_account("https://steamcommunity.com/id/andreh/"),
            "andreh"
        );
        assert_eq!(
            normalize_steam_account("steamcommunity.com/profiles/76561198000000000"),
            "76561198000000000"
        );
    }

    #[test]
    fn parses_owned_games_and_rejects_a_private_profile_response() {
        let payload = r#"{"response":{"game_count":1,"games":[{"appid":570,"name":"Dota 2","playtime_forever":120}]}}"#;
        let games = parse_owned_games(payload).unwrap();
        assert_eq!(games[0].appid, 570);
        assert_eq!(games[0].name, "Dota 2");

        let private = r#"{"response":{"game_count":0}}"#;
        assert!(parse_owned_games(private).is_err());
    }

    #[test]
    fn parses_store_details_and_real_artwork_urls() {
        let payload = r#"{"570":{"success":true,"data":{"steam_appid":570,"name":"Dota 2","header_image":"https://cdn/header.jpg","background_raw":"https://cdn/background.jpg","logo":"https://cdn/logo.png"}}}"#;
        let details = parse_app_details(payload, 570).unwrap();
        assert_eq!(details.appid, 570);
        assert_eq!(
            details.header_image.as_deref(),
            Some("https://cdn/header.jpg")
        );
        assert_eq!(details.logo.as_deref(), Some("https://cdn/logo.png"));
    }

    #[test]
    fn preserves_news_source_url_and_date() {
        let payload = r#"{"appnews":{"newsitems":[{"gid":"1","title":"Update","url":"https://steam.test/update","date":1700000000,"contents":"Notes"}]}}"#;
        let news = parse_news(payload).unwrap();
        assert_eq!(news.appnews.newsitems[0].url, "https://steam.test/update");
        assert_eq!(news.appnews.newsitems[0].date, 1700000000);
    }

    #[test]
    fn parses_all_steam_library_paths_from_libraryfolders_vdf() {
        let payload = r#"
            "libraryfolders"
            {
                "0"
                {
                    "path" "C:\\Program Files (x86)\\Steam"
                }
                "1"
                {
                    "path" "D:\\SteamLibrary"
                }
            }
        "#;

        assert_eq!(
            parse_library_folder_paths(payload),
            vec![
                r#"C:\Program Files (x86)\Steam"#.to_string(),
                r#"D:\SteamLibrary"#.to_string(),
            ]
        );
    }

    #[test]
    fn reads_install_directory_from_a_steam_manifest() {
        let payload = r#"
            "AppState"
            {
                "appid" "550"
                "name" "Left 4 Dead 2"
                "installdir" "Left 4 Dead 2"
            }
        "#;

        assert_eq!(
            parse_manifest_install_dir(payload).as_deref(),
            Some("Left 4 Dead 2")
        );
        assert_eq!(
            parse_manifest_name(payload).as_deref(),
            Some("Left 4 Dead 2")
        );
    }

    #[test]
    fn merges_locally_installed_games_missing_from_the_api_response() {
        let mut games = vec![SteamOwnedGame {
            appid: 550,
            name: "Left 4 Dead 2".to_string(),
            playtime_forever: None,
            rtime_last_played: None,
            img_icon_url: None,
            img_logo_url: None,
            installed: false,
            install_path: None,
        }];
        let mut installed = HashMap::new();
        installed.insert(
            322170,
            LocalSteamGame {
                name: "Geometry Dash".to_string(),
                install_path: r#"C:\Steam\steamapps\common\Geometry Dash"#.to_string(),
            },
        );

        merge_local_games(&mut games, &installed);

        assert_eq!(games.len(), 2);
        assert_eq!(games[1].appid, 322170);
        assert!(games[1].installed);
        assert_eq!(
            games[1].install_path.as_deref(),
            Some(r#"C:\Steam\steamapps\common\Geometry Dash"#)
        );
    }
}
