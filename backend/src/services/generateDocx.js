import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    ShadingType,
    WidthType,
    Spacing
} from "docx";
import fs from "fs";

export const generateDocx = async (data, outputPath) => {
    if (!data || !data.header) {
        throw new Error("Invalid data passed to generateDocx");
    }

    const FONT_FAMILY = "Arial";
    const PRIMARY_COLOR = "1F4E78"; // Dark Blue for headers
    const TEAL_COLOR = "006666";    // Dark Teal for tables

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: FONT_FAMILY,
                        size: 22, // 11pt
                    },
                },
            },
        },
        sections: [
            {
                properties: {},
                children: [
                    /* ================= TITLE AREA ================= */
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "WEEKLY LEADERSHIP REVIEW",
                                bold: true,
                                size: 36, // 18pt
                                color: PRIMARY_COLOR,
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: data.header.mill_name,
                                size: 28, // 14pt
                                color: "444444",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: `Week: ${data.header.week} vs Previous Week (${data.header.comparison_week})`,
                                size: 20, // 10pt
                                color: "666666",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: `Season Days: ${data.header.season_day}`,
                                size: 20,
                                color: "666666",
                            }),
                        ],
                    }),

                    spaceTwo(),

                    /* ================= PART 1 TITLE ================= */
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "PART 1 – INSIGHT NARRATIVE",
                                bold: true,
                                size: 26, // 13pt
                                color: PRIMARY_COLOR,
                            }),
                        ],
                        border: {
                            bottom: {
                                color: PRIMARY_COLOR,
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    }),
                    spaceOne(),

                    /* ================= EXECUTIVE SUMMARY ================= */
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "1. Executive Summary (Key Insights)",
                                bold: true,
                                size: 24, // 12pt
                                color: "2E75B5",
                            }),
                        ],
                    }),

                    ...data.part1.executive_summary.flatMap(item => [
                        new Paragraph({
                            bullet: {
                                level: 0,
                            },
                            children: [
                                new TextRun({
                                    text: `${item.title}: `,
                                    bold: true,
                                    size: 22,
                                }),
                                new TextRun({
                                    text: item.text,
                                    size: 22,
                                })
                            ],
                            spacing: { before: 100 },
                        })
                    ]),

                    spaceOne(),

                    /* ================= SECTIONS ================= */
                    ...renderSection("2. Overall Performance", data.part1.overall_performance, "2E75B5"),
                    ...renderSection("3. Benchmark & Comparative Position", data.part1.benchmark_position, "2E75B5"),
                    ...renderSection("4. Cane Planning & Control", data.part1.cane_planning, "2E75B5"),
                    ...renderSection("5. Engineering & Milling Performance", data.part1.engineering, "2E75B5"),
                    ...renderSection("6. Production Performance", data.part1.production, "2E75B5"),
                    ...renderSection("7. Power Plant Performance", data.part1.power, "2E75B5"),
                    ...renderSection("8. Distillery Performance", data.part1.distillery, "2E75B5"),
                    ...renderSection("9. Quality Control & EHS", data.part1.quality_ehs, "2E75B5"),

                    spaceOne(),

                    /* ================= RISKS ================= */
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Risks & Watch-outs for the Coming Week",
                                bold: true,
                                size: 24,
                                color: "C00000", // Red for risks
                            }),
                        ],
                    }),
                    ...data.part1.risks.map(r =>
                        new Paragraph({
                            bullet: { level: 0 },
                            children: [new TextRun(r)],
                            spacing: { before: 80 }
                        })
                    ),

                    spaceTwo(),

                    /* ================= TABLE A ================= */
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "TABLE A – Quantitative Discussion",
                                bold: true,
                                size: 24,
                                color: TEAL_COLOR,
                            }),
                        ],
                    }),
                    spaceOne(),
                    buildTable(data.tables.tableA, TEAL_COLOR),

                    spaceTwo(),

                    /* ================= TABLE B ================= */
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "TABLE B – Qualitative Discussion",
                                bold: true,
                                size: 24,
                                color: TEAL_COLOR,
                            }),
                        ],
                    }),
                    spaceOne(),
                    buildTable(data.tables.tableB, TEAL_COLOR),

                    spaceTwo(),

                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "This review is based exclusively on numbers and narratives disclosed in the weekly PDF slides.",
                                italic: true,
                                size: 18,
                                color: "888888",
                            }),
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: "Note: This report is AI-generated and may not be fully accurate. Please review and validate the information before relying on it for decision-making.",
                                italic: true,
                                size: 16,
                                color: "AAAAAA",
                            }),
                        ],
                        spacing: { before: 100 }
                    })
                ]
            }
        ]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
};

/* ================= HELPERS ================= */

const spaceTwo = () =>
    new Paragraph({
        text: "",
        spacing: { after: 300 }
    });

const spaceOne = () =>
    new Paragraph({
        text: "",
        spacing: { after: 150 }
    });

const renderSection = (title, text, color) => [
    new Paragraph({
        children: [
            new TextRun({
                text: title,
                bold: true,
                size: 22,
                color: color,
            }),
        ],
        spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
        children: [new TextRun(text)],
        alignment: AlignmentType.JUSTIFY,
        spacing: { after: 100 },
    })
];

const buildTable = (table, headerBgColor) =>
    new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                tableHeader: true,
                children: table.headers.map(h =>
                    new TableCell({
                        shading: {
                            fill: headerBgColor,
                            type: ShadingType.CLEAR,
                            color: "auto",
                        },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: h,
                                        bold: true,
                                        color: "FFFFFF", // White font
                                    })
                                ]
                            })
                        ]
                    })
                )
            }),
            ...table.rows.map(row =>
                new TableRow({
                    children: row.map(cell =>
                        new TableCell({
                            margins: { top: 80, bottom: 80, left: 100, right: 100 },
                            children: [new Paragraph(cell)]
                        })
                    )
                })
            )
        ]
    });