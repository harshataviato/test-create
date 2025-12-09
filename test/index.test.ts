import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('index.ts', () => {
  it('should print "Hello world!" to the console', async () => {
    const { stdout } = await execAsync('node dist/index.js');
    expect(stdout.trim()).toBe('Hello world!');
  });
});
