defmodule BlackjackWeb.PageController do
  use BlackjackWeb, :controller

  def index(conn, _params) do
    html(conn, File.read!("./priv/static/index.html"))
  end
end
