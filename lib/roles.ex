defmodule Bot.Roles do
  require Logger

  def reaction_add(data) do
    db_roles = Bot.Config.DB.get!()
    guild_id = data[:guild_id]
    guild_roles = Nostrum.Api.get_guild_roles!(guild_id)

    matches_from_db =
      Enum.filter(db_roles, fn row ->
        Enum.at(row, 0) == data[:channel_id] &&
          Enum.at(row, 1) == data[:message_id] &&
          Enum.at(row, 2) == data[:emoji][:name]
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
          Logger.debug("Adding role #{db_entry_name} to #{data[:member][:user][:username]}")

          {:ok} =
            Nostrum.Api.add_guild_member_role(
              guild_id,
              data[:member][:user][:id],
              guild_role.id
            )
      end
    end)
  end

  def reaction_remove(data) do
    Logger.debug("reaction_remove: #{inspect(data)}")

    db_roles = Bot.Config.DB.get!()
    guild_id = data[:guild_id]
    guild_roles = Nostrum.Api.get_guild_roles!(guild_id)

    # ...
  end
end
