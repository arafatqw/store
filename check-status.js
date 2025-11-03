// Script to check if servers are running
import http from 'http';

function checkServer(port, name) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 2000
      },
      (res) => {
        console.log(`✅ ${name} (Port ${port}): Running - Status ${res.statusCode}`);
        resolve(true);
      }
    );

    req.on('error', () => {
      console.log(`❌ ${name} (Port ${port}): Not running`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${name} (Port ${port}): Timeout`);
      resolve(false);
    });

    req.end();
  });
}

async function checkAll() {
  console.log('Checking servers status...\n');
  
  const backendRunning = await checkServer(3001, 'Backend Server');
  const frontendRunning = await checkServer(3000, 'Frontend (Vite)');

  console.log('\n--- Summary ---');
  if (backendRunning && frontendRunning) {
    console.log('✅ Both servers are running!');
    console.log('🌐 Open http://localhost:3000 in your browser');
  } else if (!backendRunning && !frontendRunning) {
    console.log('❌ Both servers are not running');
    console.log('\nTo start:');
    console.log('1. Backend: cd server && node server.js');
    console.log('2. Frontend: cd client && npm run dev');
  } else if (!backendRunning) {
    console.log('❌ Backend is not running');
    console.log('Run: cd server && node server.js');
  } else {
    console.log('❌ Frontend is not running');
    console.log('Run: cd client && npm run dev');
  }
}

checkAll();
