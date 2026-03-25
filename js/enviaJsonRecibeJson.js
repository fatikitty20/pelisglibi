/**
 * Envía un objeto JSON a la URL indicada (mismo patrón que las utilidades del profesor).
 * @param {string} url
 * @param {object} cuerpo
 * @param { "GET" | "POST"| "PUT" | "PATCH" | "DELETE" | "TRACE" | "OPTIONS"
 *  | "CONNECT" | "HEAD" } metodoHttp
 */
export function enviaJsonRecibeJson(url, cuerpo, metodoHttp = "POST") {
  return fetch(url, {
    method: metodoHttp,
    headers: {
      Accept: "application/json, application/problem+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cuerpo),
  });
}
