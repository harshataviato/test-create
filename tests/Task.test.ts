import { AppDataSource } from "../src/data-source";
import { Task } from "../src/models/Task";
import fs from "fs";

beforeAll(async () => {
    // Inject test database to preserve isolation
    (AppDataSource.options as any).database = "test_db_model.sqlite";
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy();
    if (fs.existsSync("test_db_model.sqlite")) {
        fs.unlinkSync("test_db_model.sqlite");
    }
});

beforeEach(async () => {
    // Clear out repository state between runs
    await AppDataSource.getRepository(Task).clear();
});

describe("Task Model Tests", () => {
    it("should successfully create a task with default isCompleted as false", async () => {
        const repo = AppDataSource.getRepository(Task);
        const task = new Task();
        task.title = "Unit Testing DB Model";
        
        const savedTask = await repo.save(task);
        
        expect(savedTask.id).toBeDefined();
        expect(savedTask.title).toBe("Unit Testing DB Model");
        expect(savedTask.isCompleted).toBe(false); // Validating Business Rule default
        expect(savedTask.createdAt).toBeDefined();
        expect(savedTask.updatedAt).toBeDefined();
    });

    it("should allow a nullable description", async () => {
        const repo = AppDataSource.getRepository(Task);
        const task = new Task();
        task.title = "Task with missing description";
        
        const savedTask = await repo.save(task);
        
        expect(savedTask.description).toBeNull();
    });
});
