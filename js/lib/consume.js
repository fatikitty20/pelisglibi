import { ProblemDetailsError } from "./ProblemDetailsError.js"

/**
 * Espera a que la promesa de un fetch termine. Si
 * hay error, lanza una excepción.
 * 
 * @param {Promise<Response> } servicio
 */
export async function consume(servicio) {
 const respuesta = await servicio
 if (respuesta.ok) {
  return respuesta
 } else {
  const contentType = respuesta.headers.get("Content-Type")
  if (
   contentType !== null && contentType.startsWith("application/problem+json")
  )
   throw new ProblemDetailsError(await respuesta.json())
  else
   throw new Error(respuesta.statusText)
 }
}