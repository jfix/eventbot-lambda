export async function handler() {
  return {
    statusCode: 404,
    headers: { "Content-Type": "text/plain" },
    body: `Nothing to see here, move along, thanks.`
  };
}
