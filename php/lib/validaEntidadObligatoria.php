<?php

require_once __DIR__ . "/NOT_FOUND.php";
require_once __DIR__ . "/ProblemDetailsException.php";

function validaEntidadObligatoria(string $nombre,  $entidad)
{

 if ($entidad === false)
  throw new ProblemDetailsException([
  "status" => NOT_FOUND,
  "title" => "Registro de $nombre no encontrado.",
  "type" => "/errors/entidadnoencontrada.html",
  "detail" => "No se encontró ningún registro de $nombre con el id solicitado.",
  ]);

 return $entidad;
}
