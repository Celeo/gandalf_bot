use crate::quotes::MESSAGES;
use anyhow::Result;
use rand::{seq::IndexedRandom, RngExt};
use std::sync::Arc;
use twilight_gateway::Event;
use twilight_http::Client;
use twilight_model::id::Id;

pub async fn handler(e: &Event, http: &Arc<Client>, bot_id: u64) -> Result<()> {
    if let Event::MessageCreate(event) = e {
        let mentioned_self = event
            .mentions
            .iter()
            .any(|mention| mention.id == Id::new(bot_id));
        if mentioned_self && !event.mention_everyone {
            let response = if rand::rng().random_range(0..500) == 1 {
                "All right then, keep your fucking secrets."
            } else {
                MESSAGES.choose(&mut rand::rng()).unwrap()
            };
            http.create_message(event.channel_id)
                .reply(event.id)
                .content(response)
                .await?;
        }
    }
    Ok(())
}
