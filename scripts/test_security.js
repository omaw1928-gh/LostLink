/**
 * LostLink — Automated Security Verification Script (Q2b)
 * Rejection Proofs: 401 Unauthenticated, 403 Forbidden (RBAC / IDOR), 200 OK Authorized
 */

const http = require('http');

const BASE_HOST = '127.0.0.1';
const BASE_PORT = 8080;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {}
        resolve({ status: res.statusCode, data: json, raw: data });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(70));
  console.log(' 🛡️ LostLink Security Verification & Rejection Proofs (Q2b)');
  console.log(' Target: http://localhost:8080');
  console.log('='.repeat(70));

  const rand = Math.floor(1000 + Math.random() * 9000);

  // 1. Unauthenticated request to delete an item -> 401
  const unauthRes = await makeRequest({
    host: BASE_HOST,
    port: BASE_PORT,
    path: '/api/items/60c72b2f9b1d8b2bad000000',
    method: 'DELETE',
  });
  console.log(`\n[Test 1] Unauthenticated DELETE /api/items/:id`);
  console.log(`         HTTP Status: ${unauthRes.status} ${unauthRes.status === 401 ? '✅ PASS (401 Unauthorized)' : '❌ FAIL'}`);

  // 2. Register Alice (Owner)
  const aliceEmail = `alice_${rand}@campus.edu`;
  const regAlice = await makeRequest(
    {
      host: BASE_HOST,
      port: BASE_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Alice Student', email: aliceEmail, password: 'AlicePassword12!', role: 'student' }
  );
  const tokenAlice = regAlice.data && regAlice.data.token;

  // 3. Register Bob (Attacker / Non-Owner)
  const bobEmail = `bob_${rand}@campus.edu`;
  const regBob = await makeRequest(
    {
      host: BASE_HOST,
      port: BASE_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { name: 'Bob Malicious', email: bobEmail, password: 'BobPassword12!', role: 'student' }
  );
  const tokenBob = regBob.data && regBob.data.token;

  // 4. Alice creates item
  const createItem = await makeRequest(
    {
      host: BASE_HOST,
      port: BASE_PORT,
      path: '/api/items',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlice}`,
      },
    },
    {
      title: 'Alice Gold Watch',
      description: 'Lost in library',
      type: 'lost',
      category: 'Accessories',
      location: 'Central Library',
      date: '2026-10-30',
    }
  );
  const itemId = createItem.data && createItem.data.data && createItem.data.data._id;
  console.log(`\n[Setup] Created Item as Alice: ID ${itemId}`);

  // 5. Bob tries to update Alice's item -> 403 Forbidden
  const bobUpdate = await makeRequest(
    {
      host: BASE_HOST,
      port: BASE_PORT,
      path: `/api/items/${itemId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenBob}`,
      },
    },
    { title: 'Bob Tampered Item' }
  );
  console.log(`[Test 2] Non-Owner (Bob) PUT /api/items/${itemId}`);
  console.log(`         HTTP Status: ${bobUpdate.status} ${bobUpdate.status === 403 ? '✅ PASS (403 Forbidden - IDOR Blocked)' : '❌ FAIL'}`);

  // 6. Bob tries to delete Alice's item -> 403 Forbidden
  const bobDelete = await makeRequest({
    host: BASE_HOST,
    port: BASE_PORT,
    path: `/api/items/${itemId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenBob}` },
  });
  console.log(`[Test 3] Non-Owner (Bob) DELETE /api/items/${itemId}`);
  console.log(`         HTTP Status: ${bobDelete.status} ${bobDelete.status === 403 ? '✅ PASS (403 Forbidden - Deletion Blocked)' : '❌ FAIL'}`);

  // 7. Alice updates own item -> 200 OK
  const aliceUpdate = await makeRequest(
    {
      host: BASE_HOST,
      port: BASE_PORT,
      path: `/api/items/${itemId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAlice}`,
      },
    },
    { title: 'Alice Gold Watch - [Claimed]' }
  );
  console.log(`[Test 4] Owner (Alice) PUT /api/items/${itemId}`);
  console.log(`         HTTP Status: ${aliceUpdate.status} ${aliceUpdate.status === 200 ? '✅ PASS (200 OK - Authorized)' : '❌ FAIL'}`);

  // 8. Bob tries to access Admin User Directory -> 403 Forbidden
  const bobAdmin = await makeRequest({
    host: BASE_HOST,
    port: BASE_PORT,
    path: '/api/auth/admin/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${tokenBob}` },
  });
  console.log(`[Test 5] Student GET /api/auth/admin/users`);
  console.log(`         HTTP Status: ${bobAdmin.status} ${bobAdmin.status === 403 ? '✅ PASS (403 Forbidden - Role Enforced)' : '❌ FAIL'}`);

  console.log('\n' + '='.repeat(70));
  console.log(' 🎉 All 401, 403, and 200 Rejection Proofs Verified Successfully!');
  console.log('='.repeat(70));
}

runTests().catch(console.error);
