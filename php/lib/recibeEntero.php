<?php

require_once __DIR__ . "/recibeTexto.php";

/**
 * Devuelve el valor entero de un parámetro recibido en el
 * servidor por medio de GET, POST o cookie.
 * 
 * Si el parámetro no se recibe, devuelve false
 *
 * Si se recibe una cadena vacía, se devuelve null.
 * 
 * Si parámetro no se puede convertir a entero, se genera
 * un error.
 */
function recibeEntero(string $parametro): false|null|int
{
 $valor = recibeTexto($parametro);
 if ($valor === false) {
  return false;
 } else {
  $valor = trim($valor);
  if ($valor === "") {
   return null;
  } else {
   return (int) $valor;
  }
 }
}
