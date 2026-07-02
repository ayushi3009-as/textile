const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "TexVibe AI - Client Knowledge Questionnaire",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Please fill out this simple questionnaire so we can train your AI Voice Agent. The AI will use this exact information to answer customer questions accurately over the phone.",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "" }), // Empty line
                
                new Paragraph({
                    text: "1. Products & Inventory",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "What exact products do you sell? (Please list them)",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "- Example: Premium Cotton, Polyester Blend, Linen." }),
                new Paragraph({ text: "- Your answer: \n\n" }),
                
                new Paragraph({
                    text: "2. Pricing & Minimum Orders",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "What is the price for each product? Is there a minimum amount they must buy?",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "- Example: Premium Cotton is ₹250/meter. Minimum order is 50 meters." }),
                new Paragraph({ text: "- Your answer: \n\n" }),
                
                new Paragraph({
                    text: "3. Colors & Variations",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "What colors, patterns, or qualities are available?",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "- Example: Solid colors only (Red, Blue, White, Black). 100% organic." }),
                new Paragraph({ text: "- Your answer: \n\n" }),
                
                new Paragraph({
                    text: "4. Shipping & Delivery",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "How long does delivery take? Do you ship all over India?",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "- Example: Delivery takes 3-5 days. Yes, we ship pan-India." }),
                new Paragraph({ text: "- Your answer: \n\n" }),
                
                new Paragraph({
                    text: "5. VIP / Bulk Orders",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "At what quantity is an order considered 'Bulk' or 'VIP'? What should the AI say if someone wants a massive order?",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "- Example: Anything over 1,000 meters is bulk. The AI should tell them a Sales Director will call them back in 30 mins." }),
                new Paragraph({ text: "- Your answer: \n\n" }),
                
                new Paragraph({
                    text: "6. Frequently Asked Questions (Optional)",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "What are the 2 or 3 most common questions your customers ask, and what is the exact answer the AI should give?",
                            italics: true,
                        }),
                    ],
                }),
                new Paragraph({ text: "- Q: Do you send samples?\n- A: Yes, we charge ₹500 for a sample book." }),
                new Paragraph({ text: "- Your answers: \n\n" }),
                
                new Paragraph({ text: "---" }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Note to Client: ",
                            bold: true,
                        }),
                        new TextRun({
                            text: "Once you provide this information, we will upload it into the AI's 'brain'. The AI will be strictly programmed to only sell these items and never make up products that aren't on this list!",
                        }),
                    ],
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Client_Questionnaire.docx", buffer);
    console.log("Created Client_Questionnaire.docx");
});
