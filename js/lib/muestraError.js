import { ProblemDetailsError } from "./ProblemDetailsError.js"

/**
 * Muestra los datos de una Error en la consola y en un cuadro de alerta.
 * @param { ProblemDetailsError | Error | null } error descripción del error.
 */
export function muestraError(error) {

 if (error === null) {

  console.error("Error")
  alert("Error")

 } else if (error instanceof ProblemDetailsError) {

  const problemDetails = error.problemDetails

  let mensaje =
   typeof problemDetails["title"] === "string" ? problemDetails["title"] : ""
  if (typeof problemDetails["detail"] === "string") {
   if (mensaje !== "") {
    mensaje += "\n\n"
   }
   mensaje += problemDetails["detail"]
  }
  if (mensaje === "") {
   mensaje = "Error"
  }
  console.error(error, problemDetails)
  alert(mensaje)

 } else {

  console.error(error)
  alert(error.message)

 }

}