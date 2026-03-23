<?php

require_once __DIR__ . "/INTERNAL_SERVER_ERROR.php";
require_once __DIR__ . "/ProblemDetailsException.php";

// Hace que se lance una excepción automáticamente cuando se genere un error.
set_error_handler(function ($severity, $message, $file, $line) {
 throw new ErrorException($message, 0, $severity, $file, $line);
});

// Código cuando una excepción no es atrapada.
set_exception_handler(function (Throwable $excepcion) {
 if ($excepcion instanceof ProblemDetailsException) {
  devuelveProblemDetails($excepcion->problemDetails);
 } else {
  devuelveProblemDetails([
   "status" => INTERNAL_SERVER_ERROR,
   "title" => "Error interno del servidor",
   "detail" => $excepcion->getMessage(),
   "type" => "/errors/errorinterno.html",
  ]);
 }
 exit();
});

function devuelveProblemDetails(array $array)
{
 $json = json_encode($array);
 if ($json === false) {
  devuelveResultadoNoJson();
 } else {
  http_response_code(isset($array["status"]) ? $array["status"] : 500);
  header("Content-Type: application/problem+json; charset=utf-8");
  echo $json;
 }
}
