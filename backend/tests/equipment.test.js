const request = require('supertest');
const app = require('../server');
const { initializeDatabase, User, Kart, StockItem } = require('./setup');
const { hashPassword } = require('../utils/password');

describe('Equipment Requests & Stock', () => {
  let adminToken;
  let mechanicToken;
  let kartId;
  let stockItem;

  beforeEach(async () => {
    await initializeDatabase();

    await User.create({
      fullName: 'Admin',
      email: 'admin@test.com',
      password: await hashPassword('Admin123!'),
      role: 'admin',
      mustChangePassword: false,
      isActive: true,
    });

    const mechanic = await User.create({
      fullName: 'Mechanic',
      email: 'mech@test.com',
      password: await hashPassword('Mech123!'),
      role: 'mechanic',
      mustChangePassword: false,
      isActive: true,
    });

    const controller = await User.create({
      fullName: 'Controller',
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

    // Create a kart and put it in_repair
    const kartRes = await request(app)
      .post('/api/karts')
      .set('Authorization', `Bearer ${a.body.token}`)
      .send({ kartNumber: 'EQ01' });
    kartId = kartRes.body.id;

    await request(app)
      .patch(`/api/karts/${kartId}/status`)
      .set('Authorization', `Bearer ${c.body.token}`)
      .send({ status: 'out_of_order' });

    await request(app)
      .patch(`/api/karts/${kartId}/take-charge`)
      .set('Authorization', `Bearer ${m.body.token}`)
      .send({ reportedIssue: 'Brake pads worn' });

    // Create a stock item for the admin to approve against
    stockItem = await StockItem.create({ name: 'Brake Pad', quantity: 10, lowStockThreshold: 2 });
  });

  test('Mechanic can create an equipment request', async () => {
    const res = await request(app)
      .post('/api/equipment-requests')
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ itemName: 'Brake Pad', quantityRequested: 2, kartId });

    expect(res.statusCode).toBe(201);
    expect(res.body.itemName).toBe('Brake Pad');
    expect(res.body.status).toBe('pending');
  });

  test('Admin approval deducts stock', async () => {
    const reqRes = await request(app)
      .post('/api/equipment-requests')
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ itemName: 'Brake Pad', quantityRequested: 3, kartId });

    const equipReqId = reqRes.body.id;

    const approveRes = await request(app)
      .patch(`/api/equipment-requests/${equipReqId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stockItemId: stockItem.id, quantity: 3 });

    expect(approveRes.statusCode).toBe(200);

    // Stock should be reduced from 10 to 7
    const updated = await StockItem.findByPk(stockItem.id);
    expect(updated.quantity).toBe(7);
  });

  test('Admin cannot approve more than available stock', async () => {
    const reqRes = await request(app)
      .post('/api/equipment-requests')
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ itemName: 'Brake Pad', quantityRequested: 20, kartId });

    const equipReqId = reqRes.body.id;

    const approveRes = await request(app)
      .patch(`/api/equipment-requests/${equipReqId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stockItemId: stockItem.id, quantity: 20 });

    expect(approveRes.statusCode).toBe(409);

    // Stock should be unchanged
    const unchanged = await StockItem.findByPk(stockItem.id);
    expect(unchanged.quantity).toBe(10);
  });

  test('Admin can reject a request', async () => {
    const reqRes = await request(app)
      .post('/api/equipment-requests')
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ itemName: 'Brake Pad', quantityRequested: 2, kartId });

    const rejectRes = await request(app)
      .patch(`/api/equipment-requests/${reqRes.body.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(rejectRes.statusCode).toBe(200);
    expect(rejectRes.body.request.status).toBe('rejected');
  });

  test('Cannot approve an already resolved request', async () => {
    const reqRes = await request(app)
      .post('/api/equipment-requests')
      .set('Authorization', `Bearer ${mechanicToken}`)
      .send({ itemName: 'Brake Pad', quantityRequested: 1, kartId });

    const id = reqRes.body.id;

    // First approval
    await request(app)
      .patch(`/api/equipment-requests/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stockItemId: stockItem.id, quantity: 1 });

    // Second approval attempt
    const secondRes = await request(app)
      .patch(`/api/equipment-requests/${id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stockItemId: stockItem.id, quantity: 1 });

    expect(secondRes.statusCode).toBe(409);
    expect(secondRes.body.message).toContain('already been resolved');
  });
});
