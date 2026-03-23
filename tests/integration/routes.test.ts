import request from 'supertest';
import express from 'express';
import path from 'path';
import { AppDataSource } from '../../src/database';
import { UserController } from '../../src/controllers/UserController';
import { User } from '../../src/models/User';

// Configure App for Integration Testing
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
// Adjust views path from tests/integration directory
app.set('views', path.join(__dirname, '../../views'));

const userController = new UserController();
app.get('/', (req, res) => res.redirect('/users'));
app.get('/users', (req, res) => userController.getAllUsers(req, res));
app.get('/users/create', (req, res) => userController.getCreateForm(req, res));
app.post('/users/create', (req, res) => userController.createUser(req, res));
app.post('/users/delete/:id', (req, res) => userController.deleteUser(req, res));

describe('Integration Routes', () => {
    // Setup In-Memory DB exclusively for integration tests
    beforeAll(async () => {
        AppDataSource.setOptions({
            database: ':memory:', // Purely in-memory
            synchronize: true,
            logging: false,
        });
        await AppDataSource.initialize();
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    beforeEach(async () => {
        // Truncate table before each test for total test isolation
        await AppDataSource.getRepository(User).clear();
    });

    it('GET / should redirect to /users', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(302);
        expect(res.header.location).toBe('/users');
    });

    it('GET /users should render empty state correctly', async () => {
        const res = await request(app).get('/users');
        expect(res.status).toBe(200);
        expect(res.text).toContain('No users found.');
        expect(res.text).toContain('User Directory');
    });

    it('GET /users/create should render form correctly', async () => {
        const res = await request(app).get('/users/create');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Add New User');
        expect(res.text).toContain('<form action="/users/create" method="POST">');
    });

    it('POST /users/create should create user and show on index', async () => {
        const payload = {
            firstName: 'Integration',
            lastName: 'Test',
            email: 'integration@test.com'
        };

        // Submitting POST request
        const createRes = await request(app)
            .post('/users/create')
            .send(payload)
            .type('form'); // URL-encoded

        expect(createRes.status).toBe(302);
        expect(createRes.header.location).toBe('/users');

        // Confirm existence on index page
        const indexRes = await request(app).get('/users');
        expect(indexRes.text).toContain('Integration');
        expect(indexRes.text).toContain('integration@test.com');
    });

    it('POST /users/delete/:id should delete existing user', async () => {
        // Seed user manually
        const userRepo = AppDataSource.getRepository(User);
        const user = new User();
        user.firstName = 'To Be';
        user.lastName = 'Deleted';
        user.email = 'delete@me.com';
        user.isActive = true;
        await userRepo.save(user);

        // Delete user via route
        const deleteRes = await request(app).post(`/users/delete/${user.id}`);
        expect(deleteRes.status).toBe(302);

        // Confirm user is deleted from DB
        const found = await userRepo.findOneBy({ id: user.id });
        expect(found).toBeNull();

        // Confirm user is missing from page
        const indexRes = await request(app).get('/users');
        expect(indexRes.text).toContain('No users found.');
    });
});
