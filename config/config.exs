# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :blackjack,
  ecto_repos: [Blackjack.Repo]

# Configures the endpoint
config :blackjack, BlackjackWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "cOQRKb6qzgPCQ6ATuh10KHkjA+IlR6xkaM9lvPYiKO/4pQP+7FbC559A+r5mhM4f",
  render_errors: [view: BlackjackWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Blackjack.PubSub,
  live_view: [signing_salt: "gN8koqFO"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
