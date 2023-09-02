use crate::config::Config;
use anyhow::Result;
use std::{str::FromStr, sync::Arc};
use twilight_gateway::Event;
use twilight_http::{client::InteractionClient, Client};
use twilight_interactions::command::{
    CommandInputData, CommandModel, CommandOption, CreateCommand, CreateOption,
};
use twilight_model::{
    application::interaction::{InteractionData, InteractionType},
    gateway::payload::incoming::InteractionCreate,
    guild::Permissions,
    http::interaction::{InteractionResponse, InteractionResponseType},
    id::Id,
    user::User,
};
use twilight_util::builder::InteractionResponseDataBuilder;

const HELP_CONTENT: &str = r"**Available commands**:

- /color_me - Set your username's color in the server
- /pin - Pin a message to a channel
- /unpin - Unpin a pinned message from a channel
- /breach - Throw someone to the shadow realm
- /unbreach - Save someone from the shadow realm

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
}

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
        })
    }
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "color_me", desc = "Color your username")]
pub struct ColorMeCommand {
    /// The color you want to be.
    pub color: Color,
}

async fn resp<'a>(
    event: &InteractionCreate,
    interaction: &InteractionClient<'a>,
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
                .map_or(false, |p| p.contains(Permissions::ADMINISTRATOR));

            match app_command.name.as_str() {
                "pin" => {
                    let pin = PinCommand::from_interaction(input_data)?;
                    http.create_pin(
                        event.channel.as_ref().unwrap().id,
                        Id::from_str(&pin.message_id)?,
                    )
                    .await?;
                    resp(event, &interaction, "👍").await?;
                }
                "unpin" => {
                    let unpin = UnpinCommand::from_interaction(input_data)?;
                    http.delete_pin(
                        event.channel.as_ref().unwrap().id,
                        Id::from_str(&unpin.message_id)?,
                    )
                    .await?;
                    resp(event, &interaction, "👍").await?;
                }
                "breach" => {
                    if !sender_is_admin {
                        resp(
                            event,
                            &interaction,
                            "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
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
                            "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139",
                        )
                        .await?;
                        return Ok(());
                    }
                    let breach = BreachCommand::from_interaction(input_data)?;
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
                "help" => {
                    resp(event, &interaction, HELP_CONTENT).await?;
                }
                _ => (),
            }
        }
    }
    Ok(())
}
