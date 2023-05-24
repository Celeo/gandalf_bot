#![deny(clippy::all, clippy::pedantic)]

use crate::config::{load as load_config, Config};
use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};
use dotenv::dotenv;
use log::{error, info, warn};
use std::{env, sync::Arc};
use twilight_gateway::{Event, Intents, Shard, ShardId};
use twilight_http::Client as HttpClient;
use twilight_interactions::command::CreateCommand;
use twilight_model::id::Id;

mod commands;
mod config;
mod event_handlers;
mod quotes;

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

/// Entrypoint.
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
        | Intents::GUILD_MESSAGE_REACTIONS
        | Intents::DIRECT_MESSAGES;
    let mut shard = Shard::new(ShardId::ONE, token.clone(), intents);
    let http = Arc::new(HttpClient::new(token));
    let interaction_client = http.interaction(Id::new(bot_id));

    interaction_client
        .set_global_commands(&[
            commands::PinCommand::create_command().into(),
            commands::UnpinCommand::create_command().into(),
            commands::BreachCommand::create_command().into(),
            commands::UnbreachCommand::create_command().into(),
            commands::HelpCommand::create_command().into(),
        ])
        .await
        .unwrap();

    let config = match load_config().await {
        Ok(c) => Arc::new(c),
        Err(e) => {
            error!("Could not load config: {e}");
            std::process::exit(1);
        }
    };

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

        let http: Arc<HttpClient> = Arc::clone(&http);
        let config = Arc::clone(&config);
        tokio::spawn(async move {
            if let Err(e) = handle_event(event, config, http, bot_id).await {
                error!("Error processing event handler: {e}");
            }
        });
    }
}

/// Handle a single event from the Discord Gateway.
async fn handle_event(
    event: Event,
    config: Arc<Config>,
    http: Arc<HttpClient>,
    bot_id: u64,
) -> Result<()> {
    event_handlers::bless_you::handler(&event, &config, &http).await?;
    event_handlers::guessing_games::handler(&event, &http).await?;
    event_handlers::respond::handler(&event, &http, bot_id).await?;
    event_handlers::roles::handler(&event, &config, &http).await?;
    commands::handler(&event, &config, &http, bot_id).await?;

    Ok(())
}
