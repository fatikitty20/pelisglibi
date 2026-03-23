/**
 * Envía los datos de un formolario a la url usando la codificación
 * multipart/form-data.
 * @param {string} url
 * @param {HTMLFormElement} formulario
 * @param { "GET" | "POST"| "PUT" | "PATCH" | "DELETE" | "TRACE" | "OPTIONS"
 *  | "CONNECT" | "HEAD" } metodoHttp
 */
export function enviaFormRecibeJson(url, formulario, metodoHttp = "POST") {
 return fetch(
  url,
  {
   method: metodoHttp,
   headers: { "Accept": "application/json, application/problem+json" },
   body: new FormData(formulario)
  }
 )
}