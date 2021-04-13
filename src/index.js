export async function handler() {
  return {
    statusCode: 404,
    headers: { "Content-Type": "text/plain" },
    body: `Really nothing to see here, move along, thanks.`
  };
}
