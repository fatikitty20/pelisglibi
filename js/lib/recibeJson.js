
/**
 * @param {string} url
 * @param { "GET" | "POST"| "PUT" | "PATCH" | "DELETE" | "TRACE" | "OPTIONS"
 *  | "CONNECT" | "HEAD" } metodoHttp
 */
export async function recibeJson(url, metodoHttp = "GET") {
 return fetch(
  url,
  {
   method: metodoHttp,
   headers: { "Accept": "application/json, application/problem+json" }
  }
 )
}