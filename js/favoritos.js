import { consume } from "./lib/consume.js";
import { recibeJson } from "./lib/recibeJson.js";
import { enviaFormRecibeJson } from "./lib/enviaFormRecibeJson.js";
import { ProblemDetailsError } from "./lib/ProblemDetailsError.js";
import { muestraError } from "./lib/muestraError.js";

const API_URL = "https://ghibliapi.vercel.app/films";
const URL_VISTA_IDX = "php/pelicula-vista-index.php";
const URL_ELIMINA = "php/pelicula-elimina.php";

/** @type {Map<string, any>} */
const MOVIES_BY_TITLE = new Map();

function el(id) {
  return document.getElementById(id);
}

/**
 * @param {string} t
 */
function normalizaTitulo(t) {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * @param {unknown} v
 */
function toStr(v) {
  return typeof v === "string" ? v : "";
}

/**
 * @param {string} nombre
 */
function splitNombre(nombre) {
  const s = (nombre || "").trim();
  const [tituloParte] = s.split(" – ");
  return { titulo: (tituloParte || "").trim() };
}

/**
 * @param {string} txt
 * @param {number} max
 */
function recorta(txt, max) {
  const s = (txt || "").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/**
 * @param {...string} vals
 */
function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v && v.trim() !== "") return v;
  }
  return "";
}

function badge(text) {
  const s = document.createElement("span");
  s.className = "wow-badge";
  s.textContent = text;
  return s;
}

function dot() {
  const s = document.createElement("span");
  s.className = "wow-dot";
  s.textContent = "•";
  return s;
}

async function cargaPeliculasApi() {
  const resp = await consume(recibeJson(API_URL));
  const peliculas = await resp.json();
  MOVIES_BY_TITLE.clear();
  if (!Array.isArray(peliculas)) return;
  for (const p of peliculas) {
    const key = normalizaTitulo(p?.title);
    if (key) MOVIES_BY_TITLE.set(key, p);
  }
}

/**
 * @param {HTMLElement|null} cont
 * @param {boolean} conEliminar
 */
async function renderFavoritosEnContenedor(cont, conEliminar) {
  if (!cont) return;

  await cargaPeliculasApi();

  const resp = await consume(recibeJson(URL_VISTA_IDX));
  const json = await resp.json();
  const html = json?.lista?.innerHTML;
  const tmp = document.createElement("ul");
  tmp.innerHTML = typeof html === "string" ? html : "";

  /** @type {{ id: string; nombre: string }[]} */
  const items = [];
  for (const li of Array.from(tmp.querySelectorAll("li"))) {
    const a = li.querySelector("a[href*='id=']");
    if (!a) continue;
    const id =
      new URL(a.getAttribute("href") || "", location.href).searchParams.get("id") || "";
    const nombre = (a.textContent || "").trim();
    if (id && nombre) items.push({ id, nombre });
  }

  cont.textContent = "";

  if (!items.length) {
    cont.textContent = "Aún no tienes películas guardadas.";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "wow-grid";

  for (const it of items) {
    const { id, nombre } = it;
    const { titulo } = splitNombre(nombre);
    const movie = MOVIES_BY_TITLE.get(normalizaTitulo(titulo)) || null;

    const imgSrc = movie ? firstNonEmpty(toStr(movie.image), toStr(movie.movie_banner), "") : "";
    const dTitle = movie?.title || titulo || nombre;
    const dDir = movie?.director || "—";
    const dYear = movie?.release_date || "—";
    const dDesc = movie ? recorta(toStr(movie.description), 200) : "";

    const card = document.createElement("article");
    card.className = "wow-card wow-card-body";

    if (imgSrc) {
      const fig = document.createElement("figure");
      fig.className = "wow-fig";
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = imgSrc;
      img.alt = `Poster: ${dTitle}`;
      img.className = "wow-img";
      fig.append(img);
      card.append(fig);
    }

    const h3 = document.createElement("h3");
    h3.className = "wow-card-title";
    h3.textContent = dTitle;

    const meta = document.createElement("p");
    meta.className = "wow-meta";
    meta.append(badge("Director"), " ", dDir, " ", dot(), " ", badge("Año"), " ", dYear);

    const pNom = document.createElement("p");
    pNom.className = "wow-desc";
    pNom.textContent = `Guardado como: ${nombre}`;

    const pDesc = document.createElement("p");
    pDesc.className = "wow-desc";
    pDesc.textContent = dDesc;

    if (conEliminar) {
      const acc = document.createElement("div");
      acc.className = "wow-actions wow-actions-wrap";

      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "wow-btn wow-btn-danger wow-btn-sm";
      btnDel.textContent = "Eliminar";
      btnDel.addEventListener("click", async () => {
        try {
          const form = document.createElement("form");
          form.method = "post";
          const input = document.createElement("input");
          input.name = "id";
          input.value = id;
          form.append(input);
          await consume(enviaFormRecibeJson(URL_ELIMINA, form));
          await inicializarFavoritos();
        } catch (err) {
          if (err instanceof ProblemDetailsError) {
            muestraError(err);
          } else {
            muestraError(err instanceof Error ? err : new Error(String(err)));
          }
        }
      });

      acc.append(btnDel);
      card.append(h3, meta, pNom, pDesc, acc);
    } else {
      card.append(h3, meta, pNom, pDesc);
    }

    grid.append(card);
  }

  cont.append(grid);
}

/** Vista previa en inicio (sin eliminar). */
export async function cargarPreviewFavoritos() {
  try {
    await renderFavoritosEnContenedor(el("tusFavoritos"), false);
  } catch (err) {
    if (err instanceof ProblemDetailsError) {
      muestraError(err);
    } else {
      muestraError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

/** Página pelis-agregadas: lista con eliminar. */
export async function inicializarFavoritos() {
  const cont = el("favoritos");
  if (!cont) return;

  try {
    await renderFavoritosEnContenedor(cont, true);
  } catch (err) {
    if (err instanceof ProblemDetailsError) {
      muestraError(err);
    } else {
      muestraError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
