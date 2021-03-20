defmodule Config.File.Schedule do
  defstruct [:channel_id, :message, :cron]
end

defmodule Config.File do
  defstruct [
    :containment_role_id,
    :valheim_role_id,
    :containment_response_gif,
    :blessable_user_ids,
    :scheduled
  ]

  def read_from_disk! do
    content = File.read!("config.json")
    Poison.decode!(content, as: %Config.File{scheduled: [%Config.File.Schedule{}]})
  end
end

defmodule Config.DB do
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

  defp connect! do
    case Exqlite.Sqlite3.open("roles.db") do
      {:ok, conn} -> conn
      {:error, reason} -> throw(reason)
    end
  end

  def create_table! do
    conn = connect!()
    Exqlite.Sqlite3.execute(conn, @sql_create_table)
    Exqlite.Sqlite3.close(conn)
  end

  def get! do
    conn = connect!()
    {:ok, statement} = Exqlite.Sqlite3.prepare(conn, @sql_query_all)
    {:ok, rows} = Exqlite.Sqlite3.fetch_all(conn, statement)
    Exqlite.Sqlite3.close(conn)
    rows
  end

  def insert!(channel_id, message_id, emoji_name, role_name) do
    conn = connect!()
    {:ok, statement} = Exqlite.Sqlite3.prepare(conn, @sql_insert)
    :ok = Exqlite.Sqlite3.bind(conn, statement, [channel_id, message_id, emoji_name, role_name])
    :done = Exqlite.Sqlite3.step(conn, statement)
    Exqlite.Sqlite3.close(conn)
  end
end
