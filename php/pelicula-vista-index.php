<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/devuelveJson.php";
require_once __DIR__ . "/Bd.php";

$bd = Bd::pdo();
$stmt = $bd->query(
 "SELECT PAS_ID, PAS_NOMBRE FROM PASATIEMPO ORDER BY PAS_NOMBRE"
);
$lista = $stmt->fetchAll(PDO::FETCH_ASSOC);

$render = "";
foreach ($lista as $modelo) {
 $encodeId = urlencode($modelo["PAS_ID"]);
 $id = htmlentities($encodeId);
 $nombre = htmlentities($modelo["PAS_NOMBRE"]);
 $render .=
  "<li>
     <p>
     <a href='pelis-agregadas.html?id=$id'>$nombre</a>
     </p>
    </li>";
}

devuelveJson(["lista" => ["innerHTML" => $render]]);
