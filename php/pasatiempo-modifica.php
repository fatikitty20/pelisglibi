<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/recibeEnteroObligatorio.php";
require_once __DIR__ . "/lib/recibeTextoObligatorio.php";
require_once __DIR__ . "/lib/devuelveJson.php";
require_once __DIR__ . "/Bd.php";

$id = recibeEnteroObligatorio("id");
$nombre = recibeTextoObligatorio("nombre");

$bd = Bd::pdo();
$stmt = $bd->prepare(
 "UPDATE PASATIEMPO
   SET
    PAS_NOMBRE = :PAS_NOMBRE
   WHERE
    PAS_ID = :PAS_ID"
);
$stmt->execute([
 ":PAS_NOMBRE" => $nombre,
 ":PAS_ID" => $id,
]);

devuelveJson([
 "id" => ["value" => $id],
 "nombre" => ["value" => $nombre],
]);
