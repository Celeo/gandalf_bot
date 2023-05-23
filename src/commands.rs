use crate::config::Config;
use anyhow::Result;
use std::sync::Arc;
use twilight_gateway::Event;
use twilight_http::Client;
use twilight_interactions::command::{CommandInputData, CommandModel, CreateCommand};
use twilight_model::{
    application::interaction::{InteractionData, InteractionType},
    http::interaction::{InteractionResponse, InteractionResponseType},
    id::Id,
    user::User,
};
use twilight_util::builder::InteractionResponseDataBuilder;

const HELP_CONTENT: &str = r"**Available commands**:

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
    pub target: User,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "unbreach", desc = "Save someone from Mordor")]
pub struct UnbreachCommand {
    /// User to target
    pub target: User,
}

#[derive(Debug, CommandModel, CreateCommand)]
#[command(name = "help", desc = "Show bot commands")]
pub struct HelpCommand;

pub async fn handler(
    e: &Event,
    _config: &Arc<Config>,
    http: &Arc<Client>,
    bot_id: u64,
) -> Result<()> {
    if let Event::InteractionCreate(event) = e {
        if event.kind != InteractionType::ApplicationCommand {
            return Ok(());
        }
        let interaction = http.interaction(Id::new(bot_id));
        if let InteractionData::ApplicationCommand(app_command) = &event.0.data.as_ref().unwrap() {
            let input_data = CommandInputData::from(app_command.as_ref().to_owned());
            let executor_is_admin = false; // TODO

            match app_command.name.as_str() {
                "pin" => (),
                "unpin" => (),
                "breach" => (),
                "unbreach" => (),
                "help" => {
                    interaction
                        .create_response(
                            event.id,
                            &event.token,
                            &InteractionResponse {
                                kind: InteractionResponseType::ChannelMessageWithSource,
                                data: Some(
                                    InteractionResponseDataBuilder::new()
                                        .content(HELP_CONTENT)
                                        .build(),
                                ),
                            },
                        )
                        .await?;
                }
                _ => (),
            }
        }
    }
    Ok(())
}
