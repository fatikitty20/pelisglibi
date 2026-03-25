<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/devuelveJson.php";
require_once __DIR__ . "/lib/favorito-en-saludo.php";
require_once __DIR__ . "/Bd.php";

$bd = Bd::pdo();
$stmt = $bd->prepare(
 "SELECT SAL_ID, SAL_NOMBRE FROM SALUDO WHERE SAL_COMENTARIO = :marca ORDER BY SAL_NOMBRE"
);
$stmt->execute([":marca" => SALUDO_MARCA_FAVORITO]);
$lista = $stmt->fetchAll(PDO::FETCH_ASSOC);

$render = "";
foreach ($lista as $modelo) {
 $encodeId = urlencode($modelo["SAL_ID"]);
 $id = htmlentities($encodeId);
 $nombre = htmlentities($modelo["SAL_NOMBRE"]);
 $render .=
  "<li>
     <p>
     <a href='pelis-agregadas.html?id=$id'>$nombre</a>
     </p>
    </li>";
}

devuelveJson(["lista" => ["innerHTML" => $render]]);
