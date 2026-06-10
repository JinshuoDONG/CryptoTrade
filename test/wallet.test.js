/**
 * Wallet Service 单元测试（mock Firebase）
 * 运行: npx vitest run test/wallet.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// Mock firebase/firestore
// ============================================================
const mockStore = {};
const mockTransactions = [];

const mockFirestore = {
  doc: vi.fn((db, coll, id) => ({ _coll: coll, _id: id })),
  getDoc: vi.fn(async (ref) => {
    const data = mockStore[`${ref._coll}/${ref._id}`];
    return { exists: () => !!data, data: () => data || null };
  }),
  setDoc: vi.fn(async (ref, data) => {
    mockStore[`${ref._coll}/${ref._id}`] = data;
  }),
  updateDoc: vi.fn(async (ref, updates) => {
    const key = `${ref._coll}/${ref._id}`;
    mockStore[key] = { ...(mockStore[key] || {}), ...updates };
  }),
  collection: vi.fn((db, name) => ({ _name: name })),
  addDoc: vi.fn(async (ref, data) => {
    const id = 'txn_' + Date.now() + Math.random().toString(36).slice(2, 6);
    mockTransactions.push({ id, ...data });
    return { id };
  }),
  query: vi.fn((ref, ...constraints) => ({ _name: ref._name, _constraints: constraints })),
  where: vi.fn((field, op, value) => ({ type: 'where', field, op, value })),
  orderBy: vi.fn((field, dir) => ({ type: 'orderBy', field, dir })),
  getDocs: vi.fn(async (q) => {
    const txs = mockTransactions.filter(t => t.userId === 'test-uid');
    return { forEach: (cb) => txs.forEach(doc => cb({ id: doc.id, data: () => doc })) };
  }),
  serverTimestamp: () => new Date().toISOString(),
};

vi.mock('firebase/firestore', () => mockFirestore);

// Mock FirebaseConfig
vi.mock('@/FirebaseConfig', () => ({
  db: { _mock: true },
  auth: { currentUser: { uid: 'test-uid', email: 'test@test.com' } },
  default: {},
}));

// Mock '../../FirebaseConfig' (relative path used by walletService)
vi.mock('../src/FirebaseConfig.js', () => ({
  db: { _mock: true },
  auth: { currentUser: { uid: 'test-uid', email: 'test@test.com' } },
  default: {},
}));

// ============================================================
// Tests
// ============================================================
describe('getUserWallet', () => {
  beforeEach(() => {
    Object.keys(mockStore).forEach(k => delete mockStore[k]);
    mockTransactions.length = 0;
  });

  it('creates a new wallet if none exists', async () => {
    const { getUserWallet } = await import('../src/page/Wallet/walletService.js?' + Date.now());
    const wallet = await getUserWallet('test-uid');
    expect(wallet.balance).toBe(0);
    expect(wallet.userId).toBe('test-uid');
    expect(wallet.walletId).toMatch(/^#/);
  });

  it('returns existing wallet', async () => {
    mockStore['wallets/test-uid'] = { userId: 'test-uid', balance: 500, walletId: '#abc123' };
    const { getUserWallet } = await import('../src/page/Wallet/walletService.js?' + Date.now() + '2');
    const wallet = await getUserWallet('test-uid');
    expect(wallet.balance).toBe(500);
    expect(wallet.walletId).toBe('#abc123');
  });
});

describe('addMoney', () => {
  beforeEach(() => {
    Object.keys(mockStore).forEach(k => delete mockStore[k]);
    mockTransactions.length = 0;
    mockStore['wallets/test-uid'] = { userId: 'test-uid', balance: 300, walletId: '#test123' };
  });

  it('adds money and updates balance', async () => {
    const { addMoney, getUserWallet } = await import('../src/page/Wallet/walletService.js?' + Date.now() + 'a');
    const result = await addMoney('test-uid', 200, 'TEST');
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(500);
  });

  it('rejects negative amount', async () => {
    const { addMoney } = await import('../src/page/Wallet/walletService.js?' + Date.now() + 'b');
    await expect(addMoney('test-uid', -10, 'TEST')).rejects.toThrow();
  });
});

describe('withdrawMoney', () => {
  beforeEach(() => {
    Object.keys(mockStore).forEach(k => delete mockStore[k]);
    mockTransactions.length = 0;
    mockStore['wallets/test-uid'] = { userId: 'test-uid', balance: 500, walletId: '#test123' };
  });

  it('withdraws and updates balance', async () => {
    const { withdrawMoney } = await import('../src/page/Wallet/walletService.js?' + Date.now() + 'wd');
    const result = await withdrawMoney('test-uid', 100);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(400);
  });

  it('rejects insufficient balance', async () => {
    const { withdrawMoney } = await import('../src/page/Wallet/walletService.js?' + Date.now() + 'wd2');
    await expect(withdrawMoney('test-uid', 1000)).rejects.toThrow('Insufficient');
  });
});

describe('getTransactionHistory', () => {
  beforeEach(() => {
    Object.keys(mockStore).forEach(k => delete mockStore[k]);
    mockTransactions.length = 0;
    mockTransactions.push({
      userId: 'test-uid', type: 'TOPUP', amount: 100, status: 'COMPLETED',
      description: 'Top up', balanceAfter: 100
    });
    mockTransactions.push({
      userId: 'test-uid', type: 'BUY', coinSymbol: 'btc', coinAmount: 0.001,
      usdAmount: 50, price: 50000, status: 'COMPLETED',
      description: 'Bought BTC', balanceAfter: 50
    });
    mockTransactions.push({
      userId: 'other-uid', type: 'TOPUP', amount: 500, status: 'COMPLETED',
      description: 'Other user', balanceAfter: 500
    });
  });

  it('returns only own transactions', async () => {
    const { getTransactionHistory } = await import('../src/page/Wallet/walletService.js?' + Date.now() + 'tx');
    const txs = await getTransactionHistory('test-uid', 20);
    expect(txs.length).toBe(2);
    expect(txs.every(t => t.userId === 'test-uid')).toBe(true);
  });
});
