use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

pub const MAX_ACCOUNTS: usize = 500;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "PascalCase")]
pub struct SavedAccount {
    pub steam_id: String,
    pub account_name: String,
    pub persona_name: String,
    pub avatar_url: String,
    pub token: String,
    pub added_at: i64,
    pub warranty_expires_at: i64,
    pub exp_seconds: i64,
    #[serde(default)]
    pub last_checked_at: i64,
    pub is_alive: bool,
    pub status_message: String,
    pub vac_banned: String,
}

pub fn app_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Library/Application Support/SharpBuy_Launcher")
}

pub fn accounts_path() -> PathBuf {
    app_dir().join("accounts.json")
}

fn ensure_dir() -> std::io::Result<()> {
    fs::create_dir_all(app_dir())
}

pub fn load_accounts() -> Vec<SavedAccount> {
    ensure_dir().ok();
    let path = accounts_path();
    if !path.exists() {
        return vec![];
    }
    fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_accounts(accounts: &[SavedAccount]) -> Result<(), String> {
    ensure_dir().map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(accounts).map_err(|e| e.to_string())?;
    fs::write(accounts_path(), json).map_err(|e| e.to_string())
}

pub fn get_saved_accounts_json() -> String {
    serde_json::to_string(&load_accounts()).unwrap_or_else(|_| "[]".to_string())
}

pub fn upsert_account(entry: SavedAccount) -> Result<(), String> {
    let mut accounts = load_accounts();
    if let Some(idx) = accounts.iter().position(|a| a.steam_id == entry.steam_id) {
        accounts[idx] = entry;
    } else {
        if accounts.len() >= MAX_ACCOUNTS {
            accounts.remove(0);
        }
        accounts.push(entry);
    }
    save_accounts(&accounts)
}

pub fn delete_account(steam_id: &str) -> Result<(), String> {
    let accounts: Vec<_> = load_accounts()
        .into_iter()
        .filter(|a| a.steam_id != steam_id)
        .collect();
    save_accounts(&accounts)
}

pub fn clear_all() -> Result<(), String> {
    save_accounts(&[])
}

pub fn account_from_json_value(v: &Value) -> Option<SavedAccount> {
    serde_json::from_value(v.clone()).ok()
}
