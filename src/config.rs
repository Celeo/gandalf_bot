use anyhow::Result;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct ReactionRole {
    pub channel_id: u64,
    pub message_id: u64,
    pub emoji: String,
    pub role_name: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Birthday {
    pub who: u64,
    pub when: String,
}

/// Bot config.
#[derive(Debug, Deserialize, Clone, Default)]
pub struct Config {
    pub discord_token: String,
    pub containment_role_id: u64,
    pub containment_response_gif: String,
    pub invalid_permissions_response_gif: String,
    pub laughing_response_gif: String,
    pub blessable_user_ids: Vec<u64>,
    pub laugh_threshold: u64,
    pub laugh_chance: f32,
    pub reaction_roles: Vec<ReactionRole>,
    pub birthday_channel: u64,
    pub birthdays: Vec<Birthday>,
    pub game_channel: u64,
}

/// Load the configuration from disk.
pub async fn load() -> Result<Config> {
    let text = std::fs::read_to_string("gandalf.json")?;
    let data = serde_json::from_str(&text)?;
    Ok(data)
}
