defmodule Bot.Roles do
  require Logger

  defp handle_reaction!(guild_id, channel_id, message_id, user_id, username, emoji_name, add) do
    db_roles = Bot.Config.DB.get!()
    guild_roles = Nostrum.Api.get_guild_roles!(guild_id)

    matches_from_db =
      Enum.filter(db_roles, fn row ->
        Enum.at(row, 0) == channel_id &&
          Enum.at(row, 1) == message_id &&
          Enum.at(row, 2) == emoji_name
      end)

    if length(matches_from_db) == 0 do
      Logger.debug("No matching roles in DB for added reaction")
    end

    Enum.each(matches_from_db, fn db_entry ->
      db_entry_name = Enum.at(db_entry, 3)
      guild_role = Enum.find(guild_roles, &(&1.name == db_entry_name))

      case guild_role do
        nil ->
          Logger.warning(
            "No guild role with name #{db_entry_name} (guild has #{length(guild_roles)} roles)"
          )

        guild_role ->
          if add do
            Logger.debug("Adding role #{db_entry_name} to #{username}")

            {:ok} =
              Nostrum.Api.add_guild_member_role(
                guild_id,
                user_id,
                guild_role.id
              )
          else
            Logger.debug("Removing role #{db_entry_name} to #{username}")

            {:ok} =
              Nostrum.Api.remove_guild_member_role(
                guild_id,
                user_id,
                guild_role.id
              )
          end
      end
    end)
  end

  def reaction_add(data) do
    handle_reaction!(
      data[:guild_id],
      data[:channel_id],
      data[:message_id],
      data[:member][:user][:id],
      data[:member][:user][:username],
      data[:emoji][:name],
      true
    )
  end

  def reaction_remove(data) do
    user_obj = Nostrum.Api.get_user!(data[:user_id])

    handle_reaction!(
      data[:guild_id],
      data[:channel_id],
      data[:message_id],
      data[:user_id],
      user_obj.username,
      data[:emoji][:name],
      false
    )
  end
end
