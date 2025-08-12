// ======= Helpers de estado =======
const STORAGE_KEY = "malla_aprobadas_v1";

function getApproved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}
function saveApproved(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

// Agrupa ramos por semestre
function indexBySemester() {
  const semesters = {};
  document.querySelectorAll(".semester").forEach(sec => {
    const sem = Number(sec.dataset.sem);
    const ids = [...sec.querySelectorAll(".subject")].map(s => s.dataset.id);
    semesters[sem] = ids;
  });
  return semesters;
}

// Requisitos explícitos desde HTML (data-req="a,b,c")
function getReqsMap() {
  const reqs = {};
  document.querySelectorAll(".subject").forEach(s => {
    const id = s.dataset.id;
    const raw = (s.dataset.req || "").trim();
    reqs[id] = raw ? raw.split(",").map(x => x.trim()) : [];
  });
  return reqs;
}

// ======= Lógica de desbloqueo =======
// Regla especial que pidió Mila:
// Si un ramo NO tiene requisitos, solo se desbloquea cuando
// TODOS los ramos del semestre anterior están aprobados.
function canUnlock(subjectEl, approvedSet, semesters, reqsMap) {
  const id = subjectEl.dataset.id;
  const reqs = reqsMap[id] || [];
  const sem = Number(subjectEl.closest(".semester").dataset.sem);

  // Si tiene requisitos explícitos: deben estar todos aprobados
  if (reqs.length > 0) {
    return reqs.every(r => approvedSet.has(r));
  }

  // Si NO tiene requisitos y es 1er semestre: desbloquear siempre
  if (sem === 1) return true;

  // Si NO tiene requisitos y NO es 1°: pedir todo el semestre anterior aprobado
  const prevIds = semesters[sem - 1] || [];
  return prevIds.every(r => approvedSet.has(r));
}

function refreshUI() {
  const approved = getApproved();
  const semesters = indexBySemester();
  const reqsMap = getReqsMap();

  const allSubjects = [...document.querySelectorAll(".subject")];

  // Setear estados
  allSubjects.forEach(el => {
    el.classList.remove("locked", "unlocked", "approved", "just-unlocked");

    const id = el.dataset.id;

    if (approved.has(id)) {
      el.classList.add("approved");
      el.title = "Aprobado";
      el.setAttribute("aria-pressed", "true");
      el.style.pointerEvents = "auto";
      return;
    }

    if (canUnlock(el, approved, semesters, reqsMap)) {
      // Si estaba locked antes, marcar pulso
      if (!el.classList.contains("unlocked")) {
        el.classList.add("just-unlocked");
        setTimeout(() => el.classList.remove("just-unlocked"), 1200);
      }
      el.classList.add("unlocked");
      el.title = "Disponible (clic para aprobar)";
      el.setAttribute("aria-pressed", "false");
      el.style.pointerEvents = "auto";
    } else {
      el.classList.add("locked");
      el.title = "Bloqueado";
      el.style.pointerEvents = "none";
    }
  });
}

function toggleApprove(e) {
  const el = e.currentTarget;
  if (!el.classList.contains("unlocked")) return;

  const approved = getApproved();
  const id = el.dataset.id;

  if (approved.has(id)) {
    approved.delete(id);
  } else {
    approved.add(id);
  }
  saveApproved(approved);
  refreshUI();
}

function attachHandlers() {
  document.querySelectorAll(".subject").forEach(el => {
    el.addEventListener("click", toggleApprove);
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    refreshUI();
  });
}

// ======= Init =======
document.addEventListener("DOMContentLoaded", () => {
  attachHandlers();
  refreshUI();
});
