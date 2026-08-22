import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/db.json');

const isPostgres = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));

let pgPool = null;
let localStore = null;

if (isPostgres) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
}

export function loadLocalStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      localStore = JSON.parse(raw);
    } else {
      localStore = {
        users: [],
        trips: [],
        cities: [],
        stops: [],
        activities: [],
        community_posts: []
      };
      saveLocalStore();
    }
  } catch (err) {
    console.error('Error loading local database:', err);
    localStore = { users: [], trips: [], cities: [], stops: [], activities: [], community_posts: [] };
  }
  return localStore;
}

export function saveLocalStore() {
  if (!localStore) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(localStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local database:', err);
  }
}

/**
 * Universal query runner
 */
export async function query(sql, params = []) {
  if (isPostgres && pgPool) {
    const res = await pgPool.query(sql, params);
    return res;
  }

  // Local JSON SQL emulator for zero-dependency local execution
  const store = localStore || loadLocalStore();
  const lower = sql.trim().toLowerCase();

  // Handle simple migrations / DDL silently
  if (lower.startsWith('create table') || lower.startsWith('drop table') || lower.startsWith('alter table') || lower.startsWith('create index')) {
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO table (cols...) VALUES (...)
  if (lower.startsWith('insert into')) {
    const tableMatch = sql.match(/insert\s+into\s+([a-z_]+)\s*\(([^)]+)\)\s*values\s*\(([^)]+)\)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const cols = tableMatch[2].split(',').map(c => c.trim());
      const newRow = {};
      
      cols.forEach((col, idx) => {
        let val = params[idx];
        newRow[col] = val !== undefined ? val : null;
      });

      if (!newRow.id) newRow.id = uuidv4();
      if (!newRow.created_at) newRow.created_at = newRow.created_at || new Date().toISOString();

      if (!store[table]) store[table] = [];
      store[table].push(newRow);
      saveLocalStore();

      return { rows: [newRow], rowCount: 1 };
    }
  }

  // SELECT * FROM table WHERE ...
  if (lower.startsWith('select')) {
    const fromMatch = sql.match(/from\s+([a-z_]+)/i);
    if (fromMatch) {
      const table = fromMatch[1].toLowerCase();
      let rows = (store[table] || []).map(r => ({ ...r }));

      // Handle simple WHERE id = $1 or WHERE user_id = $1 or WHERE email = $1
      if (sql.includes('WHERE') || sql.includes('where')) {
        const whereClause = sql.split(/where/i)[1].split(/order by|limit|group by/i)[0].trim();
        
        // Single param match: id = $1
        const paramMatches = [...whereClause.matchAll(/([a-z_]+)\s*(=|ilike|like|<|>|<=|>=)\s*\$(\d+)/gi)];
        if (paramMatches.length > 0) {
          rows = rows.filter(row => {
            return paramMatches.every(m => {
              const col = m[1];
              const op = m[2].toLowerCase();
              const pIdx = parseInt(m[3], 10) - 1;
              const pVal = params[pIdx];

              if (op === '=') return String(row[col]) === String(pVal);
              if (op === 'like' || op === 'ilike') {
                const searchStr = String(pVal).replace(/%/g, '').toLowerCase();
                return String(row[col] || '').toLowerCase().includes(searchStr);
              }
              if (op === '<') return row[col] < pVal;
              if (op === '>') return row[col] > pVal;
              return true;
            });
          });
        }
      }

      // Handle ORDER BY
      if (/order\s+by/i.test(sql)) {
        const orderMatch = sql.match(/order\s+by\s+([a-z_]+)(\s+desc|\s+asc)?/i);
        if (orderMatch) {
          const col = orderMatch[1];
          const isDesc = (orderMatch[2] || '').trim().toLowerCase() === 'desc';
          rows.sort((a, b) => {
            if (a[col] < b[col]) return isDesc ? 1 : -1;
            if (a[col] > b[col]) return isDesc ? -1 : 1;
            return 0;
          });
        }
      }

      // Handle LIMIT
      if (/limit\s+\$(\d+)|\d+/i.test(sql)) {
        const limitMatch = sql.match(/limit\s+(\$(\d+)|\d+)/i);
        if (limitMatch) {
          let limit = limitMatch[2] ? params[parseInt(limitMatch[2], 10) - 1] : parseInt(limitMatch[1], 10);
          rows = rows.slice(0, limit);
        }
      }

      return { rows, rowCount: rows.length };
    }
  }

  // UPDATE table SET col = $1 WHERE ...
  if (lower.startsWith('update')) {
    const tableMatch = sql.match(/update\s+([a-z_]+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const storeTable = store[table] || [];

      // Find where condition
      const whereMatch = sql.match(/where\s+([a-z_]+)\s*=\s*\$(\d+)/i);
      let updatedRows = [];

      if (whereMatch) {
        const whereCol = whereMatch[1];
        const whereParamIdx = parseInt(whereMatch[2], 10) - 1;
        const whereVal = params[whereParamIdx];

        // Parse SET col1 = $1, col2 = $2
        const setPart = sql.split(/set/i)[1].split(/where/i)[0].trim();
        const setMatches = [...setPart.matchAll(/([a-z_]+)\s*=\s*\$(\d+)/gi)];

        storeTable.forEach(row => {
          if (String(row[whereCol]) === String(whereVal)) {
            setMatches.forEach(sm => {
              const col = sm[1];
              const pIdx = parseInt(sm[2], 10) - 1;
              row[col] = params[pIdx];
            });
            updatedRows.push({ ...row });
          }
        });
        saveLocalStore();
      }
      return { rows: updatedRows, rowCount: updatedRows.length };
    }
  }

  // DELETE FROM table WHERE ...
  if (lower.startsWith('delete from')) {
    const tableMatch = sql.match(/delete\s+from\s+([a-z_]+)/i);
    if (tableMatch) {
      const table = tableMatch[1].toLowerCase();
      const whereMatch = sql.match(/where\s+([a-z_]+)\s*=\s*\$(\d+)/i);

      if (whereMatch) {
        const whereCol = whereMatch[1];
        const whereVal = params[parseInt(whereMatch[2], 10) - 1];

        const prevLen = (store[table] || []).length;
        store[table] = (store[table] || []).filter(r => String(r[whereCol]) !== String(whereVal));
        saveLocalStore();

        return { rows: [], rowCount: prevLen - store[table].length };
      }
    }
  }

  return { rows: [], rowCount: 0 };
}

export function getLocalStore() {
  return localStore || loadLocalStore();
}

export function setLocalStore(data) {
  localStore = data;
  saveLocalStore();
}

export { isPostgres, pgPool };
