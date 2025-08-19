use crate::{config::Config, fires, openai};
use anyhow::Result;
use chrono::{TimeDelta, TimeZone, Utc};
use log::error;
use std::{fmt::Write, str::FromStr, sync::Arc};
use twilight_gateway::Event;
use twilight_http::{client::InteractionClient, Client};
use twilight_interactions::command::{
    CommandInputData, CommandModel, CommandOption, CreateCommand, CreateOption,
};
use twilight_model::{
    application::interaction::{InteractionData, InteractionType},
    channel::message::MessageFlags,
    gateway::payload::incoming::InteractionCreate,
    guild::Permissions,
    http::interaction::{InteractionResponse, InteractionResponseType},
    id::Id,
    user::User,
};
use twilight_util::builder::{
    embed::{EmbedBuilder, EmbedFieldBuilder},
    InteractionResponseDataBuilder,
};

const HELP_CONTENT: &str = r"**Available commands**:

- /color_me - Set your username's color in the server
- /pin - Pin a message to a channel
- /unpin - Unpin a pinned message from a channel
- /breach - Throw someone to the shadow realm
- /unbreach - Save someone from the shadow realm
- /fires - See data about nearby fires
- /summarize - Summarize a person's recent messages in a channel
- /summarize_this - Summarize a single post

When using (un)pin, you need the ID of the message. Enable developer \
mode in Settings -> Advanced, and then right click a message -> Copy ID \
to get the ID. Paste that into the command argument.

Anyone can pin and unpin messages via those commands. These are available \
as commands instead of default Discord permissions since Discord permissions \
are bad.

Breaching is only available to server admins.";

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "pin", desc = "Pin a message")]
pub struct PinCommand {
    /// ID of the message to pin
    pub message_id: String,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "unpin", desc = "Unpin a message")]
pub struct UnpinCommand {
    /// ID of the message to unpin
    pub message_id: String,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "breach", desc = "Send someone to Mordor")]
pub struct BreachCommand {
    /// User to target
    pub user: User,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "unbreach", desc = "Save someone from Mordor")]
pub struct UnbreachCommand {
    /// User to target
    pub user: User,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "summarize", desc = "When someone hits you with a wall of text")]
pub struct SummarizeCommand {
    /// User to read from
    pub user: User,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(
    name = "summarize_this",
    desc = "When someone hits you with a big post"
)]
pub struct SummarizeThisCommand {
    /// ID of the message to summary
    pub message_id: String,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "help", desc = "Show bot commands")]
pub struct HelpCommand;

#[derive(Debug, CommandOption, CreateOption)]
pub enum Color {
    #[option(name = "white", value = 10)]
    White,
    #[option(name = "red", value = 20)]
    Red,
    #[option(name = "orange", value = 30)]
    Orange,
    #[option(name = "yellow", value = 40)]
    Yellow,
    #[option(name = "green", value = 50)]
    Green,
    #[option(name = "blue", value = 60)]
    Blue,
    #[option(name = "purple", value = 70)]
    Purple,
    #[option(name = "pink", value = 80)]
    Pink,
    #[option(name = "black", value = 90)]
    Black,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "fires", desc = "Show nearby fires")]
pub struct FiresCommand;

impl Color {
    fn role_name(&self) -> String {
        String::from(match self {
            Color::White => "name-white",
            Color::Red => "name-red",
            Color::Orange => "name-orange",
            Color::Yellow => "name-yellow",
            Color::Green => "name-green",
            Color::Blue => "name-blue",
            Color::Purple => "name-purple",
            Color::Pink => "name-pink",
            Color::Black => "name-black",
        })
    }
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "color_me", desc = "Color your username")]
pub struct ColorMeCommand {
    /// The color you want to be.
    pub color: Color,
}

async fn resp(
    event: &InteractionCreate,
    interaction: &InteractionClient<'_>,
    message: &str,
) -> Result<()> {
    interaction
        .create_response(
            event.id,
            &event.token,
            &InteractionResponse {
                kind: InteractionResponseType::ChannelMessageWithSource,
                data: Some(
                    InteractionResponseDataBuilder::new()
                        .content(message)
                        .build(),
                ),
            },
        )
        .await?;
    Ok(())
}

#[allow(clippy::too_many_lines)]
pub async fn handler(
    e: &Event,
    config: &Arc<Config>,
    http: &Arc<Client>,
    bot_id: u64,
) -> Result<()> {
    if let Event::InteractionCreate(event) = e {
        if event.kind != InteractionType::ApplicationCommand {
            return Ok(());
        }
        let interaction = http.interaction(Id::new(bot_id));
        if let InteractionData::ApplicationCommand(app_command) = &event.0.data.as_ref().unwrap() {
            let input_data = CommandInputData::from(app_command.as_ref().clone());
            let sender_is_admin = event
                .member
                .as_ref()
                .unwrap()
                .permissions
                .is_some_and(|p| p.contains(Permissions::ADMINISTRATOR));

            match app_command.name.as_str() {
                "pin" => {
                    let pin = PinCommand::from_interaction(input_data)?;
                    http.create_pin(
                        event.channel.as_ref().unwrap().id,
                        Id::from_str(&pin.message_id)?,
                    )
                    .await?;
                    interaction
                        .create_response(
                            event.id,
                            &event.token,
                            &InteractionResponse {
                                kind: InteractionResponseType::ChannelMessageWithSource,
                                data: Some(
                                    InteractionResponseDataBuilder::new()
                                        .content("👍")
                                        .flags(MessageFlags::EPHEMERAL)
                                        .components(None)
                                        .build(),
                                ),
                            },
                        )
                        .await?;
                }
                "unpin" => {
                    let unpin = UnpinCommand::from_interaction(input_data)?;
                    http.delete_pin(
                        event.channel.as_ref().unwrap().id,
                        Id::from_str(&unpin.message_id)?,
                    )
                    .await?;
                    interaction
                        .create_response(
                            event.id,
                            &event.token,
                            &InteractionResponse {
                                kind: InteractionResponseType::ChannelMessageWithSource,
                                data: Some(
                                    InteractionResponseDataBuilder::new()
                                        .content("👍")
                                        .flags(MessageFlags::EPHEMERAL)
                                        .components(None)
                                        .build(),
                                ),
                            },
                        )
                        .await?;
                }
                "breach" => {
                    if !sender_is_admin {
                        resp(
                            event,
                            &interaction,
                            &config.invalid_permissions_response_gif,
                        )
                        .await?;
                        return Ok(());
                    }
                    let breach = BreachCommand::from_interaction(input_data)?;
                    http.add_guild_member_role(
                        event.guild_id.unwrap(),
                        breach.user.id,
                        Id::new(config.containment_role_id),
                    )
                    .await?;
                    resp(event, &interaction, &config.containment_response_gif).await?;
                }
                "unbreach" => {
                    if !sender_is_admin {
                        resp(
                            event,
                            &interaction,
                            &config.invalid_permissions_response_gif,
                        )
                        .await?;
                        return Ok(());
                    }
                    let breach = UnbreachCommand::from_interaction(input_data)?;
                    http.remove_guild_member_role(
                        event.guild_id.unwrap(),
                        breach.user.id,
                        Id::new(config.containment_role_id),
                    )
                    .await?;
                    resp(event, &interaction, "👍").await?;
                }
                "color_me" => {
                    let color_me = ColorMeCommand::from_interaction(input_data)?;
                    let roles = http.roles(event.guild_id.unwrap()).await?.model().await?;
                    for role in &roles {
                        if role.name == color_me.color.role_name() {
                            http.add_guild_member_role(
                                event.guild_id.unwrap(),
                                event.member.as_ref().unwrap().user.as_ref().unwrap().id,
                                role.id,
                            )
                            .await?;
                            resp(event, &interaction, "👍").await?;
                        } else if role.name.starts_with("name-") {
                            http.remove_guild_member_role(
                                event.guild_id.unwrap(),
                                event.member.as_ref().unwrap().user.as_ref().unwrap().id,
                                role.id,
                            )
                            .await?;
                        }
                    }
                }
                "fires" => {
                    let response = reqwest::get(
                        "https://incidents.fire.ca.gov/umbraco/api/IncidentApi/List?inactive=false",
                    )
                    .await?;
                    if response.status().is_success() {
                        match fires::get_fire_data(config).await {
                            Ok(data) => {
                                if data.is_empty() {
                                    http.create_message(event.channel.as_ref().unwrap().id)
                                        .content("No local fires")?
                                        .await?;
                                } else {
                                    interaction
                                    .create_response(
                                        event.id,
                                        &event.token,
                                        &InteractionResponse {
                                            kind: InteractionResponseType::ChannelMessageWithSource,
                                            data: Some(
                                                InteractionResponseDataBuilder::new()
                                                    .content("Posted")
                                                    .flags(MessageFlags::EPHEMERAL)
                                                    .components(None)
                                                    .build(),
                                            ),
                                        },
                                    )
                                    .await?;

                                    let mut embeds = Vec::new();
                                    for fire in &data {
                                        let embed = EmbedBuilder::new()
                                            .title(&fire.name)
                                            .url(&fire.url)
                                            .field(
                                                EmbedFieldBuilder::new("Started", &fire.started)
                                                    .inline(),
                                            )
                                            .field(
                                                EmbedFieldBuilder::new("Updated", &fire.updated)
                                                    .inline(),
                                            )
                                            .field(
                                                EmbedFieldBuilder::new("County", &fire.county)
                                                    .inline(),
                                            )
                                            .field(
                                                EmbedFieldBuilder::new("Location", &fire.location)
                                                    .inline(),
                                            )
                                            .field(
                                                EmbedFieldBuilder::new(
                                                    "Acres burned",
                                                    fire.acres_burned.to_string(),
                                                )
                                                .inline(),
                                            )
                                            .field(
                                                EmbedFieldBuilder::new(
                                                    "Percent contained",
                                                    fire.percent_contained
                                                        .unwrap_or_default()
                                                        .to_string(),
                                                )
                                                .inline(),
                                            )
                                            .validate()?
                                            .build();
                                        embeds.push(embed);
                                    }
                                    http.create_message(event.channel.as_ref().unwrap().id)
                                        .content("## Local fire data")?
                                        .embeds(&embeds)?
                                        .await?;
                                }
                            }
                            Err(e) => {
                                error!("Error getting fire API data: {e}");
                                resp(event, &interaction, "Something went wrong").await?;
                            }
                        };
                    } else {
                        resp(event, &interaction, "Error getting data").await?;
                    }
                }
                "summarize" => {
                    let channel_id = event.channel.as_ref().unwrap().id;
                    let messages = http.channel_messages(channel_id).await?.models().await?;
                    let cmd = SummarizeCommand::from_interaction(input_data)?;
                    let now = Utc::now();
                    let text = messages.iter().filter(|m| m.author.id == cmd.user.id).fold(
                        String::new(),
                        |mut acc, m| {
                            let created = Utc.timestamp_opt(m.timestamp.as_secs(), 0).unwrap();
                            if (now - created) <= TimeDelta::hours(6) {
                                writeln!(acc, "{}", &m.content).unwrap();
                            }
                            acc
                        },
                    );
                    if text.trim().is_empty() {
                        resp(event, &interaction, "No recent messages found").await?;
                    } else {
                        let summary = openai::summarize(config, &text).await?;
                        resp(
                        event,
                        &interaction,
                        &format!(
                            "Here is your summary of {}'s messages in this channel from the last few hours:\n {summary}",
                            cmd.user.name
                        ),
                    )
                    .await?;
                    }
                }
                "summarize_this" => {
                    let cmd = SummarizeThisCommand::from_interaction(input_data)?;
                    let selected_msg = http
                        .message(
                            event.channel.as_ref().unwrap().id,
                            Id::from_str(&cmd.message_id)?,
                        )
                        .await?
                        .model()
                        .await?;
                    if selected_msg.content.len() <= 100 {
                        interaction
                            .create_response(
                                event.id,
                                &event.token,
                                &InteractionResponse {
                                    kind: InteractionResponseType::ChannelMessageWithSource,
                                    data: Some(
                                        InteractionResponseDataBuilder::new()
                                            .content("Targetted message is too short")
                                            .flags(MessageFlags::EPHEMERAL)
                                            .components(None)
                                            .build(),
                                    ),
                                },
                            )
                            .await?;
                    } else {
                        let summary = openai::summarize(config, &selected_msg.content).await?;
                        resp(
                            event,
                            &interaction,
                            &format!("Here is your summary of that post:\n {summary}"),
                        )
                        .await?;
                    }
                }
                "help" => {
                    resp(event, &interaction, HELP_CONTENT).await?;
                }
                _ => (),
            }
        }
    }
    Ok(())
}
