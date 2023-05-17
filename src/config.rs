use anyhow::{anyhow, Result};
use base64::{engine::general_purpose, Engine as _};
use log::debug;
use reqwest::header;
use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize, Clone)]
pub struct ReactionRole {
    pub channel_id: u64,
    pub message_id: u64,
    pub emoji: String,
    pub role_name: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Birthday {
    pub who: String,
    pub when: String,
}

/// Bot config.
#[derive(Debug, Deserialize, Clone, Default)]
pub struct Config {
    pub containment_role_id: u64,
    pub containment_response_gif: String,
    pub blessable_user_ids: Vec<u64>,
    pub listenable_user_ids: Vec<u64>,
    pub gross_user_ids: Vec<u64>,
    pub reaction_roles: Vec<ReactionRole>,
    pub birthday_channel: u64,
    pub birthdays: Vec<Birthday>,
    pub book_channel: u64,
    pub book_reminders: Vec<u8>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct B2AuthResponseAllowed {
    bucket_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct B2AuthResponse {
    authorization_token: String,
    download_url: String,
    allowed: B2AuthResponseAllowed,
}

/// Load the configuration from B2.
pub async fn load() -> Result<Config> {
    let key_id = env::var("B2_KEY_ID")?;
    let app_key = env::var("B2_APP_KEY")?;
    let file_name = env::var("B2_FILE_NAME")?;
    let auth_encoded = general_purpose::STANDARD_NO_PAD.encode(format!("{key_id}:{app_key}"));

    debug!("Getting config from B2");
    let http = reqwest::Client::new();
    let auth_resp = http
        .get("https://api.backblazeb2.com/b2api/v2/b2_authorize_account")
        .header(
            header::AUTHORIZATION,
            header::HeaderValue::from_str(&format!("Basic {auth_encoded}"))?,
        )
        .send()
        .await?;
    if !auth_resp.status().is_success() {
        return Err(anyhow!(format!(
            "Got status {} from B2 auth call",
            auth_resp.status().as_u16()
        )));
    }
    let auth_resp_data: B2AuthResponse = auth_resp.json().await?;

    let download_resp = http
        .get(&format!(
            "{}/file/{}/{file_name}",
            auth_resp_data.download_url, auth_resp_data.allowed.bucket_name
        ))
        .header(
            header::AUTHORIZATION,
            header::HeaderValue::from_str(&auth_resp_data.authorization_token)?,
        )
        .send()
        .await?;
    if !download_resp.status().is_success() {
        return Err(anyhow!(format!(
            "Got status {} from B2 auth call",
            download_resp.status().as_u16()
        )));
    }
    let download_resp = download_resp.json().await?;
    Ok(download_resp)
}
