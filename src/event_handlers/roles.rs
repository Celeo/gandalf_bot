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
            _ = http
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
            _ = http
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
    use super::handle_reaction;
    use crate::config::{Config, ReactionRole};
    use std::sync::Arc;
    use twilight_model::{
        channel::message::ReactionType,
        guild::{Permissions, Role},
        id::Id,
    };

    #[test]
    fn test_handle_reaction_no_config() {
        assert!(handle_reaction(
            &Arc::new(Config::default()),
            &vec![],
            1,
            2,
            &ReactionType::Unicode {
                name: String::from("🤧"),
            },
        )
        .unwrap()
        .is_none());
    }

    #[test]
    fn test_handle_reaction_no_match() {
        let config = {
            let mut config = Config::default();
            config.reaction_roles.push(ReactionRole {
                channel_id: 1,
                message_id: 2,
                role_name: String::from("role-1"),
                emoji: String::from("1️⃣"),
            });
            Arc::new(config)
        };
        assert!(handle_reaction(
            &config,
            &vec![],
            1,
            2,
            &ReactionType::Unicode {
                name: String::from("2️⃣"),
            },
        )
        .unwrap()
        .is_none());
    }

    #[test]
    fn test_handle_reaction_match() {
        let config = {
            let mut config = Config::default();
            config.reaction_roles.push(ReactionRole {
                channel_id: 1,
                message_id: 2,
                role_name: String::from("role-1"),
                emoji: String::from("1️⃣"),
            });
            Arc::new(config)
        };
        let roles = vec![Role {
            color: 0,
            hoist: true,
            icon: None,
            id: Id::new(3),
            managed: false,
            mentionable: true,
            name: String::from("role-1"),
            permissions: Permissions::CREATE_INVITE,
            position: 1,
            tags: None,
            unicode_emoji: None,
        }];
        assert_eq!(
            handle_reaction(
                &config,
                &roles,
                1,
                2,
                &ReactionType::Unicode {
                    name: String::from("1️⃣"),
                },
            )
            .unwrap(),
            Some(roles.get(0).unwrap())
        );
    }
}
