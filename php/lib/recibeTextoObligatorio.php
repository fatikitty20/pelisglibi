<?php

require_once __DIR__ . "/BAD_REQUEST.php";
require_once __DIR__ . "/recibeTexto.php";
require_once __DIR__ . "/ProblemDetailsException.php";

function recibeTextoObligatorio(string $parametro)
{
 $texto = recibeTexto($parametro);

 if ($texto === false)
  throw new ProblemDetailsException([
   "status" => BAD_REQUEST,
   "title" => "Falta el valor $parametro.",
   "type" => "/errors/faltavalor.html",
   "detail" => "La solicitud no tiene el valor de $parametro."
  ]);

 $trimTexto = trim($texto);

 if ($trimTexto === "")
  throw new ProblemDetailsException([
   "status" => BAD_REQUEST,
   "title" => "Campo $parametro en blanco.",
   "type" => "/errors/campoenblanco.html",
   "detail" => "Pon texto en el campo $parametro."
  ]);

 return $trimTexto;
}
