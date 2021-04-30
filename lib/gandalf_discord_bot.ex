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
  # alias Nostrum.Api

  def start_link do
    Logger.info("Starting consumer")
    Consumer.start_link(__MODULE__)
  end

  # def handle_event({:MESSAGE_CREATE, msg, _ws_state}) do
  #   # ...
  # end

  def handle_event(_event), do: :noop
end
