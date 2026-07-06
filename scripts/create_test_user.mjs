import fs from 'fs';

function parseDotEnv(path) {
  const txt = fs.readFileSync(path, 'utf8');
  const out = {};
  for (let line of txt.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

(async function main(){
  try {
    const env = parseDotEnv(new URL('../.env', import.meta.url));
    const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
    const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      console.error('Missing SUPABASE URL or publishable key in .env');
      process.exit(1);
    }

    const email = `test+${Date.now()}@example.com`;
    const password = 'Test1234!';

    const res = await fetch(new URL('/auth/v1/signup', url).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json().catch(() => ({}));

    // Redact tokens if present
    if (json?.access_token) delete json.access_token;
    if (json?.refresh_token) delete json.refresh_token;
    if (json?.provider_token) delete json.provider_token;

    // Print redacted full response for debugging (includes error fields if any)
    console.log('REDACTED_API_RESPONSE', JSON.stringify({ status: res.status, body: json }, null, 2));
    console.log('CREATED_TEST_USER_CREDENTIALS', JSON.stringify({ email, password }));
  } catch (err) {
    console.error('ERROR', String(err));
    process.exit(1);
  }
})();
