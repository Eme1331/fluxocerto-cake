// Gerador de licenças do FluxoCerto - Cake.
// Uso:
//   node gerar-licenca.mjs --email cliente@x.com --nome "Fulano" --maquinas 1 --dias 365
// Todos os parâmetros são opcionais exceto quando quiser exigir e-mail na ativação.
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { randomBytes } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = 'AIzaSyDQBx4KrbOu6_mNA4_tXKMozB6yJbUIxIc';
const PROJECT_ID = 'fluxocerto-cake-lic';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      out[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return out;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O/0/I/1
function segmento(tamanho) {
  let out = '';
  const bytes = randomBytes(tamanho);
  for (let i = 0; i < tamanho; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
function gerarCodigo() {
  return `FCC-${segmento(4)}-${segmento(4)}-${segmento(4)}`;
}

async function loginAdmin() {
  const credsPath = path.join(__dirname, '.admin-credentials.json');
  const creds = JSON.parse(readFileSync(credsPath, 'utf8'));
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: creds.email, password: creds.password, returnSecureToken: true }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Falha ao autenticar admin: ${body.error?.message || res.status}`);
  return body.idToken;
}

function toFirestoreFields({ email, nome, maquinas, dias }) {
  const fields = {
    ativa: { booleanValue: true },
    maxMaquinas: { integerValue: String(maquinas ?? 1) },
    maquinas: { arrayValue: {} },
  };
  if (email) fields.email = { stringValue: email };
  if (nome) fields.nome = { stringValue: nome };
  if (dias) {
    const expira = new Date(Date.now() + Number(dias) * 86_400_000);
    fields.expiracao = { timestampValue: expira.toISOString() };
  }
  return fields;
}

async function criarLicenca(idToken, codigo, opts) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/licencas?documentId=${encodeURIComponent(codigo)}&key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ fields: toFirestoreFields(opts) }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Falha ao criar licença: ${body.error?.message || res.status}`);
  return body;
}

const opts = parseArgs();
const idToken = await loginAdmin();
const codigo = gerarCodigo();
await criarLicenca(idToken, codigo, opts);

console.log('Licença criada com sucesso!\n');
console.log(`  Código:       ${codigo}`);
if (opts.email) console.log(`  E-mail:       ${opts.email}`);
if (opts.nome) console.log(`  Nome:         ${opts.nome}`);
console.log(`  Aparelhos:    ${opts.maquinas ?? 1}`);
console.log(`  Expira em:    ${opts.dias ? `${opts.dias} dias` : 'nunca'}`);
console.log('\nEnvie o código (e o e-mail, se exigido) para o cliente ativar o app.');
