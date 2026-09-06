const baseUrl = 'http://localhost:5000/api';

async function testLogin() {
    try {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@pmo.com',
                password: 'admin123'
            })
        });
        const data = await res.json();
        console.log('Login response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testLogin();