<?php

require_once __DIR__ . "/lib/recibeTexto.php";
require_once __DIR__ . "/lib/devuelveJson.php";

$saludo = recibeTexto("saludo");
$nombre = recibeTexto("nombre");
$resultado = "{$saludo} {$nombre}.";
devuelveJson($resultado);
