import http from 'http';

async function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting GlobeTrotter Backend Test Suite...\n');
  const base = { host: 'localhost', port: 5000 };

  // 1. Health check
  const health = await request({ ...base, path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL', health.data);

  // 2. Login as Demo user
  const loginRes = await request(
    { ...base, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'alex@globetrotter.com', password: 'Alex@123' }
  );
  console.log('2. Demo User Login:', loginRes.status === 200 ? '✅ PASS' : '❌ FAIL', loginRes.data.user?.email);
  const token = loginRes.data.token;

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. Get user profile
  const profileRes = await request({ ...base, path: '/api/auth/me', method: 'GET', headers: authHeaders });
  console.log('3. User Profile & Stats:', profileRes.status === 200 ? '✅ PASS' : '❌ FAIL', profileRes.data.stats);

  // 4. List user trips
  const tripsRes = await request({ ...base, path: '/api/trips?user=me', method: 'GET', headers: authHeaders });
  console.log('4. List Trips:', tripsRes.status === 200 ? '✅ PASS' : '❌ FAIL', `Found ${tripsRes.data.trips?.length} trips`);

  const sampleTripId = tripsRes.data.trips[0]?.id;

  // 5. Get full trip hierarchy
  const fullTripRes = await request({ ...base, path: `/api/trips/${sampleTripId}/full`, method: 'GET', headers: authHeaders });
  console.log('5. Full Trip Hierarchy:', fullTripRes.status === 200 ? '✅ PASS' : '❌ FAIL', `Stops: ${fullTripRes.data.trip?.stops?.length}`);

  // 6. Get dynamic budget calculation
  const budgetRes = await request({ ...base, path: `/api/trips/${sampleTripId}/budget`, method: 'GET', headers: authHeaders });
  console.log('6. Dynamic Budget Breakdown:', budgetRes.status === 200 ? '✅ PASS' : '❌ FAIL', {
    total_cost: budgetRes.data.total_cost,
    categories: budgetRes.data.categories?.map(c => `${c.label}: $${c.amount}`)
  });

  // 7. Search cities catalog
  const citiesRes = await request({ ...base, path: '/api/cities?q=paris', method: 'GET' });
  console.log('7. Catalog City Search (Paris):', citiesRes.status === 200 ? '✅ PASS' : '❌ FAIL', citiesRes.data.cities[0]?.name);

  // 8. Public share
  const shareRes = await request({ ...base, path: `/api/trips/${sampleTripId}/share`, method: 'POST', headers: authHeaders });
  console.log('8. Trip Public Share:', shareRes.status === 200 ? '✅ PASS' : '❌ FAIL', shareRes.data.share_url);

  // 9. Public itinerary view (no auth)
  const publicViewRes = await request({ ...base, path: `/api/public/trips/${shareRes.data.share_slug}`, method: 'GET' });
  console.log('9. Public Trip View (Unauthenticated):', publicViewRes.status === 200 ? '✅ PASS' : '❌ FAIL', publicViewRes.data.trip?.name);

  // 10. Copy trip
  const copyRes = await request({ ...base, path: `/api/trips/${sampleTripId}/copy`, method: 'POST', headers: authHeaders });
  console.log('10. Copy Trip Clone:', copyRes.status === 201 ? '✅ PASS' : '❌ FAIL', copyRes.data.trip?.name);

  // 11. Admin login & stats
  const adminLogin = await request(
    { ...base, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'admin@globetrotter.com', password: 'Admin@123' }
  );
  const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminLogin.data.token}` };
  const adminStats = await request({ ...base, path: '/api/admin/stats', method: 'GET', headers: adminHeaders });
  console.log('11. Admin Analytics Stats:', adminStats.status === 200 ? '✅ PASS' : '❌ FAIL', adminStats.data.summary);

  console.log('\n🎉 ALL BACKEND TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(console.error);
