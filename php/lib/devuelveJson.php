<?php

require_once __DIR__ . "/devuelveResultadoNoJson.php";

function devuelveJson($resultado)
{
 $json = json_encode($resultado);
 if ($json === false) {
  devuelveResultadoNoJson();
 } else {
  header("Content-Type: application/json; charset=utf-8");
  echo $json;
 }
 exit();
}
