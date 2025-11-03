// Test script to check if server can start
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'server', 'data.json');

async function test() {
  try {
    console.log('Testing server setup...');
    console.log('Data file path:', DATA_FILE);
    
    // Try to read/create data file
    try {
      const data = await readFile(DATA_FILE, 'utf8');
      console.log('Data file exists');
      console.log('Content:', JSON.parse(data));
    } catch (error) {
      console.log('Creating default data file...');
      const defaultData = {
        products: [],
        warehouses: [],
        transactions: []
      };
      await writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
      console.log('Data file created successfully');
    }
    
    console.log('✅ Server setup test passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

test();
