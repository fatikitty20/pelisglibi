<?php

/**
 * Devuelve el texto de un parámetro enviado al
 * servidor por medio de GET, POST o cookie.
 * 
 * Si el parámetro no se recibe, devuelve false.
 */
function recibeTexto(string $parametro): false|string
{
 /* Si el parámetro está asignado en $_REQUEST,
  * devuelve su valor; de lo contrario, devuelve false.
  */
 $valor = isset($_REQUEST[$parametro])
  ? $_REQUEST[$parametro]
  : false;
 return $valor;
}
