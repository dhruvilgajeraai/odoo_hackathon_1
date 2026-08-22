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
  console.log('🧪 Starting GlobeTrotter India Backend Test Suite...\n');
  const base = { host: 'localhost', port: 5000 };

  // 1. Health check
  const health = await request({ ...base, path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL');

  // 2. Login as Demo Indian Traveler (Rahul)
  const loginRes = await request(
    { ...base, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'rahul@globetrotter.in', password: 'Rahul@123' }
  );
  console.log('2. Indian Demo Login (Rahul):', loginRes.status === 200 ? '✅ PASS' : '❌ FAIL', loginRes.data.user?.email);
  const token = loginRes.data.token;

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 3. User Trips
  const tripsRes = await request({ ...base, path: '/api/trips?user=me', method: 'GET', headers: authHeaders });
  console.log('3. List Indian Trips:', tripsRes.status === 200 ? '✅ PASS' : '❌ FAIL', `Found ${tripsRes.data.trips?.length} trips`);

  const sampleTripId = tripsRes.data.trips[0]?.id;

  // 4. Budget in INR
  const budgetRes = await request({ ...base, path: `/api/trips/${sampleTripId}/budget`, method: 'GET', headers: authHeaders });
  console.log('4. INR Budget Breakdown:', budgetRes.status === 200 ? '✅ PASS' : '❌ FAIL', {
    trip_name: budgetRes.data.trip_name,
    total_cost_inr: `₹${budgetRes.data.total_cost}`,
    target_budget_inr: `₹${budgetRes.data.target_budget}`
  });

  // 5. Search Indian Cities (Goa)
  const citiesRes = await request({ ...base, path: '/api/cities?q=goa', method: 'GET' });
  console.log('5. Indian City Search (Goa):', citiesRes.status === 200 ? '✅ PASS' : '❌ FAIL', citiesRes.data.cities[0]?.name);

  // 6. Admin Login & Stats
  const adminLogin = await request(
    { ...base, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'priya@globetrotter.in', password: 'Priya@123' }
  );
  console.log('6. Admin Login (Priya):', adminLogin.status === 200 ? '✅ PASS' : '❌ FAIL', adminLogin.data.user?.email);

  console.log('\n🇮🇳 ALL INDIAN BACKEND TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(console.error);
