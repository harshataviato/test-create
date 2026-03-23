import { User } from '../../src/models/User';

describe('User Model', () => {
    it('should create a User instance with expected properties', () => {
        const user = new User();
        user.id = 1;
        user.firstName = 'Alice';
        user.lastName = 'Smith';
        user.email = 'alice@example.com';
        user.isActive = true;

        expect(user.id).toBe(1);
        expect(user.firstName).toBe('Alice');
        expect(user.lastName).toBe('Smith');
        expect(user.email).toBe('alice@example.com');
        expect(user.isActive).toBe(true);
    });
});
