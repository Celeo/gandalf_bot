use std::{
    collections::HashSet,
    sync::{Arc, Mutex},
};

use crate::config::Config;
use anyhow::Result;
use rand::Rng;
use std::sync::LazyLock;
use twilight_gateway::Event;
use twilight_http::Client;
use twilight_model::channel::message::ReactionType;

static EMOJIS: LazyLock<Vec<&str>> = LazyLock::new(|| vec!["😆", "😂", "🤣", "😄"]);
static RESPONSES: LazyLock<Mutex<HashSet<u64>>> = LazyLock::new(|| Mutex::new(HashSet::new()));

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
        if count >= config.laugh_threshold {
            let chance: f32 = rand::thread_rng().gen();
            if chance < config.laugh_chance {
                http.create_message(event.channel_id)
                    .reply(event.message_id)
                    .content(&config.laughing_response_gif)?
                    .await?;
                RESPONSES.lock().unwrap().insert(event.message_id.get());
            }
        }
    }

    Ok(())
}
