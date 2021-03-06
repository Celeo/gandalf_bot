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
    children = [
      Bot.Consumer,
      Bot.Util.Words,
      {Bot.Scheduled, []},
      Bot.Util.Rng
    ]

    Supervisor.init(children, strategy: :one_for_one)
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
      if Bot.MessageCheck.Incoherent.is_match!(msg.content) do
        Nostrum.Api.create_reaction!(msg.channel_id, msg.id, Bot.MessageCheck.Incoherent.emoji())
      end
    end
  end

  defp hey_listen!(msg) do
    config = Bot.Config.File.read_from_disk!()

    if Enum.member?(config.listenable_user_ids, msg.author.id) do
      if Bot.MessageCheck.HeyListen.is_match!(msg.content) do
        Nostrum.Api.create_reaction!(msg.channel_id, msg.id, Bot.MessageCheck.HeyListen.emoji())
      end
    end
  end

  defp handle_quotes!(msg) do
    bot_user_id = Nostrum.Cache.Me.get().id

    bot_mention =
      Enum.find(msg.mentions, fn mentioned_user ->
        mentioned_user.id == bot_user_id
      end)

    if bot_mention != nil do
      Nostrum.Api.create_message(msg.channel_id, Bot.Quotes.get_random())
    end
  end

  def handle_event({:MESSAGE_CREATE, msg, _ws_state}) do
    bless_you!(msg)
    hey_listen!(msg)
    handle_quotes!(msg)
    Bot.Commands.run!(msg)
  end

  def handle_event({:MESSAGE_REACTION_ADD, data, _ws_state}) do
    Bot.Roles.reaction_add(data)
  end

  def handle_event({:MESSAGE_REACTION_REMOVE, data, _ws_state}) do
    Bot.Roles.reaction_remove(data)
  end

  def handle_event(_event), do: :noop
end
