defmodule Bot.Rng do
  use GenServer
  require Logger

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  @impl true
  def init(_) do
    {:ok, {[], fn -> Enum.random(1..10) end}}
  end

  @impl true
  def handle_call(:get, _from, {numbers, rng_fn}) do
    [retval, numbers] =
      cond do
        length(numbers) > 0 ->
          [head | tail] = numbers

          Logger.debug(
            "Returning static value #{head} from RNG; #{length(tail)} static number(s) remaining"
          )

          [head, tail]

        true ->
          [rng_fn.(), []]
      end

    {:reply, retval, {numbers, rng_fn}}
  end

  @impl true
  def handle_call({:store, number}, _from, {numbers, rng_fn}) do
    {:reply, :ok, {numbers ++ [number], rng_fn}}
  end

  @impl true
  def handle_call(:clear_stored, _from, {_, rng_fn}) do
    {:reply, :ok, {[], rng_fn}}
  end

  def get_number() do
    GenServer.call(__MODULE__, :get)
  end

  def enqueue_static(number) when is_number(number) do
    GenServer.call(__MODULE__, {:store, number})
  end

  def enqueue_static(numbers) when is_list(numbers) do
    Enum.each(numbers, &GenServer.call(__MODULE__, {:store, &1}))
  end

  def clear_stored_numbers() do
    GenServer.call(__MODULE__, :clear_stored)
  end
end
