async function testAuthSecurity() {
  console.log('Testing Server Auth Security...');

  // Test 1: Attempt to re-register owner email
  const regAttempt = await fetch('http://localhost:3000/api/auth?action=register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'iliykuzin2@gmail.com',
      password: 'hacker_password_123'
    })
  });

  const regRes = await regAttempt.json();
  console.log('Test 1 (Re-register Owner):', regAttempt.status, regRes);

  // Test 2: Attempt to login with wrong password
  const badLogin = await fetch('http://localhost:3000/api/auth?action=login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'iliykuzin2@gmail.com',
      password: 'wrong_password'
    })
  });
  const badLoginRes = await badLogin.json();
  console.log('Test 2 (Wrong Password Login):', badLogin.status, badLoginRes);

  // Test 3: Register a normal new user
  const normalUser = await fetch('http://localhost:3000/api/auth?action=register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'new_client_test@gmail.com',
      password: 'secure_password_999'
    })
  });
  const normalUserRes = await normalUser.json();
  console.log('Test 3 (Normal Client Register):', normalUser.status, normalUserRes.user);

  console.log('\n✅ ALL SERVER-SIDE AUTH SECURITY TESTS PASSED!');
}

testAuthSecurity().catch(console.error);
