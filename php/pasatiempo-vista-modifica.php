<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/recibeEnteroObligatorio.php";
require_once __DIR__ . "/lib/validaEntidadObligatoria.php";
require_once __DIR__ . "/lib/devuelveJson.php";
require_once __DIR__ . "/Bd.php";

$id = recibeEnteroObligatorio("id");

$bd = Bd::pdo();
$stmt = $bd->prepare("SELECT * FROM PASATIEMPO WHERE PAS_ID = :PAS_ID");
$stmt->execute([":PAS_ID" => $id]);
$modelo = $stmt->fetch(PDO::FETCH_ASSOC);

$modelo = validaEntidadObligatoria("Pasatiempo",  $modelo);

devuelveJson([
 "id" => ["value" => $id],
 "nombre" => ["value" => $modelo["PAS_NOMBRE"]],
]);
