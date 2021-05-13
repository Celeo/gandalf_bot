defmodule Bot.Scheduled do
  use Task
  require Logger

  def start_link(args) do
    Task.start_link(__MODULE__, :run, args)
  end

  def run() do
    try do
      config = Bot.Config.File.read_from_disk!()

      Enum.each(config.scheduled, fn event ->
        {:ok, cr} = Crontab.CronExpression.Parser.parse(event.cron)

        if Crontab.DateChecker.matches_date?(cr, NaiveDateTime.utc_now()) do
          Logger.info("Sending scheduled message to channel #{event.channel_id}")
          Nostrum.Api.create_message!(event.channel_id, event.message)
        end
      end)
    rescue
      File.Error -> Logger.warning("Could not load config")
    end

    # 1 minute sleep
    Process.sleep(60_000)
    run()
  end
end
