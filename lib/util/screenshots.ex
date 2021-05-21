defmodule Bot.Util.Screenshots do
  use EnumType
  require Logger

  defenum ScreenshotType do
    value(Merit, "merit")
    value(Condition, "condition")
  end

  def find_and_send(type, args, msg) do
    Logger.debug(
      "Looking up #{type.value()} screenshots: (#{inspect(args)}) for #{msg.author.username}"
    )

    if length(args) == 0 do
      Nostrum.Api.create_message!(
        msg.channel_id,
        content: "Usage: `!<type> [name]`\n\nWhere `<type>` is \"merit\" or \"condition\"",
        message_reference: %{message_id: msg.id}
      )
    else
      dir = Application.app_dir(:gandalf_discord_bot, "priv/#{type.value()}_screenshots")

      if File.exists?(dir) do
        search_term = args |> Enum.join("_") |> String.replace(" ", "_")

        files_sent =
          File.ls!(dir)
          |> Enum.sort()
          |> Enum.map(fn file ->
            if String.starts_with?(file, search_term) do
              Nostrum.Api.create_message!(
                msg.channel_id,
                file: "#{dir}/#{file}"
              )

              true
            else
              false
            end
          end)
          |> Enum.filter(&(&1 == true))

        if length(files_sent) == 0 do
          Nostrum.Api.create_message!(
            msg.channel_id,
            content: "No matching screenshots found",
            message_reference: %{message_id: msg.id}
          )
        end
      else
        Nostrum.Api.create_message!(
          msg.channel_id,
          content: "No #{type.value()} screenshots folder",
          message_reference: %{message_id: msg.id}
        )
      end
    end
  end
end
