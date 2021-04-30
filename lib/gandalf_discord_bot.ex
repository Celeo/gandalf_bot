defmodule Bot.Application do
  use Application
  require Logger

  @impl true
  def start(_, _) do
    Logger.info("Starting application")
    Supervisor.start_link([Bot.Supervisor], strategy: :one_for_one)
  end
end

defmodule Bot.Supervisor do
  use Supervisor
  require Logger

  def start_link(args \\ []) do
    Logger.info("Starting supervisor")
    Supervisor.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def init(_) do
    Supervisor.init([Bot.Consumer, Bot.MessageCheck.Words], strategy: :one_for_one)
  end
end

defmodule Bot.Consumer do
  use Nostrum.Consumer
  require Logger

  def start_link do
    Logger.info("Starting consumer")
    Consumer.start_link(__MODULE__)
  end

  defp bless_you!(msg) do
    config = Bot.Config.File.read_from_disk!()

    if Enum.member?(config.blessable_user_ids, msg.author.id) do
      if Bot.MessageCheck.is_incoherent!(msg.content) do
        Nostrum.Api.create_reaction!(msg.channel_id, msg.id, %Nostrum.Struct.Emoji{name: "🤧"})
      end
    end
  end

  def handle_event({:MESSAGE_CREATE, msg, _ws_state}) do
    bless_you!(msg)
    Bot.Commands.run!(msg)
  end

  def handle_event({:MESSAGE_REACTION_ADD, data, _ws_state}) do
    Logger.debug(inspect({:MESSAGE_REACTION_ADD, data}))

    # %{channel_id: 758513911833427971, emoji: %{id: nil, name: "👋"}, guild_id: 758513911833427968,
    # member: %{deaf: false, hoisted_role: nil, joined_at: "2020-09-24T02:23:29.090000+00:00", mute: false,
    # roles: [758528744406122526, 814995473331912756], user: %{avatar: "3118c26ea7e40350212196e1d9d7f5c9", discriminator: "1453", id: 110245175636312064, username: "Celeo"}},
    # message_id: 837806766200586301, user_id: 110245175636312064}

    # TODO ...
  end

  def handle_event({:MESSAGE_REACTION_REMOVE, data, _ws_state}) do
    Logger.debug(inspect({:MESSAGE_REACTION_REMOVE, data}))

    # %{channel_id: 758513911833427971, emoji: %{id: nil, name: "👋"}, guild_id: 758513911833427968, message_id: 837806766200586301, user_id: 110245175636312064}

    # TODO ...
  end

  def handle_event(_event), do: :noop
end
