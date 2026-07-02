const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require("docx");

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "Internal Project & Compensation Agreement",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Company: ", bold: true }),
                        new TextRun("Micro Technique IT"),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Employee (Developer): ", bold: true }),
                        new TextRun("[Your Name]"),
                    ],
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "Date: ", bold: true }),
                        new TextRun("July 2, 2026"),
                    ],
                }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "1. Project Scoping & Pricing",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "This agreement governs the internal working relationship and project-based compensation between the Employee and the Company. For any individual project assigned to the Employee, the following process must be adhered to:",
                }),
                new Paragraph({ text: "- Feature Definition: Before the Developer begins any work, the Company must clearly define the exact features, deliverables, and scope of the project in writing.", bullet: { level: 0 } }),
                new Paragraph({ text: "- Fair Market Pricing: Once the scope is defined, both parties will agree on a fixed fee for the project. This fee must be aligned with standard tech market rates for the specific technology and complexity involved. The Developer will not commence work until this price is agreed upon.", bullet: { level: 0 } }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "2. Scope Creep & Additional Features",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                    text: "The agreed-upon fee covers only the features explicitly discussed before the start of the project.",
                }),
                new Paragraph({ text: "- Additional Billing: If the Company requests significant new features, major architectural changes, or additions that fall outside the original scope, the Developer will provide a separate quote for the extra work. The Company will be billed additionally for these features.", bullet: { level: 0 } }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "3. Payment Schedule",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "- Monthly Payouts: The Company agrees to pay the Developer on the 6th day of every calendar month.", bullet: { level: 0 } }),
                new Paragraph({ text: "- This payment will cover the full agreed-upon amount for all projects and milestones that the Developer successfully completed during the preceding month.", bullet: { level: 0 } }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "4. Delivery & Sales Liability",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "- Delivery of Work: The Developer's sole duty is to write the code and deliver the software project exactly as discussed and scoped.", bullet: { level: 0 } }),
                new Paragraph({ text: "- No Sales Responsibility: The Developer holds zero responsibility or liability for whether the Company successfully sells, markets, or monetizes the final product. The Developer must be paid in full for their technical labor regardless of the product's commercial success.", bullet: { level: 0 } }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "5. Intellectual Property & Transfer of Rights",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "- The Developer retains full ownership and copyright of all source code until the Company has paid the invoice in full on the 6th of the month. Once payment is cleared, the rights to the specific project code transfer fully to the Company.", bullet: { level: 0 } }),
                new Paragraph({ text: "" }),
                new Paragraph({
                    text: "6. Bug Fixes vs. Maintenance",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "- The Developer will fix any critical bugs related to the original scope free of charge for a period of 14 days after project delivery. After 14 days, any further support, maintenance, or bug fixing will be billed at a separate, agreed-upon rate.", bullet: { level: 0 } }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "---" }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "Signatures:" }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "___________________________" }),
                new Paragraph({ children: [new TextRun({ text: "[Your Name] (Developer)", bold: true })] }),
                new Paragraph({ text: "Date: _______________" }),
                new Paragraph({ text: "" }),
                new Paragraph({ text: "___________________________" }),
                new Paragraph({ children: [new TextRun({ text: "Representative for Micro Technique IT", bold: true })] }),
                new Paragraph({ text: "Date: _______________" }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("Master_Freelance_Agreement.docx", buffer);
    console.log("Created Master_Freelance_Agreement.docx");
});
