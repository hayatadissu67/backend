const baseUrl = 'http://localhost:5000/api';

async function register() {
    const res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'test@test.com',
            password: 'password123',
            full_name: 'Test User',
            role: 'Admin'
        })
    });
    const data = await res.json();
    console.log('Registration response:', data);
}

register();