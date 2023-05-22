use crate::config::Config;
use anyhow::{anyhow, Result};
use log::{debug, warn};
use std::sync::Arc;
use twilight_gateway::Event;
use twilight_http::Client;
use twilight_model::{channel::message::ReactionType, guild::Role};

#[allow(clippy::too_many_arguments)]
fn handle_reaction<'a>(
    config: &Arc<Config>,
    guild_roles: &'a [Role],
    channel_id: u64,
    message_id: u64,
    emoji: &ReactionType,
) -> Result<Option<&'a Role>> {
    let mut partial_match = false;
    let emoji = match emoji {
        ReactionType::Custom { name, .. } => name
            .as_ref()
            .ok_or_else(|| anyhow!("Missing custom emoji name"))?,
        ReactionType::Unicode { name } => name,
    };

    for entry in &config.reaction_roles {
        if entry.channel_id != channel_id || entry.message_id != message_id {
            continue;
        }
        partial_match = true;
        if entry.emoji != *emoji {
            continue;
        }
        let Some(role) = guild_roles.iter().find(|&role| role.name == entry.role_name) else {
            warn!("Could not find role by name: {}", entry.role_name);
            return Ok(None);
        };
        return Ok(Some(role));
    }
    if partial_match {
        debug!(
            "Matching channel & message, but no matching reaction emoji for: {}",
            emoji
        );
    }

    Ok(None)
}

pub async fn handler(e: &Event, config: &Arc<Config>, http: &Arc<Client>) -> Result<()> {
    let Some(guild_id) = e.guild_id() else {
        return Ok(())
    };
    let guild = http.guild(guild_id).await?.model().await?;

    if let Event::ReactionAdd(event) = e {
        if let Some(role) = handle_reaction(
            config,
            &guild.roles,
            event.channel_id.get(),
            event.message_id.get(),
            &event.emoji,
        )? {
            let _ = http
                .add_guild_member_role(guild_id, event.user_id, role.id)
                .await?;
            let dm = http
                .create_private_channel(event.user_id)
                .await?
                .model()
                .await?;
            http.create_message(dm.id)
                .content(&format!("Added the \"{}\" role to you", role.name))?
                .await?;
        }
    } else if let Event::ReactionRemove(event) = e {
        if let Some(role) = handle_reaction(
            config,
            &guild.roles,
            event.channel_id.get(),
            event.message_id.get(),
            &event.emoji,
        )? {
            let _ = http
                .remove_guild_member_role(guild_id, event.user_id, role.id)
                .await?;
            let dm = http
                .create_private_channel(event.user_id)
                .await?
                .model()
                .await?;
            http.create_message(dm.id)
                .content(&format!("Removed the \"{}\" role from you", role.name))?
                .await?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    // TODO
}
