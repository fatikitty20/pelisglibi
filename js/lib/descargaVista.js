import { consume } from "./consume.js"
import { muestraObjeto } from "./muestraObjeto.js"
import { recibeJson } from "./recibeJson.js"

/**
 * @param {string} url
 * @param { "GET" | "POST"| "PUT" | "PATCH" | "DELETE" | "TRACE" | "OPTIONS"
 *  | "CONNECT" | "HEAD" } metodoHttp
 */
export async function descargaVista(url, metodoHttp = "GET") {
 const respuesta = await consume(recibeJson(url, metodoHttp))
 const json = await respuesta.json()
 muestraObjeto(document, json)
 return json
}