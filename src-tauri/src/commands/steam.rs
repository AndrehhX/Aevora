use super::credentials::load_credentials;
use reqwest::Client;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;

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
        .user_agent("Nexux/0.1.0")
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
    path.split(['/', '?', '#']).next().unwrap_or(path).to_string()
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
    parse_owned_games(&payload)
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
    use super::{normalize_steam_account, parse_app_details, parse_news, parse_owned_games};

    #[test]
    fn normalizes_steam_profile_urls_before_vanity_resolution() {
        assert_eq!(normalize_steam_account("https://steamcommunity.com/id/andreh/"), "andreh");
        assert_eq!(normalize_steam_account("steamcommunity.com/profiles/76561198000000000"), "76561198000000000");
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
}
