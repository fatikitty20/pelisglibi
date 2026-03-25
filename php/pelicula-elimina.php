<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/recibeEnteroObligatorio.php";
require_once __DIR__ . "/lib/devuelveNoContent.php";
require_once __DIR__ . "/lib/favorito-en-saludo.php";
require_once __DIR__ . "/Bd.php";

$id = recibeEnteroObligatorio("id");

$bd = Bd::pdo();
$stmt = $bd->prepare(
 "DELETE FROM SALUDO WHERE SAL_ID = :SAL_ID AND SAL_COMENTARIO = :marca"
);
$stmt->execute([
 ":SAL_ID" => $id,
 ":marca" => SALUDO_MARCA_FAVORITO,
]);

devuelveNoContent();
