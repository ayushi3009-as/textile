require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const { DeepgramClient } = require('@deepgram/sdk');
const Groq = require('groq-sdk');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db.cjs');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize Database
db.initDB();

const PORT = 3000;

// Validate API keys on startup
if (!process.env.DEEPGRAM_API_KEY) {
  console.error('[ERROR] DEEPGRAM_API_KEY is missing from .env file!');
  process.exit(1);
}
if (!process.env.GROQ_API_KEY) {
  console.error('[ERROR] GROQ_API_KEY is missing from .env file!');
  process.exit(1);
}

// API Clients
const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store SSE clients for the dashboard
let sseClients = [];

function sendEventToAll(eventData) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
  });
}

// ========== HTTP ROUTES ==========

// 1. SSE Endpoint for React Dashboard
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`data: {"type": "connected"}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);
  console.log(`[SSE] Dashboard client connected. Total: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
    console.log(`[SSE] Dashboard client disconnected. Total: ${sseClients.length}`);
  });
});

// ========== AUTHENTICATION MIDDLEWARE ==========
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ========== AUTHENTICATION ROUTES ==========
app.post('/api/register', async (req, res) => {
  try {
    const { companyName, email, password, twilioNumber } = req.body;
    if (!companyName || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    
    const existingClient = await db.getClientByEmail(email);
    if (existingClient) return res.status(400).json({ error: 'Email already in use' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const newClient = await db.createClient(companyName, email, passwordHash, twilioNumber);
    
    const token = jwt.sign({ id: newClient.id, email: newClient.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, client: newClient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await db.getClientByEmail(email);
    
    if (!client || !(await bcrypt.compare(password, client.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: client.id, email: client.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, client: { id: client.id, companyName: client.company_name, email: client.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 2. Twilio TwiML Endpoint (When call starts)
app.post('/twiml', (req, res) => {
  const callerNumber = req.body.From || 'Unknown';
  console.log(`[TWILIO] Incoming call from: ${callerNumber}`);
  
  // Instruct Twilio to connect to our WebSocket and stream live audio
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${req.headers.host}/media-stream">
      <Parameter name="callerNumber" value="${callerNumber}" />
      <Parameter name="twilioNumber" value="${req.body.To || 'Unknown'}" />
    </Stream>
  </Connect>
</Response>`;
  res.type('text/xml');
  res.send(twiml);
});

// 2.5 Fetch Leads for Dashboard
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const leads = await db.getLeads(req.user.id);
    
    // Map the DB schema to the frontend dashboard format
    const formattedLeads = leads.map(lead => ({
      id: lead.twilio_call_sid ? lead.twilio_call_sid.substring(0, 9) : `CALL-${lead.id}`,
      callerName: lead.name || "Unknown",
      company: lead.city ? `${lead.city}, ${lead.state || ''}` : "Unknown Location",
      phone: lead.contact_number || lead.caller_number,
      time: new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: "Completed",
      category: lead.status || "Warm Lead",
      status: "Completed",
      summary: lead.highlights || "Call completed.",
      score: lead.name ? 85 : 50,
      sentiment: "neutral",
      product_wanted: lead.product_wanted || "-",
      color: lead.color || "-",
      quantity: lead.quantity || "-",
      wants_sample: lead.wants_sample ? "Yes" : "No",
      transcript: typeof lead.transcript === 'string' ? JSON.parse(lead.transcript) : (lead.transcript || [])
    }));
    
    res.json(formattedLeads);
  } catch (err) {
    console.error('[API ERROR] /api/leads:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});
// 3. Super Admin Endpoint to fetch all clients and their metrics
app.get('/api/superadmin/clients', async (req, res) => {
  try {
    const clients = await db.getAllClientsStats();
    res.json(clients);
  } catch (err) {
    console.error('[API ERROR] /api/superadmin/clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// 4. Test Endpoint to simulate a call for the dashboard
app.get('/api/test-event', (req, res) => {
  const testCall = {
    id: `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
    callerName: "Test Caller",
    company: "Simulated Call",
    phone: "+91 98765 43210",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    duration: "1m 23s",
    category: "Warm Lead",
    status: "Completed",
    summary: "Test caller asked about premium cotton pricing for a bulk order of 500 meters.",
    score: 72,
    sentiment: "positive",
    transcript: [
      { speaker: "AI Agent", text: "Hello! Thank you for calling TexVibe. How can I help you today?" },
      { speaker: "User", text: "Hi, I want to know the price of premium cotton." },
      { speaker: "AI Agent", text: "Our premium cotton is available at ₹250 per meter. How many meters are you looking for?" },
      { speaker: "User", text: "About 500 meters." },
      { speaker: "AI Agent", text: "That's great! I'll have our team prepare a quote for you. Can I get your email address?" }
    ]
  };
  sendEventToAll({ type: 'new_call', data: testCall });
  res.json({ status: 'success', message: 'Test call sent to dashboard.' });
});

// 4. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    deepgram: !!process.env.DEEPGRAM_API_KEY, 
    groq: !!process.env.GROQ_API_KEY,
    sseClients: sseClients.length 
  });
});

// ========== WEBSOCKET ORCHESTRATOR ==========

wss.on('connection', (ws, req) => {
  if (req.url !== '/media-stream') {
    return ws.close();
  }
  
  console.log('[WEBSOCKET] Twilio connected to media stream');
  
  let streamSid = null;
  let callerNumber = 'Unknown';
  let activeClientId = null;
  let companyName = 'Our Company';
  let callTranscript = [];
  let callStartTime = Date.now();
  let dgConnection = null;
  let dgReady = false;
  let isAISpeaking = false;
  let pendingUserText = null; // Buffer for user speech while AI is speaking
  
  // Default fallback instructions
  let systemInstruction = `You are a helpful AI assistant. Answer briefly.`;
  let chatHistory = [];

  // Send the initial greeting via TTS directly (not through Gemini)
  const sendInitialGreeting = async () => {
    const greeting = `Hello! Thank you for calling ${companyName}. How can I help you today?`;
    console.log(`[AI GREETING] ${greeting}`);
    callTranscript.push({ speaker: 'AI Agent', text: greeting });
    await speakText(greeting);
  };

  // Convert text to speech and send to Twilio
  const speakText = async (text) => {
    try {
      isAISpeaking = true;

      const response = await fetch(
        `https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mulaw&sample_rate=8000&container=none`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: text }),
        }
      );

      if (!response.ok) {
        throw new Error(`Deepgram TTS error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      
      // Send audio in chunks to Twilio (160 bytes per chunk = 20ms of mulaw audio at 8kHz)
      const CHUNK_SIZE = 160;
      for (let i = 0; i < audioBuffer.length; i += CHUNK_SIZE) {
        const chunk = audioBuffer.subarray(i, Math.min(i + CHUNK_SIZE, audioBuffer.length));
        if (ws.readyState === WebSocket.OPEN && streamSid) {
          ws.send(JSON.stringify({
            event: 'media',
            streamSid: streamSid,
            media: {
              payload: chunk.toString('base64')
            }
          }));
        }
      }

      // Send a mark event so Twilio tells us when audio is done playing
      if (ws.readyState === WebSocket.OPEN && streamSid) {
        ws.send(JSON.stringify({
          event: 'mark',
          streamSid: streamSid,
          mark: { name: 'ai-speech-done' }
        }));
      }

    } catch (err) {
      console.error('[TTS ERROR]', err.message);
      isAISpeaking = false;
    }
  };

  // Handle user speech -> Groq -> TTS
  const handleUserSpeech = async (userText) => {
    try {
      console.log('[GROQ] Thinking...');
      chatHistory.push({ role: 'user', content: userText });

      const completion = await groq.chat.completions.create({
        messages: chatHistory,
        model: 'llama-3.1-8b-instant',
        temperature: 0.7,
        max_tokens: 100
      });

      const aiText = completion.choices[0].message.content.trim();
      chatHistory.push({ role: 'assistant', content: aiText });
      console.log(`[AI] ${aiText}`);
      
      callTranscript.push({ speaker: 'AI Agent', text: aiText });

      await speakText(aiText);

    } catch (err) {
      console.error('[GROQ ERROR]', err.message);
      isAISpeaking = false;
    }
  };

  // Setup Deepgram Live STT Connection using raw WebSocket for stability
  const setupDeepgramSTT = async () => {
    try {
      const WebSocket = require('ws');
      const url = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-IN&smart_format=true&encoding=mulaw&sample_rate=8000&channels=1&endpointing=400&interim_results=true&utterance_end_ms=1000`;
      
      dgConnection = new WebSocket(url, {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`
        }
      });

      let keepAliveInterval;

      dgConnection.on('open', () => {
        console.log('[DEEPGRAM STT] Connected and listening');
        dgReady = true;
        
        // Send KeepAlive to prevent timeout during long pauses
        keepAliveInterval = setInterval(() => {
          if (dgConnection.readyState === 1) {
            dgConnection.send(JSON.stringify({ type: 'KeepAlive' }));
          }
        }, 5000);
      });

      dgConnection.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type !== 'Results') return;
          
          const transcript = msg.channel?.alternatives?.[0]?.transcript;
          if (!transcript || transcript.trim() === '') return;

          if (msg.is_final) {
            console.log(`[USER] ${transcript}`);
            callTranscript.push({ speaker: 'User', text: transcript });
            
            if (isAISpeaking) {
              // Queue the user's speech to process after AI finishes
              pendingUserText = (pendingUserText || '') + ' ' + transcript;
              console.log('[QUEUE] User spoke while AI was speaking. Buffering...');
            } else {
              isAISpeaking = true;
              const textToProcess = pendingUserText ? pendingUserText.trim() + ' ' + transcript : transcript;
              pendingUserText = null;
              await handleUserSpeech(textToProcess);
            }
          }
        } catch(e) {
          console.error('[DEEPGRAM PARSE ERROR]', e.message);
        }
      });

      dgConnection.on('error', (err) => {
        console.error('[DEEPGRAM STT ERROR]', err);
      });

      dgConnection.on('close', () => {
        console.log('[DEEPGRAM STT] Connection closed');
        dgReady = false;
        if (keepAliveInterval) clearInterval(keepAliveInterval);
      });

    } catch (err) {
      console.error('[DEEPGRAM SETUP ERROR]', err);
    }
  };

  // ========== HANDLE TWILIO MESSAGES ==========
  ws.on('message', async (message) => {
    try {
      const msg = JSON.parse(message);
      
      if (msg.event === 'start') {
        streamSid = msg.start.streamSid;
        callerNumber = msg.start.customParameters.callerNumber || 'Unknown';
        const twilioNumber = msg.start.customParameters.twilioNumber || 'Unknown';
        console.log(`[TWILIO] Stream started: ${streamSid}, Caller: ${callerNumber}, Dialed: ${twilioNumber}`);
        
        // --- MULTI-TENANCY LOOKUP ---
        const clientDb = await db.getClientByTwilioNumber(twilioNumber);
        if (clientDb) {
          activeClientId = clientDb.id;
          companyName = clientDb.company_name || 'Our Company';
          if (clientDb.system_prompt) {
             systemInstruction = clientDb.system_prompt;
          } else {
             // Fallback prompt for new clients
             systemInstruction = `You are a helpful phone assistant for ${companyName}. 
CRITICAL RULE: YOU MUST ASK EXACTLY ONE QUESTION PER RESPONSE. DO NOT ask multiple questions. DO NOT use bullet points or numbered lists. DO NOT say "I have a few questions."

Your goal is to collect the following information in order. Ask the next question naturally ONLY after they answer the previous one:
1. Product wanted?
2. Color?
3. Quantity?
4. Sample product wanted?
5. Name, Phone, City, and State?

Example of good behavior:
User: I want premium cotton.
AI: Great, premium cotton is a great choice. What color do you prefer?
User: Pastel.
AI: Pastel is lovely. How much quantity do you need?`;
          }
        } else {
          console.warn(`[WARNING] No client found for Twilio number: ${twilioNumber}. Using fallback.`);
        }
        
        chatHistory = [{ role: 'system', content: systemInstruction }];

        // Setup Deepgram and Send Greeting
        setupDeepgramSTT();
        await sendInitialGreeting();
      }
      else if (msg.event === 'media') {
        // Forward raw audio to Deepgram STT
        if (dgConnection && dgReady && dgConnection.readyState === 1) {
          try {
            dgConnection.send(Buffer.from(msg.media.payload, 'base64'));
          } catch(e) {
            console.error('[WS MESSAGE ERROR]', e.message);
          }
        }
      }
      else if (msg.event === 'mark') {
        // Twilio finished playing our audio
        if (msg.mark && msg.mark.name === 'ai-speech-done') {
          isAISpeaking = false;
          console.log('[TWILIO] AI speech playback completed');
          
          // Process any pending user text
          if (pendingUserText && pendingUserText.trim()) {
            const text = pendingUserText.trim();
            pendingUserText = null;
            isAISpeaking = true;
            handleUserSpeech(text);
          }
        }
      }
      else if (msg.event === 'stop') {
        console.log('[TWILIO] Call stopped.');
        if (dgConnection && dgConnection.readyState === 1) {
          try { dgConnection.close(); } catch(e) {}
        }
        
        // Calculate call duration
        const durationMs = Date.now() - callStartTime;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const formattedDuration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        // Extract Lead Info and Save to DB via Groq
        const fullTranscriptText = callTranscript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        
        const extractionPrompt = {
          messages: [
            {
              role: "system",
              content: `You are an expert AI data extractor. Analyze the call transcript and extract the key lead information.
Return ONLY a raw JSON object with the following schema, and no other text:
{
  "name": "Full name if provided, else null",
  "contact_number": "Phone number if provided, else null",
  "city": "City if provided, else null",
  "state": "State if provided, else null",
  "product_wanted": "The product the user wants (e.g. premium cotton)",
  "color": "The color the user wants (e.g. pastel)",
  "quantity": "The quantity the user wants (e.g. 500 meters)",
  "wants_sample": true or false,
  "status": "Spam", "Interested", or "Not Interested",
  "lead_temperature": "Warm" (if they engaged, wanted to buy, or asked for a sample) or "Cold" (if they were not interested, rude, or spam),
  "highlights": "A short 1-sentence summary of the call"
}`
            },
            { role: "user", content: `Transcript:\n${fullTranscriptText}` }
          ]
        };

        groq.chat.completions.create({
          messages: extractionPrompt.messages,
          model: 'llama-3.1-8b-instant',
          response_format: { type: 'json_object' },
          temperature: 0.1
        }).then(async (completion) => {
          let extracted = {
            name: null, contact_number: null, city: null, state: null, 
            product_wanted: null, color: null, quantity: null, wants_sample: false,
            status: "Completed", highlights: "Call ended without explicit details."
          };
          try {
            extracted = JSON.parse(completion.choices[0].message.content);
          } catch(e) { console.error('[EXTRACTION ERROR]', e); }
          
          // Save to PostgreSQL Database
          const leadData = {
            twilio_call_sid: streamSid || 'unknown',
            caller_number: callerNumber,
            name: extracted.name,
            contact_number: extracted.contact_number,
            city: extracted.city,
            state: extracted.state,
            product_wanted: extracted.product_wanted,
            color: extracted.color,
            quantity: extracted.quantity,
            wants_sample: !!extracted.wants_sample,
            status: extracted.status || "Completed",
            highlights: extracted.highlights,
            transcript: callTranscript
          };
          
          try {
            await db.saveLead(leadData, activeClientId);
          } catch(e) {
            console.error('[DB ERROR] Failed to save lead at end of call', e.message);
          }

          // Format for Dashboard
          const finalCallData = {
            id: streamSid ? streamSid.substring(0, 9) : `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
            callerName: extracted.name || "Unknown",
            company: extracted.city ? `${extracted.city}, ${extracted.state || ''}` : "Unknown Location",
            phone: extracted.contact_number || callerNumber,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            duration: formattedDuration,
            category: extracted.status || "Warm Lead",
            status: "Completed",
            summary: extracted.highlights || "Call completed.",
            score: extracted.name ? 85 : 50,
            sentiment: "neutral",
            product_wanted: extracted.product_wanted || "-",
            color: extracted.color || "-",
            quantity: extracted.quantity || "-",
            wants_sample: extracted.wants_sample ? "Yes" : "No",
            transcript: callTranscript
          };

          sendEventToAll({ type: 'new_call', data: finalCallData });
          console.log(`[DASHBOARD] Call log sent: ${finalCallData.id} | ${finalCallData.category} | ${formattedDuration}`);
        }).catch(err => {
          console.error('[GROQ EXTRACTION ERROR]', err.message);
        });
      }
    } catch (err) {
      console.error('[WS MESSAGE ERROR]', err.message);
    }
  });

  ws.on('close', () => {
    console.log('[WEBSOCKET] Twilio disconnected.');
    if (dgConnection && dgConnection.readyState === 1) {
      try { dgConnection.close(); } catch(e) {}
    }
  });

  ws.on('error', (err) => {
    console.error('[WEBSOCKET ERROR]', err.message);
  });
});

// ========== START SERVER ==========
server.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('  TexVibe AI - Custom Voice Orchestrator');
  console.log('='.repeat(60));
  console.log(`  Server:     http://localhost:${PORT}`);
  console.log(`  Twilio URL: POST /twiml`);
  console.log(`  Dashboard:  GET  /api/events`);
  console.log(`  Health:     GET  /api/health`);
  console.log(`  Test Call:  GET  /api/test-event`);
  console.log('='.repeat(60));
  console.log('  Deepgram Key: ✅ Loaded');
  console.log('  Gemini Key:   ✅ Loaded');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Waiting for incoming Twilio calls...');
  console.log('');
});
