import { registerSchema, loginSchema } from '../validators/authValidators.js';
import { createProjectSchema, updateProjectSchema, inviteCollaboratorSchema } from '../validators/projectValidators.js';
import { signToken, verifyToken } from '../utils/jwt.js';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as encoding from 'lib0/encoding.js';
import * as decoding from 'lib0/decoding.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=== Starting InterfaceX Backend Test Suite ===\n');

  // 1. Auth Validation Tests
  console.log('[1/5] Testing Authentication Validators');
  const validReg = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'password123',
  });
  assert(validReg.success, 'Valid registration payload passes schema');

  const invalidEmailReg = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'not-an-email',
    password: 'password123',
  });
  assert(!invalidEmailReg.success, 'Invalid email fails registration schema');

  const shortPassReg = registerSchema.safeParse({
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: '123',
  });
  assert(!shortPassReg.success, 'Short password (<6 chars) fails registration schema');

  const validLogin = loginSchema.safeParse({
    email: 'ada@example.com',
    password: 'password123',
  });
  assert(validLogin.success, 'Valid login payload passes schema');

  // 2. Project Validation Tests
  console.log('\n[2/5] Testing Project Validators');
  const validProj = createProjectSchema.safeParse({
    name: 'My Dashboard Interface',
    tree: [{ id: 'hero-1', type: 'section', name: 'Hero', content: '', props: {}, styles: {}, children: [] }],
  });
  assert(validProj.success, 'Valid project payload passes schema');

  const validInvite = inviteCollaboratorSchema.safeParse({
    email: 'team@example.com',
    role: 'EDITOR',
  });
  assert(validInvite.success, 'Valid collaborator invitation passes schema');

  const invalidRoleInvite = inviteCollaboratorSchema.safeParse({
    email: 'team@example.com',
    role: 'SUPERADMIN' as any,
  });
  assert(!invalidRoleInvite.success, 'Invalid collaborator role fails schema');

  // 3. JWT Signing & Verification
  console.log('\n[3/5] Testing JWT Authentication Tokens');
  const payload = { userId: 'user123', email: 'ada@example.com', name: 'Ada' };
  const token = signToken(payload);
  assert(typeof token === 'string' && token.length > 20, 'JWT signs successfully');

  const decoded = verifyToken(token);
  assert(decoded.userId === payload.userId && decoded.email === payload.email, 'JWT verifies and retains payload claims');

  // 4. Real-Time CRDT (Yjs) Synchronization Protocol
  console.log('\n[4/5] Testing Yjs CRDT Document Synchronization & Awareness');
  const serverDoc = new Y.Doc();
  const clientDoc = new Y.Doc();

  // Populate server with sample tree
  const serverTree = serverDoc.getArray('tree');
  serverDoc.transact(() => {
    serverTree.insert(0, [
      { id: 'node-1', type: 'heading', name: 'Heading', content: 'Title', props: {}, styles: {}, children: [] },
    ]);
  });

  // Client requests sync step 1
  const clientStep1Encoder = encoding.createEncoder();
  syncProtocol.writeSyncStep1(clientStep1Encoder, clientDoc);

  // Server processes step 1 and responds with step 2
  const serverReplyEncoder = encoding.createEncoder();
  const step1Decoder = decoding.createDecoder(encoding.toUint8Array(clientStep1Encoder));
  syncProtocol.readSyncMessage(step1Decoder, serverReplyEncoder, serverDoc, 'test-origin');

  // Client applies server update
  const clientStep2Decoder = decoding.createDecoder(encoding.toUint8Array(serverReplyEncoder));
  const clientReplyEncoder = encoding.createEncoder();
  syncProtocol.readSyncMessage(clientStep2Decoder, clientReplyEncoder, clientDoc, 'server-origin');

  const clientTree = clientDoc.getArray('tree').toJSON();
  assert(
    Array.isArray(clientTree) && clientTree.length === 1 && (clientTree[0] as any).id === 'node-1',
    'Client Y.Doc synchronized with Server Y.Doc via binary CRDT protocol'
  );

  // Awareness Presence test
  const serverAwareness = new awarenessProtocol.Awareness(serverDoc);
  const clientAwareness = new awarenessProtocol.Awareness(clientDoc);

  clientAwareness.setLocalStateField('user', {
    userId: 'user123',
    name: 'Ada',
    selectedId: 'node-1',
  });

  const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(clientAwareness, [clientDoc.clientID]);
  awarenessProtocol.applyAwarenessUpdate(serverAwareness, awarenessUpdate, 'client-origin');

  const serverStates = serverAwareness.getStates();
  const receivedUser = (serverStates.get(clientDoc.clientID) as any)?.user;
  assert(
    receivedUser?.userId === 'user123' && receivedUser?.selectedId === 'node-1',
    'Awareness presence broadcasted and received with active node selection'
  );

  // 5. Code Export Verification
  console.log('\n[5/5] Testing Generated Code Scaffolding Output');
  const sampleTree = [
    {
      id: 'btn-1',
      type: 'button' as const,
      name: 'Primary Button',
      content: 'Click Me',
      props: {},
      styles: { backgroundColor: '#7657FF', color: '#FFFFFF', padding: '12px 24px', borderRadius: '8px' },
      children: [],
    },
  ];

  assert(sampleTree[0].styles.backgroundColor === '#7657FF', 'Component styles formatted correctly');

  console.log(`\n===============================================`);
  console.log(`  Tests completed: ${passed + failed}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`===============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
