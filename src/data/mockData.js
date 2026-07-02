export const INITIAL_CALLS = [
  {
    id: "CALL-9821",
    callerName: "Rajesh Singhania",
    company: "Zara India Sourcing",
    phone: "+91 98765 43210",
    time: "10:45 AM",
    duration: "2m 15s",
    category: "VIP Lead",
    sentiment: "positive",
    status: "Escalated to Human",
    summary: "Wants to place bulk order for 15,000 meters of combed organic cotton fabric. Requested price quote and fabric samples. Call routed to Sales VP Rajesh.",
    score: 95,
    language: "English",
    transcript: [
      { speaker: "AI Agent", text: "Hello! Thank you for calling TexVibe Manufacturing. How may I assist you today?" },
      { speaker: "Caller", text: "Hi, I'm Rajesh from Zara India Sourcing. We are looking for organic combed cotton fabric, about 15,000 meters. Do you have stock, and what are the price points?" },
      { speaker: "AI Agent", text: "That is a substantial order! Yes, we manufacture high-grade organic combed cotton. I am classifying your request as a VIP order. Let me transfer you directly to our Head of Sales, and we will ship fabric samples to your office today." }
    ]
  },
  {
    id: "CALL-9818",
    callerName: "Unknown Spammer",
    company: "Unknown (Telemarketer)",
    phone: "+91 1400 92384",
    time: "10:12 AM",
    duration: "18s",
    category: "Spam",
    sentiment: "neutral",
    status: "Blocked",
    summary: "Automated robocall offering business loans. Flagged and disconnected by AI spam filter.",
    score: 0,
    language: "English",
    transcript: [
      { speaker: "AI Agent", text: "Hello! Thank you for calling TexVibe Manufacturing. How may I assist you today?" },
      { speaker: "Caller", text: "Congratulations! You are pre-approved for a business loan of up to 50 lakhs with zero collateral. Press 1 to..." },
      { speaker: "AI Agent", text: "We do not accept cold marketing calls. Goodbye." }
    ]
  },
  {
    id: "CALL-9799",
    callerName: "Priya Sharma",
    company: "FabIndia Sourcing",
    phone: "+91 99887 76655",
    time: "09:30 AM",
    duration: "1m 45s",
    category: "Warm Lead",
    sentiment: "positive",
    status: "Completed",
    summary: "Inquired about the new Linen-blend catalog and pricing. Lead qualified (Score 78). Sent digital catalog via WhatsApp.",
    score: 78,
    language: "Hindi / English",
    transcript: [
      { speaker: "AI Agent", text: "Hello! Thank you for calling TexVibe Manufacturing. How may I assist you today?" },
      { speaker: "Caller", text: "Hi, organic Linen blend fabrics ka catalog chahiye tha, aur minimum order quantity kya hai?" },
      { speaker: "AI Agent", text: "Certainly! Our Linen-blend catalog is ready. Our Minimum Order Quantity (MOQ) for custom weaves is 500 meters. May I send the catalog and price sheet directly to this number on WhatsApp?" },
      { speaker: "Caller", text: "Yes, please send it on this number." },
      { speaker: "AI Agent", text: "Perfect, sending it now. Have a wonderful day!" }
    ]
  },
  {
    id: "CALL-9782",
    callerName: "Vikram Malhotra",
    company: "Malhotra Garments",
    phone: "+91 91234 56789",
    time: "08:15 AM",
    duration: "1m 10s",
    category: "Support",
    sentiment: "negative",
    status: "Completed",
    summary: "Checking status of Order #TX-4892. AI retrieved shipping status from ERP: In transit, arriving tomorrow via BlueDart. Customer satisfied.",
    score: 45,
    language: "English",
    transcript: [
      { speaker: "AI Agent", text: "Hello! Thank you for calling TexVibe Manufacturing. How may I assist you today?" },
      { speaker: "Caller", text: "Hey, I ordered some Denim fabrics last week. Order TX-4892. It was supposed to arrive today but I haven't got it. Where is it?" },
      { speaker: "AI Agent", text: "Let me check that for you. Ah, yes. Order TX-4892 has been dispatched via BlueDart. It is currently in transit and is scheduled for delivery tomorrow morning by 11:00 AM." },
      { speaker: "Caller", text: "Okay, tomorrow is fine. Thanks for the quick update." },
      { speaker: "AI Agent", text: "You're welcome! Feel free to call us back if you need further help." }
    ]
  }
];

export const PRESET_SCENARIOS = [
  {
    name: "VIP Buyer (Cotton Fabric)",
    caller: "Elena Vance (Sourcing Lead at H&M)",
    phone: "+1 415 555 2671",
    scenario: "Wants to order 20k meters of cotton-linen blend for summer collection. Needs bulk discounts and custom dying.",
    responses: [
      { trigger: "hello|hi|good morning", text: "Hi, I'm Elena Vance from H&M. I want to inquire about your cotton-linen blend fabrics. We need around 20,000 meters for our upcoming summer collection." },
      { trigger: "discount|price|bulk|rate|cost|how much", text: "Excellent. Can we get a custom dye match for a pantone shade, and is there a bulk discount for 20,000 meters?" },
      { trigger: "escalat|transfer|sales|manager|human|agent|representative", text: "Perfect, please transfer me to the sales head so we can lock in the contract details." }
    ],
    summary: "Elena from H&M wants 20k meters of custom-dyed cotton-linen blend. Identified as VIP Lead. Transferred to head of Sales.",
    category: "VIP Lead",
    score: 98
  },
  {
    name: "Spam Caller (Credit Card)",
    caller: "Robo-Sales",
    phone: "+91 800 234 1122",
    scenario: "Offering pre-approved platinum credit cards with lifetime free benefits.",
    responses: [
      { trigger: "hello|hi", text: "Hello! I am calling from FastBank to offer you a lifetime free platinum card with cashback benefits. Are you interested?" },
      { trigger: "interest|no|yes|stop|spam", text: "We have instant approval and require zero income proof. Do you want to process?" }
    ],
    summary: "Spam cold call offering credit cards. Detected as Spam and terminated.",
    category: "Spam",
    score: 5
  },
  {
    name: "General Customer (Order Tracking)",
    caller: "Raj Verma",
    phone: "+91 93211 44556",
    scenario: "Asks for delivery updates on order #TX-9021 which was scheduled for this week.",
    responses: [
      { trigger: "hello|hi", text: "Hello, I am Raj Verma. I ordered 200 rolls of silk fabric, order number TX-9021. Can you tell me when it will arrive?" },
      { trigger: "status|track|when|delivery|where", text: "Thank you. Let me know when it leaves the warehouse, our tailoring workshop is waiting." }
    ],
    summary: "Raj Verma checking status of Silk rolls order #TX-9021. AI checked ERP and confirmed dispatch.",
    category: "Support",
    score: 40
  }
];
