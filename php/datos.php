<?php

require_once __DIR__ . "/lib/manejaErrores.php";
require_once __DIR__ . "/lib/devuelveJson.php";

devuelveJson([
 "nombre" => ["value" => "pp"],
 "apellido" => ["value" => "tkt"],
 "genero" => ["value" => "pop"],
 "generacion" => ["value" => ""],
 "edad" => ["valueAsNumber" => 18],
 "numero" => ["value" => 5],
 "avance" => ["value" => 70],
 "capacidad" => ["value" => 60],
 "temperatura" => ["valueAsNumber" => 40],
 "aprobado" => ["checked" => true],
 "gracioso" => ["value" => false],
 "emplacado" => ["value" => false],
 "direccion" => ["textContent" => "Girasoles 23\ncolonia Rosales"],
 "encabezado" => ["innerHTML" => "<em>Hola, soy <strong>pp</strong>"],
 "nacimiento" => ["value" => "2000-07-04"],
 "imagen1" => [
  "src" => "https://gilpgawoas.github.io/img/icono/maskable_icon_x48.png"
 ],
 "imagen2" => ["src" => "", "hidden" => true],
 "pasatiempos[]" => ["fut", "basket"],
 "madrugador" => ["no"],
 "patos[]" => ["paco", "luis"],
]);
