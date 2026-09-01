use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, BlockEncryptMut, KeyInit, KeyIvInit};
use aes::Aes256;
use base64::Engine;
use once_cell::sync::Lazy;
use rand::RngCore;
use regex::Regex;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

type Aes256EcbEnc = ecb::Encryptor<Aes256>;
type Aes256EcbDec = ecb::Decryptor<Aes256>;
type Aes256CbcEnc = cbc::Encryptor<Aes256>;
type Aes256CbcDec = cbc::Decryptor<Aes256>;

const DEFAULT_STEAM_APP: &str = "/Applications/Steam.app";

static STEAM_PATH: Lazy<Mutex<String>> = Lazy::new(|| Mutex::new(detect_steam_path()));

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParsedToken {
    pub valid: bool,
    pub seconds_remaining: i64,
    pub steam_id: String,
    pub account_name: String,
    pub eya: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LaunchResult {
    pub success: bool,
    pub message: String,
    pub steam_id: String,
    pub account_name: String,
}

pub fn steam_data_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Library/Application Support/Steam")
}

fn detect_steam_path() -> String {
    let global_app = Path::new(DEFAULT_STEAM_APP);
    if global_app.exists() {
        return DEFAULT_STEAM_APP.to_string();
    }
    
    let user_app = dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("Applications/Steam.app");
        
    if user_app.exists() {
        return user_app.to_string_lossy().to_string();
    }

    DEFAULT_STEAM_APP.to_string()
}

pub fn get_steam_path() -> String {
    STEAM_PATH.lock().unwrap().clone()
}

pub fn set_steam_path(p: String) {
    *STEAM_PATH.lock().unwrap() = p;
}

fn local_vdf_path() -> PathBuf {
    steam_data_dir().join("local.vdf")
}

fn config_dir() -> PathBuf {
    steam_data_dir().join("config")
}

pub fn kill_steam_processes() {
    let _ = Command::new("killall").arg("Steam").output();
    let _ = Command::new("killall").arg("steam_osx").output();
}

fn launch_steam_app() -> Result<(), String> {
    Command::new("open")
        .args(["-a", "Steam"])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn from_base64_url(b64: &str) -> Result<String, String> {
    let mut s = b64.replace('-', "+").replace('_', "/");
    while s.len() % 4 != 0 {
        s.push('=');
    }
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(s)
        .map_err(|e| e.to_string())?;
    String::from_utf8(bytes).map_err(|e| e.to_string())
}

pub fn parse_token(raw_token: &str) -> ParsedToken {
    let invalid = ParsedToken {
        valid: false,
        seconds_remaining: 0,
        steam_id: String::new(),
        account_name: String::new(),
        eya: String::new(),
    };

    let trimmed = raw_token.trim().replace([' ', '\t', '\n', '\r'], "");
    if trimmed.is_empty() {
        return invalid;
    }

    let parts: Vec<&str> = trimmed.split("----").collect();
    let mut eya = String::new();
    let mut account_name = String::new();

    for part in &parts {
        if part.contains("eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.") || part.starts_with("ey") {
            eya = (*part).to_string();
            if parts.len() > 1 && *part != parts[0] {
                account_name = parts[0].to_lowercase();
            }
            break;
        }
    }

    if eya.is_empty() {
        return invalid;
    }

    let mut steam_id = String::new();
    let mut exp_seconds = 0i64;
    let jwt_parts: Vec<&str> = eya.split('.').collect();
    if jwt_parts.len() >= 2 {
        if let Ok(payload) = from_base64_url(jwt_parts[1]) {
            if let Ok(v) = serde_json::from_str::<serde_json::Value>(&payload) {
                steam_id = v.get("sub").and_then(|x| x.as_str()).unwrap_or("").to_string();
                exp_seconds = v.get("exp").and_then(|x| x.as_i64()).unwrap_or(0);
            }
        }
    }

    if account_name.is_empty() || account_name.len() > 50 {
        account_name = if steam_id.is_empty() {
            "account".to_string()
        } else {
            steam_id.clone()
        };
    }
    if account_name.contains('@') {
        account_name = account_name.split('@').next().unwrap_or("account").to_string();
    }

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    let remaining = if exp_seconds > 0 {
        exp_seconds - now
    } else {
        0
    };

    ParsedToken {
        valid: true,
        seconds_remaining: remaining,
        steam_id,
        account_name,
        eya,
    }
}

fn calculate_crc32(bytes: &[u8]) -> u32 {
    let mut table = [0u32; 256];
    for i in 0..256u32 {
        let mut temp = i;
        for _ in 0..8 {
            temp = if temp & 1 == 1 {
                (temp >> 1) ^ 0xedb8_8320
            } else {
                temp >> 1
            };
        }
        table[i as usize] = temp;
    }

    let mut crc = 0xffff_ffffu32;
    for b in bytes {
        let idx = ((crc & 0xff) ^ u32::from(*b)) as usize;
        crc = (crc >> 8) ^ table[idx];
    }
    !crc
}

fn compute_crc32(input: &str) -> String {
    let crc = calculate_crc32(input.as_bytes());
    let hex = format!("{:x}", crc);
    hex.trim_start_matches('0').to_string()
}

fn ensure_parent(path: &Path, content: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(path, content).map_err(|e| e.to_string())
}

fn update_config_vdf(file_path: &Path, account_name: &str, steam_id: &str) -> Result<(), String> {
    let mut content = fs::read_to_string(file_path).unwrap_or_default();

    if content.trim().is_empty() {
        content = format!(
            r#""InstallConfigStore"
{{
\t"Software"
\t{{
\t\t"Valve"
\t\t{{
\t\t\t"Steam"
\t\t\t{{
\t\t\t\t"Accounts"
\t\t\t\t{{
\t\t\t\t\t"{account_name}"
\t\t\t\t\t{{
\t\t\t\t\t\t"SteamID"\t\t"{steam_id}"
\t\t\t\t\t}}
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
}}"#
        );
    } else if !content.contains(&format!("\"{account_name}\"")) {
        if let Some(acc_idx) = content.find("\"Accounts\"") {
            if let Some(open_brace) = content[acc_idx..].find('{').map(|i| acc_idx + i) {
                let block = format!(
                    "\n\t\t\t\t\t\"{account_name}\"\n\t\t\t\t\t{{\n\t\t\t\t\t\t\"SteamID\"\t\t\"{steam_id}\"\n\t\t\t\t\t}}"
                );
                content.insert_str(open_brace + 1, &block);
            }
        }
    }

    ensure_parent(file_path, &content)
}

fn update_login_users_vdf(
    file_path: &Path,
    steam_id: &str,
    account_name: &str,
    timestamp: i64,
) -> Result<(), String> {
    let mut content = fs::read_to_string(file_path).unwrap_or_default();

    if !content.is_empty() {
        let re = Regex::new(r#""MostRecent"\s+"1""#).unwrap();
        content = re.replace_all(&content, "\"MostRecent\"\t\t\"0\"").to_string();
    }

    if content.trim().is_empty() || !content.contains("\"users\"") {
        content = format!(
            r#""users"
{{
\t"{steam_id}"
\t{{
\t\t"AccountName"\t\t"{account_name}"
\t\t"PersonaName"\t\t"{account_name}"
\t\t"RememberPassword"\t\t"1"
\t\t"WantsOfflineMode"\t\t"0"
\t\t"SkipOfflineModeWarning"\t\t"0"
\t\t"AllowAutoLogin"\t\t"1"
\t\t"MostRecent"\t\t"1"
\t\t"Timestamp"\t\t"{timestamp}"
\t}}
}}"#
        );
    } else if !content.contains(&format!("\"{steam_id}\"")) {
        if let Some(users_idx) = content.find("\"users\"") {
            if let Some(open_brace) = content[users_idx..].find('{').map(|i| users_idx + i) {
                let block = format!(
                    "\n\t\"{steam_id}\"\n\t{{\n\t\t\"AccountName\"\t\t\"{account_name}\"\n\t\t\"PersonaName\"\t\t\"{account_name}\"\n\t\t\"RememberPassword\"\t\t\"1\"\n\t\t\"WantsOfflineMode\"\t\t\"0\"\n\t\t\"SkipOfflineModeWarning\"\t\t\"0\"\n\t\t\"AllowAutoLogin\"\t\t\"1\"\n\t\t\"MostRecent\"\t\t\"1\"\n\t\t\"Timestamp\"\t\t\"{timestamp}\"\n\t}}"
                );
                content.insert_str(open_brace + 1, &block);
            }
        }
    } else {
        let pattern = format!(r#"("{steam_id}"\s*\{{[\s\S]*?"MostRecent"\s+")(\d+)(")"#);
        if let Ok(re) = Regex::new(&pattern) {
            content = re.replace_all(&content, "${1}1$3").to_string();
        }
    }

    ensure_parent(file_path, &content)
}

fn update_local_vdf(file_path: &Path, crc32_key: &str, encrypted_jwt_hex: &str) -> Result<(), String> {
    let mut content = fs::read_to_string(file_path).unwrap_or_default();

    if content.trim().is_empty() || !content.contains("\"ConnectCache\"") {
        content = format!(
            r#""MachineUserConfigStore"
{{
\t"Software"
\t{{
\t\t"Valve"
\t\t{{
\t\t\t"Steam"
\t\t\t{{
\t\t\t\t"ConnectCache"
\t\t\t\t{{
\t\t\t\t\t"{crc32_key}"\t\t"{encrypted_jwt_hex}"
\t\t\t\t}}
\t\t\t}}
\t\t}}
\t}}
}}"#
        );
    } else if let Some(cache_idx) = content.find("\"ConnectCache\"") {
        if let Some(open_brace) = content[cache_idx..].find('{').map(|i| cache_idx + i) {
            if content.contains(&format!("\"{crc32_key}\"")) {
                let pattern = format!(r#"("{crc32_key}"\s+")[^"]+(")"#);
                if let Ok(re) = Regex::new(&pattern) {
                    content = re
                        .replace_all(&content, format!("$1{encrypted_jwt_hex}$2"))
                        .to_string();
                }
            } else {
                let entry = format!("\n\t\t\t\t\t\"{crc32_key}\"\t\t\"{encrypted_jwt_hex}\"");
                content.insert_str(open_brace + 1, &entry);
            }
        }
    }

    ensure_parent(file_path, &content)
}

fn steam_encrypt_mac(jwt: &str, account_name: &str) -> Result<String, String> {
    let key = Sha256::digest(account_name.as_bytes());
    let mut iv = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut iv);

    let mut encrypted_iv = iv;
    let mut ecb = Aes256EcbEnc::new(&key.into());
    ecb.encrypt_block_mut((&mut encrypted_iv).into());

    let cbc = Aes256CbcEnc::new(&key.into(), &iv.into());
    let encrypted_data = cbc.encrypt_padded_vec_mut::<Pkcs7>(jwt.as_bytes());

    let mut blob = encrypted_iv.to_vec();
    blob.extend_from_slice(&encrypted_data);
    Ok(hex::encode(blob))
}

pub fn inject_token_and_launch(raw_token: &str) -> LaunchResult {
    let parsed = parse_token(raw_token);
    let fail = |message: &str| LaunchResult {
        success: false,
        message: message.to_string(),
        steam_id: parsed.steam_id.clone(),
        account_name: parsed.account_name.clone(),
    };

    if !parsed.valid {
        return fail("Invalid token format.");
    }
    if parsed.seconds_remaining <= 0 {
        return fail("This token has expired.");
    }

    let days = parsed.seconds_remaining / 86400;
    let hours = (parsed.seconds_remaining % 86400) / 3600;
    let mins = (parsed.seconds_remaining % 3600) / 60;

    kill_steam_processes();
    thread::sleep(Duration::from_millis(500));

    let encrypted_jwt_hex = match steam_encrypt_mac(&parsed.eya, &parsed.account_name) {
        Ok(v) => v,
        Err(e) => return fail(&format!("Encryption failed: {e}")),
    };

    let cfg = config_dir();
    if let Err(e) = update_config_vdf(&cfg.join("config.vdf"), &parsed.account_name, &parsed.steam_id) {
        return fail(&format!("Failed to update config.vdf: {e}"));
    }

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0);
    if let Err(e) = update_login_users_vdf(
        &cfg.join("loginusers.vdf"),
        &parsed.steam_id,
        &parsed.account_name,
        now,
    ) {
        return fail(&format!("Failed to update loginusers.vdf: {e}"));
    }

    let crc32_key = format!("{}1", compute_crc32(&parsed.account_name));
    if let Err(e) = update_local_vdf(&local_vdf_path(), &crc32_key, &encrypted_jwt_hex) {
        return fail(&format!("Failed to update local.vdf: {e}"));
    }

    let steam_path = get_steam_path();
    if !Path::new(&steam_path).exists() {
        return fail(&format!("Steam not found at: {steam_path}"));
    }

    if let Err(e) = launch_steam_app() {
        return fail(&format!("Failed to launch Steam: {e}"));
    }

    LaunchResult {
        success: true,
        message: format!("Token valid for {days} days, {hours} hrs, {mins} mins."),
        steam_id: parsed.steam_id,
        account_name: parsed.account_name,
    }
}

pub fn reset_steam_data() -> bool {
    kill_steam_processes();
    let local_vdf = local_vdf_path();
    if local_vdf.exists() {
        fs::remove_file(local_vdf).is_ok()
    } else {
        true
    }
}

pub fn clear_all_steam_sessions() -> bool {
    kill_steam_processes();
    let local_vdf = local_vdf_path();
    if !local_vdf.exists() {
        return true;
    }
    let Ok(mut content) = fs::read_to_string(&local_vdf) else {
        return false;
    };
    if let Ok(re) = Regex::new(r#""ConnectCache"[\s\S]*?\{[\s\S]*?\}"#) {
        content = re
            .replace(&content, "\"ConnectCache\"\n\t\t\t\t{\n\t\t\t\t}")
            .to_string();
    }
    fs::write(local_vdf, content).is_ok()
}

pub fn open_steam_dir() -> Result<(), String> {
    Command::new("open")
        .arg(steam_data_dir())
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn token_regex() -> Regex {
    Regex::new(r"7656119\d+----ey[A-Za-z0-9_\-.]+").unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encrypt_roundtrip() {
        let jwt = "eyAidHlwIjogIkpXVCIsICJhbGciOiAiRWREU0EiIH0.eyJzdWIiOiIxMjMifQ.test";
        let enc = steam_encrypt_mac(jwt, "testuser").unwrap();
        let data = hex::decode(enc).unwrap();
        let key = Sha256::digest(b"testuser");
        let ecb = Aes256EcbDec::new(&key.into());
        let mut iv_block = data[..16].to_vec();
        ecb.decrypt_block_mut(iv_block.as_mut_slice().into());
        let iv: [u8; 16] = iv_block.try_into().unwrap();
        let cbc = Aes256CbcDec::new(&key.into(), &iv.into());
        let mut buf = data[16..].to_vec();
        let dec = cbc.decrypt_padded_mut::<Pkcs7>(&mut buf).unwrap();
        assert_eq!(std::str::from_utf8(dec).unwrap(), jwt);
    }
}
