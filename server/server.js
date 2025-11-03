import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_FILE = join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper functions for file operations
async function readData() {
  try {
    const data = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(data);
    // Ensure teams array exists
    if (!parsed.teams) {
      parsed.teams = [
        { id: '1', name: 'فريق الإنترنت', color: '#3b82f6' },
        { id: '2', name: 'فريق الكهرباء', color: '#f59e0b' },
        { id: '3', name: 'فريق الماء', color: '#10b981' }
      ];
      await writeData(parsed);
    }
    return parsed;
  } catch (error) {
    // Initialize default data structure
    const defaultData = {
      products: [],
      warehouses: [],
      transactions: [],
      teams: [
        { id: '1', name: 'فريق الإنترنت', color: '#3b82f6' },
        { id: '2', name: 'فريق الكهرباء', color: '#f59e0b' },
        { id: '3', name: 'فريق الماء', color: '#10b981' }
      ]
    };
    await writeData(defaultData);
    return defaultData;
  }
}

async function writeData(data) {
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ===== WAREHOUSES API =====
app.get('/api/warehouses', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.warehouses || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/warehouses', async (req, res) => {
  try {
    const data = await readData();
    const warehouse = {
      id: uuidv4(),
      name: req.body.name,
      location: req.body.location,
      description: req.body.description || '',
      manager: req.body.manager || '',
      managerLocation: req.body.managerLocation || '',
      createdAt: new Date().toISOString()
    };
    data.warehouses.push(warehouse);
    await writeData(data);
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/warehouses/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.warehouses.findIndex(w => w.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'المخزن غير موجود' });
    }
    data.warehouses[index] = {
      ...data.warehouses[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeData(data);
    res.json(data.warehouses[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/warehouses/:id', async (req, res) => {
  try {
    const data = await readData();
    data.warehouses = data.warehouses.filter(w => w.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PRODUCTS API =====
app.get('/api/products', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.products || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const data = await readData();
    const product = {
      id: uuidv4(),
      name: req.body.name,
      code: req.body.code,
      category: req.body.category || '',
      unit: req.body.unit || 'قطعة',
      price: req.body.price || 0,
      description: req.body.description || '',
      teamId: req.body.teamId || '',
      createdAt: new Date().toISOString()
    };
    data.products.push(product);
    await writeData(data);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    data.products[index] = {
      ...data.products[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeData(data);
    res.json(data.products[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const data = await readData();
    data.products = data.products.filter(p => p.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== INVENTORY API =====
app.get('/api/inventory', async (req, res) => {
  try {
    const data = await readData();
    const { warehouseId } = req.query;
    
    // Group transactions by product and warehouse
    const inventory = {};
    
    data.transactions.forEach(transaction => {
      const key = `${transaction.productId}_${transaction.warehouseId}`;
      if (!inventory[key]) {
        inventory[key] = {
          productId: transaction.productId,
          warehouseId: transaction.warehouseId,
          quantity: 0
        };
      }
      
      if (transaction.type === 'in') {
        inventory[key].quantity += transaction.quantity;
      } else {
        inventory[key].quantity -= transaction.quantity;
      }
    });
    
    let inventoryArray = Object.values(inventory);
    
    // Filter by warehouse if specified
    if (warehouseId) {
      inventoryArray = inventoryArray.filter(inv => inv.warehouseId === warehouseId);
    }
    
    // Enrich with product and warehouse details
    let enriched = inventoryArray.map(inv => {
      const product = data.products.find(p => p.id === inv.productId);
      const warehouse = data.warehouses.find(w => w.id === inv.warehouseId);
      return {
        ...inv,
        product: product || null,
        warehouse: warehouse || null,
        quantity: inv.quantity
      };
    }).filter(inv => inv.quantity > 0 || warehouseId); // Only show items with stock unless filtering
    
    // Filter by team if specified
    const { teamId } = req.query;
    if (teamId) {
      enriched = enriched.filter(inv => inv.product && inv.product.teamId === teamId);
    }
    
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TRANSACTIONS API =====
app.get('/api/transactions', async (req, res) => {
  try {
    const data = await readData();
    let transactions = data.transactions || [];
    
    // Enrich with product and warehouse details
    transactions = transactions.map(transaction => {
      const product = data.products.find(p => p.id === transaction.productId);
      const warehouse = data.warehouses.find(w => w.id === transaction.warehouseId);
      return {
        ...transaction,
        product: product || null,
        warehouse: warehouse || null
      };
    });
    
    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const data = await readData();
    
    // Check if product and warehouse exist
    const product = data.products.find(p => p.id === req.body.productId);
    const warehouse = data.warehouses.find(w => w.id === req.body.warehouseId);
    
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود' });
    }
    if (!warehouse) {
      return res.status(404).json({ error: 'المخزن غير موجود' });
    }
    
    // For 'out' transactions, check if enough stock exists
    if (req.body.type === 'out') {
      const currentStock = await getCurrentStock(req.body.productId, req.body.warehouseId, data);
      if (currentStock < req.body.quantity) {
        return res.status(400).json({ error: 'الكمية المتوفرة غير كافية' });
      }
    }
    
    const transaction = {
      id: uuidv4(),
      productId: req.body.productId,
      warehouseId: req.body.warehouseId,
      type: req.body.type, // 'in' or 'out'
      quantity: req.body.quantity,
      notes: req.body.notes || '',
      createdAt: new Date().toISOString()
    };
    
    data.transactions.push(transaction);
    await writeData(data);
    
    // Return enriched transaction
    res.json({
      ...transaction,
      product,
      warehouse
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getCurrentStock(productId, warehouseId, data) {
  let stock = 0;
  data.transactions.forEach(transaction => {
    if (transaction.productId === productId && transaction.warehouseId === warehouseId) {
      if (transaction.type === 'in') {
        stock += transaction.quantity;
      } else {
        stock -= transaction.quantity;
      }
    }
  });
  return stock;
}

// ===== TEAMS API =====
app.get('/api/teams', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.teams || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    const data = await readData();
    const team = {
      id: uuidv4(),
      name: req.body.name,
      color: req.body.color || '#3b82f6',
      description: req.body.description || '',
      createdAt: new Date().toISOString()
    };
    data.teams.push(team);
    await writeData(data);
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/teams/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.teams.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'الفريق غير موجود' });
    }
    data.teams[index] = {
      ...data.teams[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    await writeData(data);
    res.json(data.teams[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    const data = await readData();
    data.teams = data.teams.filter(t => t.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
