/**
 * Database client with dual-mode support:
 * 1. Connects to PostgreSQL via Prisma if available.
 * 2. Seamlessly falls back to local JSON-backed storage if Postgres is not running.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

let useFallback = false;
const fallbackDataFile = path.resolve(process.cwd(), 'data_store.json');

// Initialize in-memory / local JSON store
let store = {
  users: [],
  resumes: [],
  jobDescriptions: [],
  analyses: [],
  skills: [],
};

if (fs.existsSync(fallbackDataFile)) {
  try {
    store = JSON.parse(fs.readFileSync(fallbackDataFile, 'utf8'));
  } catch (e) {
    // start with empty store
  }
}

function saveStore() {
  try {
    fs.writeFileSync(fallbackDataFile, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist store:', e);
  }
}

// Fallback Prisma-compatible query interface
const fallbackDb = {
  $connect: async () => {
    console.log('✓ Local Store active (Zero-config local mode)');
    return true;
  },
  $disconnect: async () => {},

  user: {
    findUnique: async ({ where }) => {
      if (where.id) return store.users.find(u => u.id === where.id) || null;
      if (where.email) return store.users.find(u => u.email === where.email) || null;
      return null;
    },
    create: async ({ data }) => {
      const user = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      store.users.push(user);
      saveStore();
      return user;
    },
  },

  resume: {
    findFirst: async ({ where, include }) => {
      const r = store.resumes.find(item => {
        let match = true;
        if (where.id && item.id !== where.id) match = false;
        if (where.userId && item.userId !== where.userId) match = false;
        return match;
      });
      if (!r) return null;
      const res = { ...r };
      if (include?.analyses) {
        res.analyses = store.analyses
          .filter(a => a.resumeId === r.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return res;
    },
    findMany: async ({ where = {}, orderBy, select, include }) => {
      let results = store.resumes.filter(item => {
        if (where.userId && item.userId !== where.userId) return false;
        return true;
      });
      if (orderBy?.createdAt === 'desc' || orderBy?.version === 'desc') {
        results = [...results].reverse();
      }
      return results.map(r => {
        const item = { ...r };
        if (include?.analyses) {
          item.analyses = store.analyses
            .filter(a => a.resumeId === r.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return item;
      });
    },
    count: async ({ where = {} }) => {
      return store.resumes.filter(item => {
        if (where.userId && item.userId !== where.userId) return false;
        return true;
      }).length;
    },
    create: async ({ data }) => {
      const resume = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      store.resumes.push(resume);
      saveStore();
      return resume;
    },
  },

  jobDescription: {
    findFirst: async ({ where }) => {
      return store.jobDescriptions.find(item => {
        if (where.id && item.id !== where.id) return false;
        if (where.userId && item.userId !== where.userId) return false;
        return true;
      }) || null;
    },
    findUnique: async ({ where }) => {
      return store.jobDescriptions.find(item => item.id === where.id) || null;
    },
    findMany: async ({ where = {}, orderBy }) => {
      let list = store.jobDescriptions.filter(item => {
        if (where.userId && item.userId !== where.userId) return false;
        return true;
      });
      if (orderBy?.createdAt === 'desc') list = [...list].reverse();
      return list;
    },
    create: async ({ data }) => {
      const jd = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      store.jobDescriptions.push(jd);
      saveStore();
      return jd;
    },
  },

  analysis: {
    findFirst: async ({ where, include }) => {
      const a = store.analyses.find(item => item.id === where.id);
      if (!a) return null;
      const res = { ...a };
      if (include?.resume) {
        res.resume = store.resumes.find(r => r.id === a.resumeId) || { userId: '', fileName: '' };
      }
      if (include?.jobDescription && a.jobDescriptionId) {
        res.jobDescription = store.jobDescriptions.find(j => j.id === a.jobDescriptionId) || null;
      }
      return res;
    },
    findMany: async ({ where = {}, orderBy, include }) => {
      let results = store.analyses;
      if (where.resume?.userId) {
        const userResumeIds = new Set(store.resumes.filter(r => r.userId === where.resume.userId).map(r => r.id));
        results = results.filter(a => userResumeIds.has(a.resumeId));
      }
      if (orderBy?.createdAt === 'desc') results = [...results].reverse();
      return results.map(a => {
        const item = { ...a };
        if (include?.resume) item.resume = store.resumes.find(r => r.id === a.resumeId);
        if (include?.jobDescription && a.jobDescriptionId) {
          item.jobDescription = store.jobDescriptions.find(j => j.id === a.jobDescriptionId);
        }
        return item;
      });
    },
    create: async ({ data }) => {
      const analysis = { id: uuidv4(), ...data, createdAt: new Date().toISOString() };
      store.analyses.push(analysis);
      saveStore();
      return analysis;
    },
    update: async ({ where, data }) => {
      const idx = store.analyses.findIndex(a => a.id === where.id);
      if (idx !== -1) {
        store.analyses[idx] = { ...store.analyses[idx], ...data };
        saveStore();
        return store.analyses[idx];
      }
      return null;
    },
  },
};

const realPrisma = new PrismaClient({
  log: ['error'],
});

const prismaProxy = new Proxy(realPrisma, {
  get(target, prop) {
    if (useFallback) {
      return fallbackDb[prop] || target[prop];
    }
    if (prop === '$connect') {
      return async () => {
        try {
          await target.$connect();
          console.log('✓ Connected to PostgreSQL via Prisma');
        } catch (err) {
          console.warn('⚠️  PostgreSQL connection failed, switching to local store:', err.message);
          useFallback = true;
          await fallbackDb.$connect();
        }
      };
    }
    return target[prop];
  },
});

export default prismaProxy;
