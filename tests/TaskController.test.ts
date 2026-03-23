import request from "supertest";
import express from "express";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../src/data-source";
import { Task } from "../src/models/Task";

let app: express.Application;
let taskRepo: any;

beforeAll(async () => {
    // Ensure separate test database namespace to avoid thread-locking with Model tests
    (AppDataSource.options as any).database = "test_db_controller.sqlite";
    await AppDataSource.initialize();

    taskRepo = AppDataSource.getRepository(Task);

    // Require routing AFTER DB initialization to feed DB to the controller DAO
    const taskRoutes = require("../src/routes/taskRoutes").default;

    // Bootstrapping test app equivalent to actual setup
    app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "../views"));
    app.use("/", taskRoutes);
});

afterAll(async () => {
    await AppDataSource.destroy();
    if (fs.existsSync("test_db_controller.sqlite")) {
        fs.unlinkSync("test_db_controller.sqlite");
    }
});

beforeEach(async () => {
    await taskRepo.clear();
    // Suppress console.errors in test output for simulated failures
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("TaskController & Routing Integration Tests", () => {

    describe("GET / (Index view)", () => {
        it("should return 200 and render empty state if no tasks exist", async () => {
            const res = await request(app).get("/");
            expect(res.status).toBe(200);
            expect(res.text).toContain("No tasks found");
        });

        it("should return 200 and list stored tasks with correctly styled completion logic", async () => {
            const task = new Task();
            task.title = "Buy Groceries";
            task.description = "Milk and eggs";
            task.isCompleted = true;
            await taskRepo.save(task);

            const res = await request(app).get("/");
            expect(res.status).toBe(200);
            expect(res.text).toContain("Buy Groceries");
            expect(res.text).toContain("Milk and eggs");
            expect(res.text).toContain("completed"); // Testing conditional template rendering
        });

        it("should handle repository errors gracefully and yield 500", async () => {
            jest.spyOn(taskRepo, "find").mockRejectedValueOnce(new Error("DB Connection Error"));
            const res = await request(app).get("/");
            expect(res.status).toBe(500);
            expect(res.text).toContain("Internal Server Error");
        });
    });

    describe("GET /new (Create view)", () => {
        it("should return 200 and render the new task form successfully", async () => {
            const res = await request(app).get("/new");
            expect(res.status).toBe(200);
            expect(res.text).toContain("Create New Task");
        });
    });

    describe("POST /new (Create process)", () => {
        it("should successfully create a task and safely redirect home", async () => {
            const res = await request(app)
                .post("/new")
                .send({ title: "New Task", description: "Standard execution" });
            
            expect(res.status).toBe(302);
            expect(res.header.location).toBe("/");

            const tasks = await taskRepo.find();
            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe("New Task");
        });

        it("should trim padding spaces during creation", async () => {
            await request(app).post("/new").send({ title: " Pad ", description: " Spaced " });
            const tasks = await taskRepo.find();
            expect(tasks[0].title).toBe("Pad");
            expect(tasks[0].description).toBe("Spaced");
        });

        it("should assign empty string when description is undefined", async () => {
            await request(app).post("/new").send({ title: "No desc task" });
            const tasks = await taskRepo.find();
            expect(tasks[0].description).toBe("");
        });

        it("should validate and redirect to /new if title is strictly whitespace", async () => {
            const res = await request(app)
                .post("/new")
                .send({ title: "   ", description: "Desc" });
            
            expect(res.status).toBe(302);
            expect(res.header.location).toBe("/new");

            const tasks = await taskRepo.find();
            expect(tasks).toHaveLength(0); // Validating rejection
        });

        it("should handle unexpected DB errors via 500 response", async () => {
            jest.spyOn(taskRepo, "save").mockRejectedValueOnce(new Error("Storage Drive Dead"));
            const res = await request(app).post("/new").send({ title: "Crash Task" });
            expect(res.status).toBe(500);
        });
    });

    describe("GET /edit/:id (Edit view)", () => {
        it("should return 200 and render form accurately mapped to an existing task", async () => {
            const task = new Task();
            task.title = "Targeted Patch";
            task.isCompleted = true;
            const savedTask = await taskRepo.save(task);

            const res = await request(app).get(`/edit/${savedTask.id}`);
            expect(res.status).toBe(200);
            expect(res.text).toContain("Edit Task");
            expect(res.text).toContain("Targeted Patch");
            expect(res.text).toContain("checked"); // Verifying boolean box checked property mapping
        });

        it("should return 404 for invalid text string ID format", async () => {
            const res = await request(app).get("/edit/invalid_id");
            expect(res.status).toBe(404);
            expect(res.text).toContain("Task not found");
        });

        it("should return 404 if targeted numeric ID does not exist in the database", async () => {
            const res = await request(app).get("/edit/999");
            expect(res.status).toBe(404);
        });

        it("should catch system errors and failover with a 500 block", async () => {
            jest.spyOn(taskRepo, "findOneBy").mockRejectedValueOnce(new Error("DB Read Failed"));
            const res = await request(app).get("/edit/1");
            expect(res.status).toBe(500);
        });
    });

    describe("POST /edit/:id (Update process)", () => {
        it("should cleanly apply updates against an existing task record and redirect out", async () => {
            const task = new Task();
            task.title = "Old Legacy Value";
            const savedTask = await taskRepo.save(task);

            const res = await request(app)
                .post(`/edit/${savedTask.id}`)
                .send({ title: "New Title Value", description: "New Spec", isCompleted: "on" });
            
            expect(res.status).toBe(302);
            expect(res.header.location).toBe("/");

            const updatedTask = await taskRepo.findOneBy({ id: savedTask.id });
            expect(updatedTask.title).toBe("New Title Value");
            expect(updatedTask.description).toBe("New Spec");
            expect(updatedTask.isCompleted).toBe(true);
        });

        it("should fallback missing isCompleted (unchecked checkbox) to false", async () => {
            const task = new Task();
            task.title = "Title";
            task.isCompleted = true; // Started as true
            const savedTask = await taskRepo.save(task);

            // Resubmit with standard HTML unchecked form logic (variable fully missing)
            await request(app).post(`/edit/${savedTask.id}`).send({ title: "Title" }); 
            const updatedTask = await taskRepo.findOneBy({ id: savedTask.id });
            expect(updatedTask.isCompleted).toBe(false);
        });

        it("should return 404 if the task submitted for updating no longer exists", async () => {
            const res = await request(app).post("/edit/999").send({ title: "Ghost task" });
            expect(res.status).toBe(404);
        });

        it("should throw 500 when saving hits infrastructure issues", async () => {
            jest.spyOn(taskRepo, "findOneBy").mockRejectedValueOnce(new Error("Lost connection"));
            const res = await request(app).post("/edit/1").send({ title: "Title" });
            expect(res.status).toBe(500);
        });
    });

    describe("POST /delete/:id (Delete process)", () => {
        it("should purge a confirmed task row and redirect back to dashboard index", async () => {
            const task = new Task();
            task.title = "Remove Me";
            const savedTask = await taskRepo.save(task);

            const res = await request(app).post(`/delete/${savedTask.id}`);
            expect(res.status).toBe(302);
            expect(res.header.location).toBe("/");

            const tasks = await taskRepo.find();
            expect(tasks).toHaveLength(0);
        });

        it("should execute gracefully with no DB errors if task was already wiped (Idempotency)", async () => {
            const res = await request(app).post("/delete/999");
            expect(res.status).toBe(302);
            expect(res.header.location).toBe("/");
        });

        it("should block request progression to 500 if DB is unresponsive on removals", async () => {
            jest.spyOn(taskRepo, "findOneBy").mockRejectedValueOnce(new Error("DB Down"));
            const res = await request(app).post("/delete/1");
            expect(res.status).toBe(500);
        });
    });
});
