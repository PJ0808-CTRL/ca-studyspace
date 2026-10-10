export const subjects = ["Accounting", "Business Laws", "Quantitative Aptitude", "Business Economics"] as const;
export type Subject = (typeof subjects)[number];
