<?php

require_once __DIR__ . "/BAD_REQUEST.php";
require_once __DIR__ . "/recibeEntero.php";
require_once __DIR__ . "/ProblemDetailsException.php";

function recibeEnteroObligatorio(string $parametro)
{
 $entero = recibeEntero($parametro);

 if ($entero === false)
  throw new ProblemDetailsException([
   "status" => BAD_REQUEST,
   "title" => "Falta el valor $parametro.",
   "type" => "/errors/faltavalor.html",
   "detail" => "La solicitud no tiene el valor de $parametro."
  ]);

 if ($entero === null)
  throw new ProblemDetailsException([
   "status" => BAD_REQUEST,
   "title" => "Campo $parametro en blanco.",
   "type" => "/errors/campoenteroenblanco.html",
   "detail" => "Pon un número entero en el campo $parametro."
  ]);

 return $entero;
}
