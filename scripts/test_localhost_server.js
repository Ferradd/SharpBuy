import fs from 'fs';

async function testAuditorApi() {
  console.log('Testing /api/get-stock-tokens...');
  try {
    const res = await fetch('http://localhost:3888/api/get-stock-tokens');
    const data = await res.json();
    console.log('Stock tokens response:', data.success, 'Count:', data.count);
    if (data.tokens && data.tokens.length > 0) {
      const firstToken = data.tokens[0];
      console.log('Testing /api/audit-single with token:', firstToken.substring(0, 35) + '...');
      
      const auditRes = await fetch('http://localhost:3888/api/audit-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: firstToken })
      });
      console.log('Audit status:', auditRes.status);
      const auditData = await auditRes.json();
      console.log('Audit result:', JSON.stringify(auditData, null, 2));
    }
  } catch (err) {
    console.error('Server test error:', err.message);
  }
}

testAuditorApi();
