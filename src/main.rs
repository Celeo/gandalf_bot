#![deny(clippy::all, clippy::pedantic)]

use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};
use dotenv::dotenv;
use log::{error, info, warn};
use std::{env, sync::Arc};
use twilight_gateway::{Event, Intents, Shard, ShardId};
use twilight_http::Client as HttpClient;

/// Parse a bot ID from the token.
///
/// This function panics instead of returning a Result, as the token
/// must confirm to this layout in order to be valid for Discord.
fn bot_id_from_token(token: &str) -> u64 {
    std::str::from_utf8(
        &general_purpose::STANDARD_NO_PAD
            .decode(token.split('.').next().unwrap())
            .unwrap(),
    )
    .unwrap()
    .parse()
    .unwrap()
}

#[tokio::main]
async fn main() {
    dotenv().ok();
    if env::var("RUST_LOG").is_err() {
        env::set_var("RUST_LOG", "info");
    }
    pretty_env_logger::init();

    let token = env::var("DISCORD_BOT_TOKEN").expect("Missing 'DISCORD_BOT_TOKEN' env var");
    let bot_id = bot_id_from_token(&token);
    let intents = Intents::GUILD_MESSAGES
        | Intents::MESSAGE_CONTENT
        | Intents::GUILD_MEMBERS
        | Intents::GUILD_MESSAGE_REACTIONS;
    let mut shard = Shard::new(ShardId::ONE, token.clone(), intents);
    let http = Arc::new(HttpClient::new(token));

    info!("Waiting for events");
    loop {
        let event = match shard.next_event().await {
            Ok(event) => event,
            Err(source) => {
                warn!("Error receiving event: {:?}", source);
                if source.is_fatal() {
                    break;
                }
                continue;
            }
        };

        let http = Arc::clone(&http);
        tokio::spawn(async move {
            if let Err(e) = handle_event(event, http, bot_id).await {
                error!("Error in future: {e}");
            }
        });
    }
}

/// Handle a single Event from the Discord Gateway.
async fn handle_event(event: Event, http: Arc<HttpClient>, bot_id: u64) -> Result<()> {
    todo!()
}
