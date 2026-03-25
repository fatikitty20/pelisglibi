import { consume } from "./lib/consume.js";
import { recibeJson } from "./lib/recibeJson.js";
import { enviaFormRecibeJson } from "./lib/enviaFormRecibeJson.js";
import { enviaJsonRecibeJson } from "./enviaJsonRecibeJson.js";
import { ProblemDetailsError } from "./lib/ProblemDetailsError.js";
import { muestraError } from "./lib/muestraError.js";
import { cargarPreviewFavoritos, inicializarFavoritos } from "./favoritos.js";

const API_URL = "https://ghibliapi.vercel.app/films";
const URL_AGREGA = "php/pelicula-agrega.php";
const URL_JSON_SALUDO = "php/json.php";
const LS_NOMBRE_USUARIO = "usuarioSaludoNombre";

/**
 * Manejo de errores: Problem Details del servidor y fallback amigable.
 * @param {unknown} e
 */
function manejaErrores(e) {
  if (e instanceof ProblemDetailsError) {
    const pd = e.problemDetails;
    const tipo = typeof pd?.type === "string" ? pd.type : "";
    if (tipo.startsWith("/errors/")) {
      window.location.assign(tipo);
      return;
    }
    muestraError(e);
    return;
  }
  muestraError(/** @type {Error|null} */ (e instanceof Error ? e : new Error(String(e))));
}

function el(id) {
  return document.getElementById(id);
}

/** Solo en pelis-agregadas debe mostrarse el botón (no confiar solo en el argumento). */
function esPaginaAgregadas() {
  return document.body.getAttribute("data-pagina") === "agregadas";
}

/**
 * @param {Record<string, unknown>|null|undefined} p
 */
function urlImagenPelicula(p) {
  const a = p?.image;
  const b = p?.movie_banner;
  const s =
    typeof a === "string"
      ? a.trim()
      : typeof b === "string"
        ? b.trim()
        : "";
  return s;
}

async function cargarCatalogo() {
  const catalogo = el("catalogo");
  if (!catalogo) return;

  const mostrarBotonFavorito = esPaginaAgregadas();

  const resp = await consume(recibeJson(API_URL));
  const peliculas = await resp.json();
  catalogo.textContent = "";

  if (!Array.isArray(peliculas) || peliculas.length === 0) {
    catalogo.textContent = "No hay películas para mostrar.";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "wow-grid";

  for (const p of peliculas) {
    const id = String(p?.id ?? "");
    const title = typeof p?.title === "string" ? p.title : "Sin título";
    const director = typeof p?.director === "string" ? p.director : "—";
    const year = typeof p?.release_date === "string" ? p.release_date : "—";
    const desc =
      typeof p?.description === "string"
        ? p.description.length > 180
          ? p.description.slice(0, 179) + "…"
          : p.description
        : "";

    const imgSrc = urlImagenPelicula(p);

    const card = document.createElement("article");
    card.className = "wow-card wow-card-body";

    const fig = document.createElement("figure");
    fig.className = "wow-fig";
    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = `Poster: ${title}`;
    img.className = "wow-img";
    img.referrerPolicy = "no-referrer";
    if (imgSrc) {
      img.src = imgSrc;
    } else {
      img.removeAttribute("src");
      img.alt = "Sin imagen";
      fig.classList.add("wow-fig-empty");
    }
    fig.append(img);
    card.append(fig);

    const h3 = document.createElement("h3");
    h3.className = "wow-card-title";
    h3.textContent = title;

    const meta = document.createElement("p");
    meta.className = "wow-meta";
    meta.textContent = `${director} · ${year}`;

    const pDesc = document.createElement("p");
    pDesc.className = "wow-desc";
    pDesc.textContent = desc;

    if (mostrarBotonFavorito) {
      const acc = document.createElement("div");
      acc.className = "wow-actions";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "wow-btn wow-btn-primary";
      btn.textContent = "Agregar a Favoritos";
      btn.addEventListener("click", async () => {
        try {
          const form = document.createElement("form");
          form.method = "post";
          const inpId = document.createElement("input");
          inpId.name = "id";
          inpId.value = id;
          const inpNombre = document.createElement("input");
          inpNombre.name = "nombre";
          inpNombre.value = `${title} – ${director} (${year})`;
          form.append(inpId, inpNombre);
          await consume(enviaFormRecibeJson(URL_AGREGA, form));
          alert("Película agregada a favoritos.");
          await inicializarFavoritos();
        } catch (err) {
          manejaErrores(err);
        }
      });

      acc.append(btn);
      card.append(h3, meta, pDesc, acc);
    } else {
      card.append(h3, meta, pDesc);
    }

    grid.append(card);
  }

  catalogo.append(grid);
}

function pintarSaludoHeader() {
  const saludo = el("saludoUsuario");
  if (!saludo) return;
  const nombre = (localStorage.getItem(LS_NOMBRE_USUARIO) || "").trim();
  saludo.textContent = nombre ? `¡Hola, ${nombre}!` : "";
}

function prepararSaludo() {
  const formSaludo = /** @type {HTMLFormElement|null} */ (el("form-saludo"));
  const spanRespuesta = el("respuesta");
  if (!formSaludo || !spanRespuesta) return;

  formSaludo.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    try {
      const fd = new FormData(formSaludo);
      const nombre = String(fd.get("nombre") || "").trim();
      const comentario = String(fd.get("comentario") || "").trim();
      const edadRaw = String(fd.get("edad") || "").trim();
      const edad = edadRaw === "" ? NaN : Number.parseInt(edadRaw, 10);
      if (!Number.isFinite(edad) || edad < 1 || edad > 120) {
        manejaErrores(new Error("Indica una edad entre 1 y 120."));
        return;
      }
      const cuerpo = { nombre, comentario, edad };
      const resp = await consume(enviaJsonRecibeJson(URL_JSON_SALUDO, cuerpo));
      const json = await resp.json();
      let msg =
        typeof json?.mensaje === "string" ? json.mensaje : `¡Hola ${json?.nombre ?? nombre}!`;
      if (typeof json?.id === "number") {
        msg += ` (guardado en BD #${json.id})`;
      }
      spanRespuesta.textContent = msg;
      localStorage.setItem(LS_NOMBRE_USUARIO, nombre);
      pintarSaludoHeader();
      await cargarPreviewFavoritos();
    } catch (err) {
      manejaErrores(err);
    }
  });
}

async function main() {
  const pagina =
    document.body.getAttribute("data-pagina") === "agregadas" ? "agregadas" : "inicio";

  if (pagina === "inicio") {
    prepararSaludo();
    try {
      await cargarPreviewFavoritos();
      await cargarCatalogo();
    } catch (e) {
      manejaErrores(e);
    }
    return;
  }

  pintarSaludoHeader();
  window.addEventListener("pageshow", () => pintarSaludoHeader());

  try {
    await cargarCatalogo();
    await inicializarFavoritos();
  } catch (e) {
    manejaErrores(e);
  }
}

main();
