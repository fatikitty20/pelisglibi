<?php

require_once __DIR__ . "/INTERNAL_SERVER_ERROR.php";

/**
 * Detalle de los errores devueltos por un servicio.
 */
class ProblemDetailsException extends Exception
{

 public array $problemDetails;

 public function __construct(
  array $problemDetails,
 ) {
  
  parent::__construct(
   isset($problemDetails["detail"])
    ? $problemDetails["detail"]
    : (isset($problemDetails["title"])
     ? $problemDetails["title"]
     : "Error"),
   $problemDetails["status"]
    ? $problemDetails["status"]
    : INTERNAL_SERVER_ERROR
  );

  $this->problemDetails = $problemDetails;
 }
}
