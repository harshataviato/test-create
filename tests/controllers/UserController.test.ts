import { Request, Response } from 'express';

// Setup Mock Repository BEFORE importing Controller
const mockFind = jest.fn();
const mockFindOneBy = jest.fn();
const mockSave = jest.fn();
const mockRemove = jest.fn();

jest.mock('../../src/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(() => ({
            find: mockFind,
            findOneBy: mockFindOneBy,
            save: mockSave,
            remove: mockRemove
        }))
    }
}));

import { UserController } from '../../src/controllers/UserController';
import { User } from '../../src/models/User';

describe('UserController', () => {
    let userController: UserController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        userController = new UserController();
        req = {
            body: {},
            params: {}
        };
        res = {
            render: jest.fn(),
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        // Suppress console logs during tests to keep output clean
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should fetch users and render the index view', async () => {
            const users = [{ id: 1, firstName: 'John' }];
            mockFind.mockResolvedValue(users);

            await userController.getAllUsers(req as Request, res as Response);

            expect(mockFind).toHaveBeenCalledWith({ order: { id: 'DESC' } });
            expect(res.render).toHaveBeenCalledWith('users/index', { users });
        });

        it('should handle repository errors gracefully', async () => {
            mockFind.mockRejectedValue(new Error('DB Error'));

            await userController.getAllUsers(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });

    describe('getCreateForm', () => {
        it('should render the creation form with no error', () => {
            userController.getCreateForm(req as Request, res as Response);
            expect(res.render).toHaveBeenCalledWith('users/create', { error: null });
        });
    });

    describe('createUser', () => {
        it('should render error if missing mandatory fields', async () => {
            req.body = { firstName: 'John' }; // Missing lastName and email

            await userController.createUser(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith('users/create', {
                error: 'All fields (First Name, Last Name, Email) are required.'
            });
            expect(mockSave).not.toHaveBeenCalled();
        });

        it('should render error if email already exists', async () => {
            req.body = { firstName: 'John', lastName: 'Doe', email: 'test@test.com' };
            mockFindOneBy.mockResolvedValue(new User());

            await userController.createUser(req as Request, res as Response);

            expect(mockFindOneBy).toHaveBeenCalledWith({ email: 'test@test.com' });
            expect(res.render).toHaveBeenCalledWith('users/create', {
                error: 'A user with this email already exists.'
            });
        });

        it('should save new user and redirect to list', async () => {
            req.body = { firstName: 'John', lastName: 'Doe', email: 'test@test.com' };
            mockFindOneBy.mockResolvedValue(null);

            await userController.createUser(req as Request, res as Response);

            expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
                firstName: 'John',
                lastName: 'Doe',
                email: 'test@test.com',
                isActive: true
            }));
            expect(res.redirect).toHaveBeenCalledWith('/users');
        });

        it('should handle save errors gracefully', async () => {
            req.body = { firstName: 'John', lastName: 'Doe', email: 'test@test.com' };
            mockFindOneBy.mockResolvedValue(null);
            mockSave.mockRejectedValue(new Error('DB Save Error'));

            await userController.createUser(req as Request, res as Response);

            expect(res.render).toHaveBeenCalledWith('users/create', {
                error: 'An unexpected error occurred while saving.'
            });
        });
    });

    describe('deleteUser', () => {
        it('should delete existing user and redirect', async () => {
            req.params = { id: '1' };
            const user = new User();
            mockFindOneBy.mockResolvedValue(user);

            await userController.deleteUser(req as Request, res as Response);

            expect(mockFindOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(mockRemove).toHaveBeenCalledWith(user);
            expect(res.redirect).toHaveBeenCalledWith('/users');
        });

        it('should redirect if user to delete is not found', async () => {
            req.params = { id: '99' };
            mockFindOneBy.mockResolvedValue(null);

            await userController.deleteUser(req as Request, res as Response);

            expect(mockRemove).not.toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith('/users');
        });

        it('should handle deletion errors gracefully', async () => {
            req.params = { id: '1' };
            mockFindOneBy.mockRejectedValue(new Error('DB Error'));

            await userController.deleteUser(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith('Internal Server Error');
        });
    });
});
