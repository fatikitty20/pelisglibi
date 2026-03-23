export class ProblemDetailsError extends Error {

 /**
  * Detalle de los errores devueltos por un servicio.
  * Crea una instancia de ProblemDetailsError.
  * @param {object} problemDetails Objeto con la descripcipon del error.
  */
 constructor(problemDetails) {

  super(typeof problemDetails["detail"] === "string"
   ? problemDetails["detail"]
   : (typeof problemDetails["title"] === "string"
    ? problemDetails["title"]
    : "Error"))

  this.problemDetails = problemDetails

 }

}