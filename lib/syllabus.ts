import type { Subject } from "./subjects";

export type SyllabusChapter = { key: string; title: string; part?: string };

export const syllabusSource = "https://www.icai.org/post/foundation-nset";

export const foundationSyllabus: Record<Subject, SyllabusChapter[]> = {
  Accounting: [
    { key: "acc-01", title: "Theoretical Framework", part: "Module 1" },
    { key: "acc-02", title: "Accounting Process", part: "Module 1" },
    { key: "acc-03", title: "Bank Reconciliation Statement", part: "Module 1" },
    { key: "acc-04", title: "Inventories", part: "Module 1" },
    { key: "acc-05", title: "Depreciation and Amortisation", part: "Module 1" },
    { key: "acc-06", title: "Bills of Exchange and Promissory Notes", part: "Module 1" },
    { key: "acc-07", title: "Final Accounts of Sole Proprietors", part: "Module 1" },
    { key: "acc-08", title: "Financial Statements of Not-for-Profit Organisations", part: "Module 2" },
    { key: "acc-09", title: "Accounts from Incomplete Records", part: "Module 2" },
    { key: "acc-10", title: "Partnership and LLP Accounts", part: "Module 2" },
    { key: "acc-11", title: "Company Accounts", part: "Module 2" },
  ],
  "Business Laws": [
    { key: "law-01", title: "Indian Regulatory Framework" },
    { key: "law-02", title: "The Indian Contract Act, 1872" },
    { key: "law-03", title: "The Sale of Goods Act, 1930" },
    { key: "law-04", title: "The Indian Partnership Act, 1932" },
    { key: "law-05", title: "The Limited Liability Partnership Act, 2008" },
    { key: "law-06", title: "The Companies Act, 2013" },
    { key: "law-07", title: "The Negotiable Instruments Act, 1881" },
  ],
  "Quantitative Aptitude": [
    { key: "qa-01", title: "Ratio and Proportion, Indices and Logarithms", part: "Business Mathematics" },
    { key: "qa-02", title: "Equations", part: "Business Mathematics" },
    { key: "qa-03", title: "Linear Inequalities", part: "Business Mathematics" },
    { key: "qa-04", title: "Mathematics of Finance", part: "Business Mathematics" },
    { key: "qa-05", title: "Permutations and Combinations", part: "Business Mathematics" },
    { key: "qa-06", title: "Sequence and Series", part: "Business Mathematics" },
    { key: "qa-07", title: "Sets, Relations, Functions, Limits and Continuity", part: "Business Mathematics" },
    { key: "qa-08", title: "Differential and Integral Calculus", part: "Business Mathematics" },
    { key: "qa-09", title: "Number Series, Coding, Decoding and Odd Man Out", part: "Logical Reasoning" },
    { key: "qa-10", title: "Direction Sense Test", part: "Logical Reasoning" },
    { key: "qa-11", title: "Seating Arrangements", part: "Logical Reasoning" },
    { key: "qa-12", title: "Blood Relations", part: "Logical Reasoning" },
    { key: "qa-13", title: "Statistical Description of Data and Sampling", part: "Statistics" },
    { key: "qa-14", title: "Measures of Central Tendency and Dispersion", part: "Statistics" },
    { key: "qa-15", title: "Probability", part: "Statistics" },
    { key: "qa-16", title: "Theoretical Distributions", part: "Statistics" },
    { key: "qa-17", title: "Correlation and Regression", part: "Statistics" },
  ],
  "Business Economics": [
    { key: "eco-01", title: "Nature and Scope of Business Economics" },
    { key: "eco-02", title: "Theory of Demand and Supply" },
    { key: "eco-03", title: "Theory of Production and Cost" },
    { key: "eco-04", title: "Price Determination in Different Markets" },
    { key: "eco-05", title: "Business Cycles" },
    { key: "eco-06", title: "Determination of National Income" },
    { key: "eco-07", title: "Public Finance" },
    { key: "eco-08", title: "Money Market" },
    { key: "eco-09", title: "International Trade" },
    { key: "eco-10", title: "Indian Economy" },
  ],
};
