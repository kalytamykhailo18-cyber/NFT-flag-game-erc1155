const apiKey = process.env.ADMIN_API_KEY || 'dev-admin-key-123';

// Test creating region
fetch('http://localhost:3000/api/admin/regions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Admin-Key': apiKey
  },
  body: JSON.stringify({
    country_id: 1,
    name: 'Test Region',
    code: 'TEST'
  })
})
.then(res => res.json())
.then(data => console.log('Response:', JSON.stringify(data, null, 2)))
.catch(err => console.error('Error:', err));
