import { consume } from "./lib/consume.js";
import { recibeJson } from "./lib/recibeJson.js";
import { enviaFormRecibeJson } from "./lib/enviaFormRecibeJson.js";
import { ProblemDetailsError } from "./lib/ProblemDetailsError.js";

// API externa (terceros)
const API_URL = "https://ghibliapi.vercel.app/films";

// Backend del profe (rutas RELATIVAS)
const URL_AGREGA = "php/pasatiempo-agrega.php";
const URL_ELIMINA = "php/pasatiempo-elimina.php";
const URL_VISTA_IDX = "php/pasatiempo-vista-index.php";

// Servicio NUEVO (pero usando libs del profe)
const URL_SALUDO = "php/saludo.php";

// LocalStorage
const LS_USUARIO = "usuario";

// Elementos
const MOVIES_BY_TITLE = new Map();

document.addEventListener("DOMContentLoaded", init);

function el(id) {
  return /** @type {HTMLElement|null} */ (document.getElementById(id));
}

async function init() {
  preparaUsuario();
  preparaFavoritosForm();
  if (el("secCatalogo")) {
    await cargaCatalogo();
  }
  if (el("secFavoritos")) {
    await cargaFavoritos();
  }
  pintaSaludoDesdeStorage();
}

/* -------------------------- Tabs (INICIO / FAVORITOS) -------------------------- */
function preparaTabs() {
  const tabInicio = /** @type {HTMLButtonElement|null} */ (el("tab-inicio"));
  const tabFavs = /** @type {HTMLButtonElement|null} */ (el("tab-favoritos"));
  const secCat = el("secCatalogo");
  const secFav = el("secFavoritos");

  const activa = async (vista) => {
    const esInicio = vista === "inicio";

    tabInicio?.classList.toggle("is-active", esInicio);
    tabFavs?.classList.toggle("is-active", !esInicio);
    tabInicio?.setAttribute("aria-selected", String(esInicio));
    tabFavs?.setAttribute("aria-selected", String(!esInicio));

    secCat?.toggleAttribute("hidden", !esInicio);
    secFav?.toggleAttribute("hidden", esInicio);

    limpiaMensajes();
    pintaSaludoDesdeStorage();

    if (!esInicio) await cargaFavoritos();
  };

  tabInicio?.addEventListener("click", () => activa("inicio"));
  tabFavs?.addEventListener("click", () => activa("favoritos"));
}

/* ------------------------------- Mensajes -------------------------------- */
function setMensaje(tipo, texto) {
  const box = el("mensajes");
  if (!box) return;
  box.hidden = false;
  box.textContent = texto;
  box.classList.remove("is-ok", "is-err", "is-info");
  box.classList.add(tipo === "ok" ? "is-ok" : tipo === "err" ? "is-err" : "is-info");
}

function limpiaMensajes() {
  const box = el("mensajes");
  if (!box) return;
  box.hidden = true;
  box.textContent = "";
  box.classList.remove("is-ok", "is-err", "is-info");
}

/* -------------------------- Usuario (Hola + JSON) -------------------------- */
function preparaUsuario() {
  const form = /** @type {HTMLFormElement|null} */ (el("formUsuario"));
  const input = /** @type {HTMLInputElement|null} */ (el("campoUsuario"));
  const saludoInline = el("saludoInline");
  const btn = /** @type {HTMLButtonElement|null} */ (el("btnUsuario"));

  const guardado = (localStorage.getItem(LS_USUARIO) || "").trim();
  if (guardado) {
    if (input) input.value = guardado;
    if (saludoInline) saludoInline.textContent = `¡Hola ${guardado}!`;
  }

  if (!form || !btn) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    limpiaMensajes();

    const valor = (input?.value || "").trim();
    if (!valor) {
      setMensaje("err", "Ingresa tu nombre para guardar.");
      return;
    }

    setBtnLoading(btn, true);

    try {
      const metodoHttp = (form.getAttribute("method") || "GET").toUpperCase();
      const url = new URL(URL_SALUDO, location.href);
      url.searchParams.set("usuario", valor);
      const resp = await consume(recibeJson(url.toString(), metodoHttp));
      const json = await resp.json();

      // Guardar en localStorage
      localStorage.setItem(LS_USUARIO, valor);

      // Actualizar UI
      if (saludoInline) saludoInline.textContent = json.mensaje || `¡Hola ${valor}!`;
      pintaSaludoDesdeStorage();

      setMensaje("ok", "Nombre guardado correctamente ✅");
    } catch (err) {
      manejaErrorAmigable(err);
    } finally {
      setBtnLoading(btn, false);
    }
  });
}

function pintaSaludoDesdeStorage() {
  const header = el("saludoHeader");
  const usuario = (localStorage.getItem(LS_USUARIO) || "").trim();
  if (!header) return;
  header.textContent = usuario ? `¡Hola ${usuario}!` : "";
}

/* -------------------------- Catálogo (API externa) -------------------------- */
async function cargaCatalogo() {
  const estado = el("estado");
  const grid = /** @type {HTMLUListElement|null} */ (el("gridPeliculas"));

  try {
    estado?.removeAttribute("hidden");
    grid?.setAttribute("aria-busy", "true");

    const resp = await consume(recibeJson(API_URL));
    /** @type {Array<any>} */
    const peliculas = await resp.json();

    MOVIES_BY_TITLE.clear();
    for (const p of peliculas) {
      const key = normalizaTitulo(p?.title);
      if (key) MOVIES_BY_TITLE.set(key, p);
    }

    renderCatalogo(peliculas);
  } catch (err) {
    setMensaje("err", "No se pudo cargar el catálogo. Intenta más tarde.");
    console.error(err);
  } finally {
    estado?.setAttribute("hidden", "");
    grid?.setAttribute("aria-busy", "false");
  }
}

function renderCatalogo(lista) {
  const grid = /** @type {HTMLUListElement|null} */ (el("gridPeliculas"));
  if (!grid) return;

  grid.textContent = "";

  if (!Array.isArray(lista) || lista.length === 0) {
    setMensaje("info", "No hay películas para mostrar.");
    return;
  }

  const frag = document.createDocumentFragment();

  for (const p of lista) {
    const title = toStr(p?.title) || "Título desconocido";
    const director = toStr(p?.director) || "Dirección no disponible";
    const year = toStr(p?.release_date) || "s/f";
    const desc = recorta(toStr(p?.description), 220);

    const imgSrc = firstNonEmpty(toStr(p?.image), toStr(p?.movie_banner), "");

    const li = document.createElement("li");
    li.className = "wow-card";

    const art = document.createElement("article");
    art.className = "wow-card-body";

    const fig = document.createElement("figure");
    fig.className = "wow-fig";
    if (imgSrc) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.src = imgSrc;
      img.alt = `Poster: ${title}`;
      img.className = "wow-img";
      fig.append(img);
    }

    const h3 = document.createElement("h3");
    h3.className = "wow-card-title";
    h3.textContent = title;

    const meta = document.createElement("p");
    meta.className = "wow-meta";
    meta.append(badge("Director"), " ", director, " ", dot(), " ", badge("Año"), " ", year);

    const pDesc = document.createElement("p");
    pDesc.className = "wow-desc";
    pDesc.textContent = desc;

    const actions = document.createElement("section");
    actions.className = "wow-actions";

    const btnSel = document.createElement("button");
    btnSel.type = "button";
    btnSel.className = "wow-btn wow-btn-primary";
    btnSel.textContent = "⭐ Seleccionar";
    btnSel.addEventListener("click", () => llenaFormulario(title, director, year));

    actions.append(btnSel);
    art.append(fig, h3, meta, pDesc, actions);
    li.append(art);
    frag.append(li);
  }

  grid.append(frag);
}

function llenaFormulario(title, director, year) {
  const campo = /** @type {HTMLInputElement|null} */ (el("campoNombre"));
  if (!campo) return;

  campo.value = `${title.trim()} – ${director.trim()} (${year.trim()})`;
  setMensaje("info", "Ahora presiona “Guardar favorito”.");
}

/* -------------------------- Favoritos: agregar (POST) -------------------------- */
function preparaFavoritosForm() {
  const form = /** @type {HTMLFormElement|null} */ (el("formFavorito"));
  const btn = /** @type {HTMLButtonElement|null} */ (el("btnGuardar"));
  if (!form || !btn) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    limpiaMensajes();

    // ✅ DEBUG correcto para este form
    const fdDebug = new FormData(form);
    console.log("DEBUG favoritos keys:", Array.from(fdDebug.keys()));
    console.log("DEBUG get(nombre):", fdDebug.get("nombre"));

    const inputNombre = /** @type {HTMLInputElement|null} */ (
      document.getElementById("campoNombre")
    );
    console.log("DEBUG campoNombre(id) value:", inputNombre ? inputNombre.value : null);

    const campo = /** @type {HTMLInputElement|null} */ (form.elements.namedItem("nombre"));
    console.log("DEBUG form.elements['nombre']:", campo);

    const valor = (campo?.value || "").trim();
    console.log("DEBUG valor trim:", valor);

    if (!valor) {
      setMensaje("err", "Debes seleccionar una película del catálogo.");
      return;
    }

    // ✅ envía al backend (sin resp.json)
    try {
      await consume(enviaFormRecibeJson("php/pasatiempo-agrega.php", form));
      setMensaje("ok", "Película agregada a favoritos ✅");
      campo.value = "";
    } catch (err) {
      manejaErrorAmigable(err);
    }
  });
}

/* -------------------------- Favoritos: listar + eliminar -------------------------- */
async function cargaFavoritos() {
  const est = el("estadoFav");
  const ulHidden = /** @type {HTMLUListElement|null} */ (el("listaOriginal"));
  const grid = /** @type {HTMLUListElement|null} */ (el("gridFavoritos"));

  if (!ulHidden || !grid) return;

  grid.textContent = "";

  try {
    est?.removeAttribute("hidden");

    // El profe suele devolver JSON con innerHTML de la lista
    const resp = await consume(recibeJson(URL_VISTA_IDX));
    const json = await resp.json();

    const html = json?.lista?.innerHTML;
    ulHidden.innerHTML = typeof html === "string" ? html : "";

    /** @type {{id:string,nombre:string}[]} */
    const items = [];
    for (const li of Array.from(ulHidden.querySelectorAll("li"))) {
      const a = li.querySelector("a[href*='id=']");
      if (!a) continue;

      const id = new URL(a.getAttribute("href") || "", location.href).searchParams.get("id") || "";
      const nombre = (a.textContent || "").trim();
      if (id && nombre) items.push({ id, nombre });
    }

    const frag = document.createDocumentFragment();

    for (const it of items) {
      const { id, nombre } = it;

      const { titulo } = splitNombre(nombre);
      const movie = MOVIES_BY_TITLE.get(normalizaTitulo(titulo)) || null;

      const imgSrc = movie ? firstNonEmpty(toStr(movie.image), toStr(movie.movie_banner), "") : "";
      const dTitle = movie?.title || titulo || nombre;
      const dDir = movie?.director || "—";
      const dYear = movie?.release_date || "—";
      const dDesc = movie ? recorta(toStr(movie.description), 200) : "";

      const li = document.createElement("li");
      li.className = "wow-card";

      const art = document.createElement("article");
      art.className = "wow-card-body";

      const fig = document.createElement("figure");
      fig.className = "wow-fig";
      if (imgSrc) {
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.src = imgSrc;
        img.alt = `Poster: ${dTitle}`;
        img.className = "wow-img";
        fig.append(img);
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

      const acciones = document.createElement("section");
      acciones.className = "wow-actions wow-actions-wrap";

      const btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "wow-btn wow-btn-danger wow-btn-sm";
      btnDel.textContent = "Eliminar";
      btnDel.addEventListener("click", () => eliminaFavorito(id, btnDel));

      acciones.append(btnDel);
      art.append(fig, h3, meta, pNom, pDesc, acciones);
      li.append(art);
      frag.append(li);
    }

    grid.append(frag);

    if (!grid.children.length) setMensaje("info", "Aún no tienes favoritos.");
  } catch (err) {
    setMensaje("err", "No se pudo cargar la lista de favoritos.");
    console.error(err);
  } finally {
    est?.setAttribute("hidden", "");
  }
}

async function eliminaFavorito(id, btn) {
  limpiaMensajes();
  setBtnLoading(btn, true);

  try {
    // Form en memoria PERO con POST
    const form = document.createElement("form");
    form.method = "post";

    const input = document.createElement("input");
    input.name = "id";
    input.value = id;
    form.append(input);

    await consume(enviaFormRecibeJson(URL_ELIMINA, form));

    setMensaje("ok", "Favorito eliminado ✅");
    await cargaFavoritos();
  } catch (err) {
    manejaErrorAmigable(err);
  } finally {
    setBtnLoading(btn, false);
  }
}

/* -------------------------- Errores amigables -------------------------- */
function manejaErrorAmigable(error) {
  if (error instanceof ProblemDetailsError) {
    const pd = error.problemDetails;
    const detail = typeof pd?.detail === "string" ? pd.detail : "";
    const title = typeof pd?.title === "string" ? pd.title : "";

    // Nuevo: detectar duplicado por status 409 o por texto específico
    if (pd?.status === 409 || /ya existe/i.test(detail) || /registro duplicado/i.test(title)) {
      setMensaje("err", "No se puede porque ya la agregaste ✅");
      return;
    }

    // Mantener compatibilidad con errores antiguos
    if (/UNIQUE constraint failed/i.test(detail) || /SQLSTATE\[23000\]/i.test(detail)) {
      setMensaje("err", "No se puede porque ya la agregaste ✅");
      return;
    }

    if (/Falta/i.test(title) || /Falta/i.test(detail)) {
      setMensaje("err", "Falta un dato obligatorio. Revisa el formulario.");
      return;
    }

    // Evita asustar al usuario
    setMensaje("err", "No se pudo completar la operación. Intenta nuevamente.");
    console.error("ProblemDetails:", pd);
    return;
  }

  setMensaje("err", "Ocurrió un problema. Intenta nuevamente.");
  console.error(error);
}

/* -------------------------- Helpers -------------------------- */
function setBtnLoading(btn, on) {
  btn.disabled = !!on;
  btn.setAttribute("aria-busy", String(!!on));
  btn.classList.toggle("is-loading", !!on);
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

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (v && v.trim() !== "") return v;
  }
  return "";
}

function toStr(v) {
  return typeof v === "string" ? v : "";
}

function recorta(txt, max) {
  const s = (txt || "").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function normalizaTitulo(t) {
  return (t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function splitNombre(nombre) {
  const s = (nombre || "").trim();
  const [tituloParte] = s.split(" – ");
  const titulo = (tituloParte || "").trim();
  return { titulo };
}
