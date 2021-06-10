defmodule Bot.Config.File.Test do
  use ExUnit.Case

  @sample_config """
  {
    "containment_role_id": 1,
    "gamemaster_role_id": 2,
    "containment_response_gif": "a",
    "blessable_user_ids": [3],
    "listenable_user_ids": [5],
    "scheduled": [
      {
        "channel_id": 4,
        "message": "Let's go",
        "cron": "1 2 3 4 5"
      }
    ]
  }
  """

  setup do
    File.rm(Bot.Config.File.file_name!())
    :ok
  end

  setup_all do
    on_exit(fn -> File.rm(Bot.Config.File.file_name!()) end)
    :ok
  end

  test "can read the config file" do
    file_name = Bot.Config.File.file_name!()
    File.write!(file_name, @sample_config)
    c = Bot.Config.File.read_from_disk!()

    assert c.containment_role_id == 1
    assert c.gamemaster_role_id == 2
    assert c.containment_response_gif == "a"
    assert c.blessable_user_ids == [3]
    assert c.listenable_user_ids == [5]
    assert length(c.scheduled) == 1

    File.rm!(file_name)
  end
end

defmodule Bot.Config.DB.Test do
  use ExUnit.Case

  setup do
    File.rm(Bot.Config.DB.file_name!())
    :ok
  end

  setup_all do
    on_exit(fn -> File.rm(Bot.Config.DB.file_name!()) end)
    :ok
  end

  test "can create a table" do
    Bot.Config.DB.create_tables!()
    assert File.exists?(Bot.Config.DB.file_name!())
  end

  test "empty db returns no data" do
    Bot.Config.DB.create_tables!()
    rows = Bot.Config.DB.get!()
    assert length(rows) == 0
  end

  test "can store and retrieve data" do
    Bot.Config.DB.create_tables!()
    Bot.Config.DB.insert!(2, 3, "a", "b")
    rows = Bot.Config.DB.get!()
    assert length(rows) == 1
    assert rows == [[1, 2, 3, "a", "b"]]
  end
end
