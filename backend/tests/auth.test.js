const request = require('supertest');
const app = require('../server');
const { initializeDatabase, User } = require('./setup');
const { hashPassword } = require('../utils/password');

describe('Auth System', () => {
  let testUser;

  beforeEach(async () => {
    await initializeDatabase();
    
    // Seed a standard user
    testUser = await User.create({
      fullName: 'Test Mechanic',
      email: 'mechanic@test.com',
      password: await hashPassword('password123'),
      role: 'mechanic',
      mustChangePassword: false,
      isActive: true,
    });
  });

  test('POST /api/auth/login - Success with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mechanic@test.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('mechanic');
    expect(res.body.fullName).toBe('Test Mechanic');
  });

  test('POST /api/auth/login - Fail with incorrect credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mechanic@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Invalid email or password');
  });

  test('POST /api/auth/login - Lockout after 5 failed attempts', async () => {
    // Perform 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'mechanic@test.com', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
    }

    // 6th attempt should be locked
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mechanic@test.com', password: 'password123' });

    expect(res.statusCode).toBe(423);
    expect(res.body.message).toContain('Account locked');
  });

  test('GET /api/auth/me - Success when authenticated', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mechanic@test.com', password: 'password123' });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.email).toBe('mechanic@test.com');
    expect(meRes.body.fullName).toBe('Test Mechanic');
  });

  test('PATCH /api/auth/profile - Update full name', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mechanic@test.com', password: 'password123' });

    const token = loginRes.body.token;

    const profileRes = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'New Mechanic Name' });

    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.fullName).toBe('New Mechanic Name');

    // Confirm DB update
    const updated = await User.findByPk(testUser.id);
    expect(updated.fullName).toBe('New Mechanic Name');
  });
});
