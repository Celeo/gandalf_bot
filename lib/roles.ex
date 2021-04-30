defmodule Bot.Roles do
  require Logger

  # %{channel_id: 758513911833427971, emoji: %{id: nil, name: "👋"}, guild_id: 758513911833427968,
  # member: %{deaf: false, hoisted_role: nil, joined_at: "2020-09-24T02:23:29.090000+00:00", mute: false,
  # roles: [758528744406122526, 814995473331912756], user: %{avatar: "3118c26ea7e40350212196e1d9d7f5c9", discriminator: "1453", id: 110245175636312064, username: "Celeo"}},
  # message_id: 837806766200586301, user_id: 110245175636312064}
  def reaction_add(data) do
    Logger.debug("reaction_add: #{inspect(data)}")
    # TODO
  end

  # %{channel_id: 758513911833427971, emoji: %{id: nil, name: "👋"}, guild_id: 758513911833427968, message_id: 837806766200586301, user_id: 110245175636312064}
  def reaction_remove(data) do
    Logger.debug("reaction_remove: #{inspect(data)}")
    # TODO
  end
end
