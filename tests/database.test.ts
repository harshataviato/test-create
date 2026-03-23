import { AppDataSource } from '../src/database';
import { User } from '../src/models/User';

describe('Database Configuration', () => {
    it('should have correct TypeORM settings for local SQLite development', () => {
        expect(AppDataSource.options.type).toBe('sqlite');
        expect(AppDataSource.options.database).toBe('database.sqlite');
        expect(AppDataSource.options.synchronize).toBe(true);
        expect(AppDataSource.options.logging).toBe(false);
        expect(AppDataSource.options.entities).toContain(User);
    });
});
