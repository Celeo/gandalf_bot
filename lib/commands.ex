defmodule Bot.Commands do
  require Logger

  @doc """
  Command handler for user-submitted commands.

  Is passed a message struct from a message created handler.
  Returns `:notfound` if no commands matched, `nil` otherwise.
  """
  def run!(msg) do
    [name, args] =
      case String.contains?(msg.content, " ") do
        true ->
          [name, back] = String.split(msg.content, " ", parts: 2, trim: true)
          [name, String.split(back, " ", trim: true)]

        false ->
          [msg.content, []]
      end

    case name do
      "!breach" -> cmd_breach!(args, msg)
      "!unbreach" -> cmd_unbreach!(args, msg)
      "!sitrep" -> cmd_sitrep!(args, msg)
      "!roll" -> cmd_roll!(args, msg)
      "!merit" -> cmd_merit!(args, msg)
      "!condition" -> cmd_condition!(args, msg)
      "!reactionrole" -> cmd_reactionrole!(args, msg)
      "!reactionroles" -> cmd_reactionroles!(args, msg)
      _ -> :notfound
    end
  end

  defp get_containment_role!(config, guild_id) do
    role_id = config.containment_role_id
    Enum.find(Nostrum.Api.get_guild_roles!(guild_id), &(&1.id == role_id))
  end

  defp member_is_admin!(guild_id, member) do
    guild = Nostrum.Api.get_guild!(guild_id)
    permissions = Nostrum.Struct.Guild.Member.guild_permissions(member, guild)
    Enum.member?(permissions, :administrator)
  end

  defp cmd_breach!(args, msg) do
    Logger.debug("cmd_breach!(#{inspect(args)}) by #{msg.author.username}")
    config = Bot.Config.File.read_from_disk!()

    if member_is_admin!(msg.guild_id, msg.member) do
      containment_role = get_containment_role!(config, msg.guild_id)

      applied_to =
        Enum.map(msg.mentions, fn mentioned_user ->
          Nostrum.Api.add_guild_member_role(msg.guild_id, mentioned_user.id, containment_role.id)
          mentioned_user.username
        end)

      applied_to_str = Enum.join(applied_to, ", ")
      Logger.debug("Contained users: #{applied_to_str}")
      Nostrum.Api.create_message!(msg.channel_id, config.containment_response_gif)
    else
      Nostrum.Api.create_message!(
        msg.channel_id,
        "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139"
      )
    end
  end

  defp cmd_unbreach!(args, msg) do
    Logger.debug("cmd_unbreach!(#{inspect(args)}) by #{msg.author.username}")
    config = Bot.Config.File.read_from_disk!()

    if member_is_admin!(msg.guild_id, msg.member) do
      containment_role = get_containment_role!(config, msg.guild_id)

      removed_from =
        Enum.map(msg.mentions, fn mentioned_user ->
          Nostrum.Api.remove_guild_member_role(
            msg.guild_id,
            mentioned_user.id,
            containment_role.id
          )

          mentioned_user.username
        end)

      removed_from_str = Enum.join(removed_from, ", ")
      Logger.debug("Uncontained users: #{removed_from_str}")
      Nostrum.Api.create_message!(msg.channel_id, "It is done.")
    else
      Nostrum.Api.create_message!(
        msg.channel_id,
        "https://tenor.com/view/no-nooo-nope-eat-fingerwag-gif-14832139"
      )
    end
  end

  defp cmd_sitrep!(args, msg) do
    Logger.debug("cmd_sitrep!(#{inspect(args)}) by #{msg.author.username}")
    config = Bot.Config.File.read_from_disk!()

    if member_is_admin!(msg.guild_id, msg.member) do
      containment_role = get_containment_role!(config, msg.guild_id)
      guild_members = Nostrum.Api.list_guild_members!(msg.guild_id, limit: 1000)
      contained_users = Enum.filter(guild_members, &Enum.member?(&1.roles, containment_role.id))

      if length(contained_users) > 0 do
        contained_users_str = Enum.join(contained_users, ", ")
        Nostrum.Api.create_message!(msg.channel_id, "Contained users: #{contained_users_str}")
      else
        Nostrum.Api.create_message!(msg.channel_id, "No one is contained")
      end
    end
  end

  defp cmd_roll!(args, msg) do
    Logger.debug("cmd_roll!(#{inspect(args)}) by #{msg.author.username}")

    results =
      args
      |> Enum.join(" ")
      |> Bot.Dice.handle_roll()
      |> Bot.Dice.roll_results_to_string()

    Nostrum.Api.create_message!(
      msg.channel_id,
      content: results,
      message_reference: %{message_id: msg.id}
    )
  end

  defp cmd_merit!(args, msg) do
    Bot.Util.Screenshots.find_and_send(Bot.Util.Screenshots.ScreenshotType.Merit, args, msg)
  end

  defp cmd_condition!(args, msg) do
    Bot.Util.Screenshots.find_and_send(Bot.Util.Screenshots.ScreenshotType.Condition, args, msg)
  end

  defp cmd_reactionrole!(args, msg) do
    Logger.debug("cmd_reactionrole!(#{inspect(args)}) by #{msg.author.username}")

    # TODO implement command

    Nostrum.Api.create_message!(
      msg.channel_id,
      content: "Command not implemented",
      message_reference: %{message_id: msg.id}
    )
  end

  defp cmd_reactionroles!(args, msg) do
    Logger.debug("cmd_reactionroles!(#{inspect(args)}) by #{msg.author.username}")

    # TODO implement command

    Nostrum.Api.create_message!(
      msg.channel_id,
      content: "Command not implemented",
      message_reference: %{message_id: msg.id}
    )
  end
end
