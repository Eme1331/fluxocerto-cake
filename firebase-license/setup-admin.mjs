// Cria (uma única vez) o usuário admin usado pelo gerador de licenças.
// As credenciais ficam só em .admin-credentials.json (fora do git) — nunca
// aparecem no terminal/])output além do UID (que não é sensível).
import { randomBytes } from 'crypto';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credsPath = path.join(__dirname, '.admin-credentials.json');

const API_KEY = 'AIzaSyDQBx4KrbOu6_mNA4_tXKMozB6yJbUIxIc';

if (existsSync(credsPath)) {
  const { uid } = JSON.parse(readFileSync(credsPath, 'utf8'));
  console.log(`Já existe um admin configurado. UID: ${uid}`);
  process.exit(0);
}

const email = `admin-licencas-${randomBytes(4).toString('hex')}@fluxocerto-cake-lic.local`;
const password = randomBytes(24).toString('base64url');

const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, returnSecureToken: true }),
});
const body = await res.json();

if (!res.ok) {
  console.error('Falha ao criar o admin:', body.error?.message || res.status);
  process.exit(1);
}

writeFileSync(credsPath, JSON.stringify({ email, password, uid: body.localId }, null, 2));
console.log('Admin criado com sucesso.');
console.log(`UID (use no firestore.rules): ${body.localId}`);
