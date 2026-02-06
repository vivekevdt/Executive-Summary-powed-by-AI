import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Paths to storage directories
const STORAGE_DIR = path.join(__dirname, '../src/storage');
const DIRS_TO_CLEAN = [
    'generated',
    'generatedSummary',
    'uploads'
];
const METADATA_FILE = path.join(STORAGE_DIR, 'metadata.json');

async function cleanDatabase() {
    console.log('🗑️  Cleaning Database...');

    try {
        // Delete in order to respect foreign key constraints
        // 1. Delete Reports (depend on User and Business)
        const deletedReports = await prisma.report.deleteMany({});
        console.log(`   - Deleted ${deletedReports.count} reports`);

        // 2. Delete Users (depend on Business)
        const deletedUsers = await prisma.user.deleteMany({});
        console.log(`   - Deleted ${deletedUsers.count} users`);

        // 3. Delete Businesses
        const deletedBusinesses = await prisma.business.deleteMany({});
        console.log(`   - Deleted ${deletedBusinesses.count} businesses`);

        console.log('✅ Database cleared successfully.');
    } catch (error) {
        console.error('❌ Error clearing database:', error);
        process.exit(1);
    }
}

async function cleanStorage() {
    console.log('🗑️  Cleaning Storage Files...');

    for (const dirName of DIRS_TO_CLEAN) {
        const dirPath = path.join(STORAGE_DIR, dirName);

        if (fs.existsSync(dirPath)) {
            try {
                // Read all files in the directory
                const files = fs.readdirSync(dirPath);

                for (const file of files) {
                    const curPath = path.join(dirPath, file);
                    // Keep the .gitignore if it exists, delete everything else
                    if (file !== '.gitignore') {
                        if (fs.lstatSync(curPath).isDirectory()) {
                            fs.rmSync(curPath, { recursive: true, force: true });
                        } else {
                            fs.unlinkSync(curPath);
                        }
                    }
                }
                console.log(`   - Cleared directory: ${dirName}`);
            } catch (err) {
                console.error(`   ❌ Error cleaning directory ${dirName}:`, err.message);
            }
        } else {
            console.log(`   - Directory not found (skipping): ${dirName}`);
        }
    }

    // Reset metadata.json
    if (fs.existsSync(METADATA_FILE)) {
        try {
            fs.writeFileSync(METADATA_FILE, '[]', 'utf8'); // Reset to empty array
            console.log('   - Reset metadata.json to []');
        } catch (err) {
            console.error('   ❌ Error resetting metadata.json:', err.message);
        }
    }

    console.log('✅ Storage files cleared successfully.');
}

async function main() {
    console.log('⚠️  STARTING FULL SYSTEM RESET ⚠️');
    console.log('This will permanently delete all data from the database and all generated files.');
    // Optional: Add a 5 second delay to allow cancelling
    console.log('Starting in 3 seconds... (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await cleanDatabase();
    await cleanStorage();
    await seedDatabase();

    console.log('\n✨ System Reset & Seeding Complete ✨');
    await prisma.$disconnect();
}

async function seedDatabase() {
    console.log('🌱 Seeding dummy data...');
    try {
        await prisma.user.create({
            data: {
                email: 'admin@adventz.com',
                password: 'admin@gmail.com',
                role: 'admin@1234'
            }
        });
        console.log('   - Created dummy admin user: admin@adventz.com / admin');
    } catch (error) {
        console.error('   ❌ Error seeding data:', error);
    }
}

main();
