// Ativação via Firestore (mesmo padrão do LEAN-TIMER PRO): a licença mora num
// backend real (fora do alcance do usuário), não é só um checksum no navegador.
const FIREBASE_PROJECT_ID = 'fluxocerto-cake-lic';
const FIREBASE_API_KEY = 'AIzaSyDQBx4KrbOu6_mNA4_tXKMozB6yJbUIxIc';

const STORAGE_KEY = 'fluxocerto-cake-activation';
const MACHINE_KEY = 'fluxocerto-cake-machine-id';

function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getMachineId() {
  let id = localStorage.getItem(MACHINE_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(MACHINE_KEY, id);
  }
  return id;
}

function parseFirestoreValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(parseFirestoreValue);
  if ('timestampValue' in v) return new Date(v.timestampValue);
  return null;
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const r = {};
  for (const [k, v] of Object.entries(doc.fields)) r[k] = parseFirestoreValue(v);
  return r;
}

async function fsGet(chave) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/licencas/${encodeURIComponent(chave)}?key=${FIREBASE_API_KEY}`;
  const res = await fetch(url);
  const body = await res.json();
  return { status: res.status, body };
}

async function fsPatch(chave, maquinas) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/licencas/${encodeURIComponent(chave)}?updateMask.fieldPaths=maquinas&key=${FIREBASE_API_KEY}`;
  const payload = JSON.stringify({
    fields: { maquinas: { arrayValue: { values: maquinas.map((m) => ({ stringValue: m })) } } },
  });
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
  });
  const body = await res.json();
  return { status: res.status, body };
}

export function getActivation() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveActivation(activation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activation));
}

export function clearActivation() {
  localStorage.removeItem(STORAGE_KEY);
}

// Valida um código de ativação (+ e-mail) contra o Firestore e registra este
// aparelho na licença (respeitando o limite de aparelhos por código).
export async function validateLicense({ chave, email }) {
  const machineId = getMachineId();
  const chaveNorm = chave.trim().toUpperCase();
  try {
    const { status, body } = await fsGet(chaveNorm);
    if (status === 404) return { success: false, error: 'Código de ativação não encontrado.' };
    if (status !== 200) return { success: false, error: `Erro ao validar (código ${status}).` };
    const doc = parseFirestoreDoc(body);
    if (!doc) return { success: false, error: 'Dados de licença inválidos.' };
    if (!doc.ativa) return { success: false, error: 'Este código foi desativado. Fale com quem vendeu o app.' };
    if (doc.email && email && doc.email.toLowerCase() !== email.trim().toLowerCase()) {
      return { success: false, error: 'O e-mail informado não corresponde a este código.' };
    }
    if (doc.expiracao && new Date(doc.expiracao) < new Date()) {
      return { success: false, error: 'Este código expirou.' };
    }
    const maquinas = doc.maquinas || [];
    const maxMaquinas = doc.maxMaquinas || 1;
    if (!maquinas.includes(machineId)) {
      if (maquinas.length >= maxMaquinas) {
        return { success: false, error: `Limite de ${maxMaquinas} aparelho(s) atingido para este código.` };
      }
      await fsPatch(chaveNorm, [...maquinas, machineId]);
    }
    const activation = {
      chave: chaveNorm,
      email: doc.email || email?.trim() || '',
      nome: doc.nome || '',
      machineId,
      validadoEm: new Date().toISOString(),
    };
    saveActivation(activation);
    return { success: true, activation };
  } catch {
    return { success: false, error: 'Sem conexão com o servidor de licenças. Verifique sua internet.' };
  }
}

// Roda no boot do app. Usa cache local por 7 dias; depois disso tenta
// revalidar contra o Firestore, mas mantém a ativação local se estiver offline.
export async function checkActivation() {
  const activation = getActivation();
  if (!activation) return { activated: false };

  const daysSince = (Date.now() - new Date(activation.validadoEm).getTime()) / 86_400_000;
  if (daysSince < 7) return { activated: true, activation };

  try {
    const { status, body } = await fsGet(activation.chave);
    if (status === 200) {
      const doc = parseFirestoreDoc(body);
      if (!doc || !doc.ativa) {
        clearActivation();
        return { activated: false, reason: 'Este código foi revogado.' };
      }
      if (doc.expiracao && new Date(doc.expiracao) < new Date()) {
        clearActivation();
        return { activated: false, reason: 'Este código expirou.' };
      }
      saveActivation({ ...activation, validadoEm: new Date().toISOString() });
    }
  } catch {
    // offline → mantém a ativação local
  }
  return { activated: true, activation };
}
