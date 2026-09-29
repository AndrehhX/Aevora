use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE: &str = "nexux-launcher";
const ACCOUNT: &str = "steam-credentials";

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct SteamCredentials {
    pub account: String,
    pub api_key: String,
}

pub fn validate_credentials(mut credentials: SteamCredentials) -> Result<SteamCredentials, String> {
    credentials.account = credentials.account.trim().to_string();
    credentials.api_key = credentials.api_key.trim().to_string();
    if credentials.account.is_empty() {
        return Err("Enter a SteamID64 or vanity identifier.".to_string());
    }
    if credentials.api_key.is_empty() {
        return Err("Enter a Steam Web API key.".to_string());
    }
    Ok(credentials)
}

fn credential_entry() -> Result<Entry, String> {
    Entry::new(SERVICE, ACCOUNT)
        .map_err(|error| format!("Could not access Windows Credential Manager: {error}"))
}

pub fn load_credentials() -> Result<SteamCredentials, String> {
    let raw = credential_entry()?
        .get_password()
        .map_err(|error| format!("Could not read local Steam credentials: {error}"))?;
    serde_json::from_str(&raw)
        .map_err(|_| "Local Steam credentials are invalid. Save them again.".to_string())
}

#[tauri::command]
pub fn steam_save_credentials(credentials: SteamCredentials) -> Result<(), String> {
    let credentials = validate_credentials(credentials)?;
    let raw = serde_json::to_string(&credentials)
        .map_err(|_| "Could not prepare local Steam credentials.".to_string())?;
    credential_entry()?.set_password(&raw).map_err(|error| {
        format!("Could not save Steam credentials in Windows Credential Manager: {error}")
    })
}

#[tauri::command]
pub fn steam_has_credentials() -> Result<bool, String> {
    match credential_entry()?.get_password() {
        Ok(_) => Ok(true),
        Err(keyring::Error::NoEntry) => Ok(false),
        Err(error) => Err(format!(
            "Could not inspect local Steam credentials: {error}"
        )),
    }
}

#[tauri::command]
pub fn steam_clear_credentials() -> Result<(), String> {
    match credential_entry()?.delete_credential() {
        Ok(()) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(error) => Err(format!("Could not clear local Steam credentials: {error}")),
    }
}

#[cfg(test)]
mod tests {
    use super::{validate_credentials, SteamCredentials};

    #[test]
    fn rejects_blank_account_or_api_key() {
        assert!(validate_credentials(SteamCredentials {
            account: "".into(),
            api_key: "key".into()
        })
        .is_err());
        assert!(validate_credentials(SteamCredentials {
            account: "steam".into(),
            api_key: " ".into()
        })
        .is_err());
    }

    #[test]
    fn trims_valid_account_and_api_key() {
        let credentials = validate_credentials(SteamCredentials {
            account: "  andreh  ".into(),
            api_key: "  key  ".into(),
        })
        .unwrap();
        assert_eq!(credentials.account, "andreh");
        assert_eq!(credentials.api_key, "key");
    }
}
