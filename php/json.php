<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/devuelveJson.php";
require_once __DIR__ . "/lib/ProblemDetailsException.php";
require_once __DIR__ . "/lib/BAD_REQUEST.php";
require_once __DIR__ . "/Bd.php";

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
 throw new ProblemDetailsException([
  "status" => BAD_REQUEST,
  "title" => "JSON inválido",
  "detail" => "El cuerpo no es un JSON válido.",
  "type" => "/errors/faltavalor.html",
 ]);
}

$nombre = isset($data["nombre"]) ? trim((string) $data["nombre"]) : "";

if ($nombre === "") {
 throw new ProblemDetailsException([
  "status" => BAD_REQUEST,
  "title" => "Falta el valor nombre.",
  "detail" => "La solicitud no tiene el valor de nombre.",
  "type" => "/errors/faltavalor.html",
 ]);
}

$comentario = isset($data["comentario"]) ? trim((string) $data["comentario"]) : "";

if ($comentario === "") {
 throw new ProblemDetailsException([
  "status" => BAD_REQUEST,
  "title" => "Falta el comentario.",
  "detail" => "Envía un comentario no vacío.",
  "type" => "/errors/campoenblanco.html",
 ]);
}

$edad = $data["edad"] ?? null;
if (!is_numeric($edad)) {
 throw new ProblemDetailsException([
  "status" => BAD_REQUEST,
  "title" => "Edad inválida.",
  "detail" => "La edad debe ser un número entero.",
  "type" => "/errors/faltavalor.html",
 ]);
}

$edadInt = (int) $edad;
if ($edadInt < 1 || $edadInt > 120) {
 throw new ProblemDetailsException([
  "status" => BAD_REQUEST,
  "title" => "Edad fuera de rango.",
  "detail" => "La edad debe estar entre 1 y 120.",
  "type" => "/errors/faltavalor.html",
 ]);
}

$bd = Bd::pdo();
$stmt = $bd->prepare(
 "INSERT INTO SALUDO (SAL_NOMBRE, SAL_EDAD, SAL_COMENTARIO)
  VALUES (:nombre, :edad, :comentario)"
);
$stmt->execute([
 ":nombre" => $nombre,
 ":edad" => $edadInt,
 ":comentario" => $comentario,
]);
$salId = $bd->lastInsertId();

$mensaje = "¡Hola $nombre! Tienes $edadInt años. Comentario: $comentario";

devuelveJson([
 "mensaje" => $mensaje,
 "nombre" => $nombre,
 "comentario" => $comentario,
 "edad" => $edadInt,
 "id" => (int) $salId,
]);
