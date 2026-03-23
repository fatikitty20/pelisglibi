<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/recibeTextoObligatorio.php";
require_once __DIR__ . "/lib/devuelveCreated.php";
require_once __DIR__ . "/lib/ProblemDetailsException.php";
require_once __DIR__ . "/Bd.php";

$nombre = recibeTextoObligatorio("nombre");

$bd = Bd::pdo();
$stmt = $bd->prepare(
 "INSERT INTO PASATIEMPO (
    PAS_NOMBRE
   ) values (
    :PAS_NOMBRE
   )"
);
try {
 $stmt->execute([
  ":PAS_NOMBRE" => $nombre
 ]);
} catch (PDOException $ex) {
 if (str_contains($ex->getMessage(), 'UNIQUE constraint failed') || $ex->getCode() === '23000') {
  throw new ProblemDetailsException([
   'status' => 409,
   'title' => 'Registro duplicado',
   'detail' => 'Ya existe ese favorito en la base de datos.',
   'type' => '/errors/errorinterno.html',
  ]);
 }
 throw $ex;
}

$id = $bd->lastInsertId();

$encodeId = urlencode($id);
devuelveCreated(
 "/php/pasatiempo-vista-modifica.php?id=$encodeId",
 [
  "id" => ["value" => $id],
  "nombre" => ["value" => $nombre],
 ]
);
