use std::{
    collections::HashSet,
    sync::{Arc, Mutex},
};

use crate::config::Config;
use anyhow::Result;
use once_cell::sync::Lazy;
use twilight_gateway::Event;
use twilight_http::Client;
use twilight_model::channel::message::ReactionType;

const LOWER_LIMIT: u64 = 2;
static EMOJIS: Lazy<Vec<&str>> = Lazy::new(|| vec!["😆", "😂", "🤣", "😄"]);
static RESPONSES: Lazy<Mutex<HashSet<u64>>> = Lazy::new(|| Mutex::new(HashSet::new()));

pub async fn handler(e: &Event, config: &Arc<Config>, http: &Arc<Client>) -> Result<()> {
    if let Event::ReactionAdd(event) = e {
        // abort if the message has already been responded to
        if RESPONSES.lock().unwrap().contains(&event.message_id.get()) {
            return Ok(());
        }
        // abort if the new emoji is not one of the set
        match &event.emoji {
            ReactionType::Unicode { name } => {
                if !EMOJIS.contains(&name.as_str()) {
                    return Ok(());
                }
            }
            ReactionType::Custom { .. } => return Ok(()),
        }

        // count matching emojis on the message
        let message = http
            .message(event.channel_id, event.message_id)
            .await?
            .model()
            .await?;
        let mut count = 0;
        for reaction in message.reactions {
            match &reaction.emoji {
                ReactionType::Unicode { name } => {
                    if EMOJIS.contains(&name.as_str()) {
                        count += reaction.count;
                    }
                }
                ReactionType::Custom { .. } => (),
            }
        }

        // conditionally post the response gif
        if count >= LOWER_LIMIT {
            http.create_message(event.channel_id)
                .reply(event.message_id)
                .content(&config.laughing_response_gif)?
                .await?;
        }
    }

    Ok(())
}
