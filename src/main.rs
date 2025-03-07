#![deny(clippy::all, clippy::pedantic)]

use crate::config::{load as load_config, Config};
use anyhow::Result;
use base64::{engine::general_purpose, Engine as _};
use chrono::{Datelike, TimeZone};
use log::{debug, error, info, warn};
use std::{collections::HashMap, env, sync::Arc, time::Duration};
use tokio::time::sleep;
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
///
/// There's a function in the bot library for this, but it's simpler
/// to just do this.
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

/// Loop, sending birthday messages to the configured channel
/// every 6 hours on matching days.
async fn birthday_loop(
    config: Arc<Config>,
    http: Arc<HttpClient>,
    posted: &mut HashMap<u64, Vec<i32>>,
) -> Result<()> {
    debug!("Checking for birthdays");
    let now = chrono_tz::US::Pacific.from_utc_datetime(&chrono::offset::Utc::now().naive_utc());
    let now_str = format!("{}/{}", now.month(), now.day());
    for entry in &config.birthdays {
        if entry.when == now_str {
            if posted
                .get(&entry.who)
                .unwrap_or(&Vec::new())
                .contains(&now.year())
            {
                continue;
            }
            info!("Sending birthday message");
            http.create_message(Id::new(config.birthday_channel))
                .content(&format!("Happy birthday to <@!{}>!", entry.who))?
                .await?;
            posted
                .entry(entry.who)
                .and_modify(|d| d.push(now.year()))
                .or_insert(vec![now.year()]);
        }
    }
    Ok(())
}

/// Loop, sending book reminder alerts every 12 hours on matching days.
async fn book_loop(config: Arc<Config>, http: Arc<HttpClient>, posted: &mut Vec<u8>) -> Result<()> {
    debug!("Checking for book reminders");
    if config.book_reminders.is_empty() {
        return Ok(());
    }
    let now = chrono_tz::US::Pacific.from_utc_datetime(&chrono::offset::Utc::now().naive_utc());
    #[allow(clippy::cast_possible_truncation)]
    let day = now.day() as u8; // no idea why they don't have the day as u8 anyway

    if config.book_reminders.contains(&day) && !posted.contains(&day) {
        let message = match config.book_reminders.iter().position(|&b| b == day) {
            Some(0) => "First book reminder! 25% of the way through the month.",
            Some(1) => "Second book reminder! Halfway through the month.",
            Some(2) => "Third book reminder! 75% through the month!",
            Some(3) => "Last book reminder! Finish by tomorrow!",
            Some(_) => {
                error!("OOB day index");
                return Ok(());
            }
            None => {
                error!("Could not get day index");
                return Ok(());
            }
        };
        info!("Sending book reminder message");
        http.create_message(Id::new(config.book_channel))
            .content(message)?
            .await?;
        posted.push(day);
    }

    Ok(())
}

/// Entrypoint.
#[allow(clippy::too_many_lines)]
#[tokio::main]
async fn main() {
    if env::var("RUST_LOG").is_err() {
        env::set_var("RUST_LOG", "warn,gandalf_bot=info");
    }
    pretty_env_logger::init();

    debug!("Loading config");
    let config = match load_config().await {
        Ok(c) => Arc::new(c),
        Err(e) => {
            error!("Could not load config: {e}");
            std::process::exit(1);
        }
    };
    debug!("Config loaded");

    let bot_id = bot_id_from_token(&config.discord_token);
    let intents = Intents::GUILD_MESSAGES
        | Intents::MESSAGE_CONTENT
        | Intents::GUILD_MEMBERS
        | Intents::GUILD_MESSAGE_REACTIONS
        | Intents::DIRECT_MESSAGES;
    let mut shard = Shard::new(ShardId::ONE, config.discord_token.clone(), intents);
    let http = Arc::new(HttpClient::new(config.discord_token.clone()));
    let interaction_client = http.interaction(Id::new(bot_id));

    interaction_client
        .set_global_commands(&[
            commands::PinCommand::create_command().into(),
            commands::UnpinCommand::create_command().into(),
            commands::BreachCommand::create_command().into(),
            commands::UnbreachCommand::create_command().into(),
            commands::ColorMeCommand::create_command().into(),
            commands::HelpCommand::create_command().into(),
        ])
        .await
        .unwrap();

    {
        debug!("Starting birthday task");
        let http = Arc::clone(&http);
        let config = Arc::clone(&config);
        tokio::spawn(async move {
            let mut posted = HashMap::new();
            loop {
                sleep(Duration::from_millis(1_000 * 30)).await; // 30s
                let http = Arc::clone(&http);
                let config = Arc::clone(&config);
                if let Err(e) = birthday_loop(config, http, &mut posted).await {
                    error!("Issue in birthday task: {e}");
                }
                sleep(Duration::from_millis(1_000 * 60 * 60 * 6)).await; // 6hrs
            }
        });
    }

    {
        debug!("Starting book task");
        let http = Arc::clone(&http);
        let config = Arc::clone(&config);
        tokio::spawn(async move {
            let mut posted = Vec::new();
            loop {
                sleep(Duration::from_millis(1_000 * 30)).await; // 30s
                let http = Arc::clone(&http);
                let config = Arc::clone(&config);
                if let Err(e) = book_loop(config, http, &mut posted).await {
                    error!("Issue in book task: {e}");
                }
                sleep(Duration::from_millis(1_000 * 60 * 60 * 12)).await; // 12hrs
            }
        });
    }

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
    event_handlers::laughing::handler(&event, &config, &http).await?;
    commands::handler(&event, &config, &http, bot_id).await?;

    Ok(())
}
