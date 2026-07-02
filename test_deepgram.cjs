require('dotenv').config();
const { DeepgramClient } = require('@deepgram/sdk');

const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);

async function testSTT() {
  console.log('=== Test 1: v1.connect() ===');
  try {
    const conn = await deepgram.listen.v1.connect({
      model: 'nova-2',
      language: 'en-IN',
      encoding: 'mulaw',
      sample_rate: 8000,
      channels: 1,
    });
    
    console.log('v1 Connection type:', conn?.constructor?.name);
    
    conn.on('open', () => {
      console.log('✅ v1 open fired!');
    });
    conn.on('error', (err) => {
      console.log('❌ v1 error:', err?.message || err);
    });
    
    console.log('Calling v1 conn.connect()...');
    conn.connect();
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('v1 socket state:', conn.socket?.readyState);
  } catch (err) {
    console.error('v1 failed:', err.message);
  }

  console.log('\n=== Test 2: Raw WebSocket to Deepgram ===');
  const WebSocket = require('ws');
  try {
    const url = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&encoding=mulaw&sample_rate=8000&channels=1`;
    const ws = new WebSocket(url, {
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`
      }
    });
    
    ws.on('open', () => {
      console.log('✅ Raw WS connected!');
      // Send silence
      ws.send(Buffer.alloc(160));
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      console.log('✅ Raw WS message type:', msg.type);
    });
    
    ws.on('error', (err) => {
      console.log('❌ Raw WS error:', err.message);
    });

    await new Promise(resolve => setTimeout(resolve, 3000));
    ws.close();
    console.log('Raw WS test complete.');
  } catch(err) {
    console.error('Raw WS failed:', err.message);
  }

  process.exit(0);
}

testSTT();
