<?php
require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/devuelveJson.php";
require_once __DIR__ . "/lib/recibeTextoObligatorio.php";

$usuario = recibeTextoObligatorio("usuario");

devuelveJson([
  "usuario" => $usuario,
  "mensaje" => "¡Hola $usuario!",
]);