<?php

require_once __DIR__ . "/lib/favorito-en-saludo.php";

class Bd
{
 private static ?PDO $pdo = null;

 static function pdo(): PDO
 {
  if (self::$pdo === null) {

   self::$pdo = new PDO(
    // cadena de conexión
    "sqlite:" . __DIR__ . "/srvbd.db",
    // usuario
    null,
    // contraseña
    null,
    // Opciones: pdos no persistentes y lanza excepciones.
    [PDO::ATTR_PERSISTENT => false, PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
   );

   self::$pdo->exec(
    "CREATE TABLE IF NOT EXISTS SALUDO (
      SAL_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      SAL_NOMBRE TEXT NOT NULL,
      SAL_EDAD INTEGER NOT NULL,
      SAL_COMENTARIO TEXT NOT NULL,
      SAL_FECHA TEXT NOT NULL DEFAULT (datetime('now')),
      CONSTRAINT SAL_EDAD_RANGO CHECK(SAL_EDAD >= 1 AND SAL_EDAD <= 120),
      CONSTRAINT SAL_NOM_NV CHECK(LENGTH(TRIM(SAL_NOMBRE)) > 0),
      CONSTRAINT SAL_COM_NV CHECK(LENGTH(TRIM(SAL_COMENTARIO)) > 0)
     )"
   );

   $marca = self::$pdo->quote(SALUDO_MARCA_FAVORITO);
   self::$pdo->exec(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_saludo_favorito_nombre ON SALUDO(SAL_NOMBRE) WHERE SAL_COMENTARIO = $marca"
   );
  }

  return self::$pdo;
 }
}
