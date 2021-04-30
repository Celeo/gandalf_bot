defmodule Bot.Config.File.Schedule do
  defstruct [:channel_id, :message, :cron]
end

defmodule Bot.Config.File do
  defstruct [
    :containment_role_id,
    :valheim_role_id,
    :containment_response_gif,
    :blessable_user_ids,
    :scheduled
  ]

  def file_name!() do
    Application.fetch_env!(:gandalf_discord_bot, :config_file_name)
  end

  def read_from_disk!() do
    content = File.read!(file_name!())
    Poison.decode!(content, as: %Bot.Config.File{scheduled: [%Bot.Config.File.Schedule{}]})
  end
end

defmodule Bot.Config.DB do
  @sql_create_table """
    CREATE TABLE IF NOT EXISTS role_config (
      channel_id INTEGER,
      message_id INTEGER,
      emoji_name TEXT,
      role_name TEXT
    )
  """
  @sql_query_all """
    SELECT * FROM role_config
  """
  @sql_insert """
    INSERT INTO role_config VALUES (?1, ?2, ?3, ?4)
  """

  def file_name!() do
    Application.fetch_env!(:gandalf_discord_bot, :db_file_name)
  end

  defp connect!() do
    case Exqlite.Sqlite3.open(file_name!()) do
      {:ok, conn} -> conn
      {:error, reason} -> throw(reason)
    end
  end

  def create_table!() do
    conn = connect!()
    Exqlite.Sqlite3.execute(conn, @sql_create_table)
    Exqlite.Sqlite3.close(conn)
  end

  def get!() do
    conn = connect!()
    {:ok, statement} = Exqlite.Sqlite3.prepare(conn, @sql_query_all)
    {:ok, rows} = Exqlite.Sqlite3.fetch_all(conn, statement)
    Exqlite.Sqlite3.close(conn)
    rows
  end

  # Dialyzer thinks that the third argument in `Exqlite.Sqlite3.bind` can only be `nil | []`
  # but that's because the spec is wrong. The code here works, and is exercised in a unit test.
  def insert!(channel_id, message_id, emoji_name, role_name) do
    conn = connect!()
    {:ok, statement} = Exqlite.Sqlite3.prepare(conn, @sql_insert)
    :ok = Exqlite.Sqlite3.bind(conn, statement, [channel_id, message_id, emoji_name, role_name])
    :done = Exqlite.Sqlite3.step(conn, statement)
    :ok = Exqlite.Sqlite3.close(conn)
  end
end