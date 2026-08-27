const request = require('supertest');
const app = require('../server');
const { initializeDatabase, User, Kart } = require('./setup');
const { hashPassword } = require('../utils/password');

describe('Kart Fleet Management', () => {
  let adminToken;
  let controllerToken;
  let mechanicToken;
  let mechanic;

  beforeEach(async () => {
    await initializeDatabase();

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@test.com',
      password: await hashPassword('Admin123!'),
      role: 'admin',
      mustChangePassword: false,
      isActive: true,
    });

    mechanic = await User.create({
      fullName: 'Mech User',
      email: 'mech@test.com',
      password: await hashPassword('Mech123!'),
      role: 'mechanic',
      mustChangePassword: false,
      isActive: true,
    });

    const controller = await User.create({
      fullName: 'Controller User',
      email: 'ctrl@test.com',
      password: await hashPassword('Ctrl123!'),
      role: 'controller',
      mustChangePassword: false,
      isActive: true,
    });

    const a = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Admin123!' });
    const m = await request(app).post('/api/auth/login').send({ email: 'mech@test.com', password: 'Mech123!' });
    const c = await request(app).post('/api/auth/login').send({ email: 'ctrl@test.com', password: 'Ctrl123!' });

    adminToken = a.body.token;
    mechanicToken = m.body.token;
    controllerToken = c.body.token;
  });

  test('Admin can create a kart', async () => {
    const res = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K01' });

    expect(res.statusCode).toBe(201);
    expect(res.body.kartNumber).toBe('K01');
    expect(res.body.status).toBe('functional');
  });

  test('Cannot create duplicate kart number', async () => {
    await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K01' });

    const res = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K01' });

    expect(res.statusCode).toBe(409);
  });

  test('Controller can set kart out_of_order', async () => {
    const createRes = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K02' });

    const kartId = createRes.body.id;

    const res = await request(app)
      .patch(`/api/karts/${kartId}/status`)
      .set('Authorization', `Bearer ${controllerToken}`)
      .send({ status: 'out_of_order' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('out_of_order');
  });

  test('Mechanic can take charge of out_of_order kart', async () => {
    const createRes = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K03' });
    const kartId = createRes.body.id;

    await request(app)
      .patch(`/api/karts/${kartId}/status`)
      .set('Authorization', `Bearer ${controllerToken}`)
      .send({ status: 'out_of_order' });

    const res = await request(app)
      .patch(`/api/karts/${kartId}/take-charge`)
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ reportedIssue: 'Engine stall' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('in_repair');
    expect(res.body.assignedMechanicId).toBe(mechanic.id);
  });

  test('Admin cannot delete a kart that is in_repair', async () => {
    const createRes = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K04' });
    const kartId = createRes.body.id;

    await request(app)
      .patch(`/api/karts/${kartId}/status`)
      .set('Authorization', `Bearer ${controllerToken}`)
      .send({ status: 'out_of_order' });

    await request(app)
      .patch(`/api/karts/${kartId}/take-charge`)
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ reportedIssue: 'Brake issue' });

    const deleteRes = await request(app)
      .delete(`/api/karts/${kartId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toBe(409);
  });

  test('Full repair loop sets kart back to functional', async () => {
    const createRes = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ kartNumber: 'K05' });
    const kartId = createRes.body.id;

    await request(app)
      .patch(`/api/karts/${kartId}/status`)
      .set('Authorization', `Bearer ${controllerToken}`)
      .send({ status: 'out_of_order' });

    await request(app)
      .patch(`/api/karts/${kartId}/take-charge`)
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ reportedIssue: 'Tire flat' });

    const completeRes = await request(app)
      .patch(`/api/karts/${kartId}/complete-repair`)
      .set('Authorization', `Bearer ${mechanicToken}`);

    expect(completeRes.statusCode).toBe(200);
    expect(completeRes.body.status).toBe('functional');
    expect(completeRes.body.assignedMechanicId).toBeNull();
  });
});
