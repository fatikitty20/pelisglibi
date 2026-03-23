<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/devuelveJson.php";

$lista = [
 [
  "nombre" => "pp",
  "color" => "azul"
 ],
 [
  "nombre" => "qk",
  "color" => "rojo"
 ],
 [
  "nombre" => "tt",
  "color" => "rosa"
 ],
 [
  "nombre" => "bb",
  "color" => "azul"
 ]
];

// Genera el código HTML de la lista.
$render = "";
foreach ($lista as $modelo) {
 /* Codifica nombre y color para que cambie los caracteres
   * especiales y el texto no se pueda interpretar como HTML.
   * Esta técnica evita la inyección de código. */
 $nombre = htmlentities($modelo["nombre"]);
 $color = htmlentities($modelo["color"]);
 $render .=
  "<dt>{$nombre}</dt>
    <dd>{$color}</dd>";
}

devuelveJson(["lista" => ["innerHTML" => $render]]);
