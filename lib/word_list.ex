defmodule Bot.MessageCheck.Words do
  use GenServer
  require Logger

  @words_file_name "words.txt"

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def load_words!() do
    File.read!(Application.app_dir(:gandalf_discord_bot, "priv/#{@words_file_name}"))
    |> String.split("\n")
  end

  @impl GenServer
  def init(_) do
    Logger.debug("Loading word list into memory")

    {:ok, load_words!()}
  end

  @impl GenServer
  def handle_call({:check, key}, _, words) do
    member = Enum.member?(words, key)
    {:reply, member, words}
  end

  def check_word(word) do
    GenServer.call(__MODULE__, {:check, word})
  end
end
