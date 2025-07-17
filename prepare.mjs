#!/usr/bin/env node
// Template generation, do not manually modify
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function main() {
    try {
        // Check if husky command exists
        const checkCommand =
            process.platform === 'win32' ? 'where husky' : 'which husky';
        await execAsync(checkCommand, { stdio: 'ignore' });

        // If husky exists, install it
        console.log('Installing husky...');
        await execAsync('husky install');
        console.log('Husky installed successfully');
    } catch (error) {
        // Husky not found or install failed, skip silently
        console.log('Husky not found or install skipped');
    }
}

main();
