const server = Deno.listen({ hostname: "127.0.0.1", port: 8000 });
for await (const conn of server) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const body = `Your user-agent is:\n\n${
      requestEvent.request.headers.get("user-agent") ?? "Unknown"
    }`;
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
      }),
    );
  }
}
