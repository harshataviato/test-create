import { AppDataSource } from '../src/database';
import express from 'express';

// Mock database to prevent actual initialization during index file testing
jest.mock('../src/database', () => {
    return {
        AppDataSource: {
            initialize: jest.fn().mockResolvedValue(true),
            getRepository: jest.fn().mockReturnValue({}),
        }
    };
});

// Mock express to capture `.listen()` and prevent port bindings
jest.mock('express', () => {
    const mockListen = jest.fn();
    const mockApp = {
        use: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        listen: mockListen
    };
    const expressMock: any = () => mockApp;
    expressMock.urlencoded = jest.fn();
    expressMock.json = jest.fn();
    expressMock.mockListen = mockListen;
    return expressMock;
});

describe('Index Entry Point', () => {
    let originalConsoleLog: any;
    let originalConsoleError: any;
    let originalProcessExit: any;

    beforeEach(() => {
        originalConsoleLog = console.log;
        originalConsoleError = console.error;
        originalProcessExit = process.exit;

        console.log = jest.fn();
        console.error = jest.fn();
        process.exit = jest.fn() as any;
        jest.clearAllMocks();
    });

    afterEach(() => {
        console.log = originalConsoleLog;
        console.error = originalConsoleError;
        process.exit = originalProcessExit;
    });

    it('should initialize database and start server successfully', async () => {
        // Isolate module to force re-evaluation of index.ts
        jest.isolateModules(() => {
            require('../src/index');
        });

        // Yield to event loop to allow promises to resolve
        await new Promise(process.nextTick);

        expect(AppDataSource.initialize).toHaveBeenCalled();

        const mockListen = (express as any).mockListen;
        expect(mockListen).toHaveBeenCalledWith(
            process.env.PORT || 3000,
            expect.any(Function)
        );

        // Execute the listen callback to cover console.log
        const listenCallback = mockListen.mock.calls[0][1];
        listenCallback();

        expect(console.log).toHaveBeenCalledWith('Database connection established successfully.');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Server is running at http://localhost:'));
    });

    it('should log error and exit process if database initialization fails', async () => {
        const dbError = new Error('Database Failure');
        (AppDataSource.initialize as jest.Mock).mockRejectedValueOnce(dbError);

        jest.isolateModules(() => {
            require('../src/index');
        });

        await new Promise(process.nextTick);

        expect(console.error).toHaveBeenCalledWith('Error during Data Source initialization:', dbError);
        expect(process.exit).toHaveBeenCalledWith(1);
    });
});
