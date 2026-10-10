export const subjects = [
  "Accounting",
  "Business Laws",
  "Quantitative Aptitude",
  "Business Economics",
] as const;

export type Subject = (typeof subjects)[number];

export const questions: {
  id: string;
  subject: Subject;
  topic: string;
  prompt: string;
  options: [string, string, string, string];
  answer: number;
  explanation: string;
}[] = [
  {
    id: "acc-1", subject: "Accounting", topic: "Accounting equation",
    prompt: "A business has assets of ₹80,000 and liabilities of ₹25,000. What is its capital?",
    options: ["₹55,000", "₹1,05,000", "₹80,000", "₹25,000"], answer: 0,
    explanation: "Capital = assets − liabilities = ₹80,000 − ₹25,000 = ₹55,000.",
  },
  {
    id: "acc-2", subject: "Accounting", topic: "Double entry",
    prompt: "Which entry records cash received from a customer who owed the business money?",
    options: ["Debit cash, credit customer", "Debit customer, credit cash", "Debit sales, credit cash", "Debit cash, credit sales"], answer: 0,
    explanation: "Cash increases, so cash is debited. The customer's receivable decreases, so the customer account is credited.",
  },
  {
    id: "acc-3", subject: "Accounting", topic: "Depreciation",
    prompt: "Equipment costs ₹60,000, has no residual value and a useful life of five years. What is annual straight-line depreciation?",
    options: ["₹6,000", "₹10,000", "₹12,000", "₹15,000"], answer: 2,
    explanation: "Straight-line depreciation = (cost − residual value) ÷ useful life = ₹12,000 per year.",
  },
  {
    id: "law-1", subject: "Business Laws", topic: "Contract basics",
    prompt: "In a simple offer and acceptance example, which action normally turns an offer into an agreement?",
    options: ["A clear acceptance of the offer", "A private intention to accept", "Silence in every case", "An unrelated counter-offer"], answer: 0,
    explanation: "An offer followed by a clear acceptance is the basic agreement step. Other legal requirements may still apply.",
  },
  {
    id: "law-2", subject: "Business Laws", topic: "Contract basics",
    prompt: "What is a counter-offer?",
    options: ["Accepting an offer exactly", "Proposing different terms in response to an offer", "Paying an invoice", "Withdrawing a completed contract"], answer: 1,
    explanation: "A counter-offer proposes different terms instead of accepting the original terms as offered.",
  },
  {
    id: "law-3", subject: "Business Laws", topic: "Contract basics",
    prompt: "Which pair is central to forming an agreement?",
    options: ["Offer and acceptance", "Invoice and receipt", "Profit and loss", "Debtor and creditor"], answer: 0,
    explanation: "An agreement starts with a proposal or offer and acceptance of it.",
  },
  {
    id: "quant-1", subject: "Quantitative Aptitude", topic: "Ratio and proportion",
    prompt: "The ratio of A to B is 3:5. If their total is 64, what is A?",
    options: ["16", "24", "32", "40"], answer: 1,
    explanation: "There are eight parts in all. Each part is 8, so A is 3 × 8 = 24.",
  },
  {
    id: "quant-2", subject: "Quantitative Aptitude", topic: "Simple interest",
    prompt: "What is the simple interest on ₹10,000 at 8% per year for two years?",
    options: ["₹800", "₹1,600", "₹1,664", "₹2,000"], answer: 1,
    explanation: "Simple interest = principal × rate × time = 10,000 × 0.08 × 2 = ₹1,600.",
  },
  {
    id: "quant-3", subject: "Quantitative Aptitude", topic: "Averages",
    prompt: "The mean of 4, 6, 8 and x is 7. What is x?",
    options: ["8", "9", "10", "12"], answer: 2,
    explanation: "The required total is 7 × 4 = 28. The known values total 18, so x = 10.",
  },
  {
    id: "econ-1", subject: "Business Economics", topic: "Demand",
    prompt: "With other factors unchanged, a fall in a good's price usually causes what along its demand curve?",
    options: ["A fall in quantity demanded", "A rise in quantity demanded", "No change in quantity demanded", "A shift of the supply curve"], answer: 1,
    explanation: "The law of demand describes a higher quantity demanded at a lower price, other factors held constant.",
  },
  {
    id: "econ-2", subject: "Business Economics", topic: "Opportunity cost",
    prompt: "What is the opportunity cost of choosing one option?",
    options: ["Every option available", "The value of the next best alternative forgone", "Only the money paid", "The total market price"], answer: 1,
    explanation: "Opportunity cost is the value of the next best alternative you give up.",
  },
  {
    id: "econ-3", subject: "Business Economics", topic: "Market equilibrium",
    prompt: "At a competitive market equilibrium, what is equal?",
    options: ["Price and income", "Total cost and fixed cost", "Quantity demanded and quantity supplied", "Demand and profit"], answer: 2,
    explanation: "At the equilibrium price, quantity demanded equals quantity supplied.",
  },
  { id: "quant-4", subject: "Quantitative Aptitude", topic: "Percentages", prompt: "A price rises from ₹200 to ₹250. What is the percentage increase?", options: ["20%", "25%", "30%", "50%"], answer: 1, explanation: "Increase = ₹50. Divide by the original ₹200 to get 25%." },
  { id: "quant-5", subject: "Quantitative Aptitude", topic: "Ratio", prompt: "If A:B = 3:5 and A = 24, what is B?", options: ["30", "36", "40", "45"], answer: 2, explanation: "One part equals 8, so B = 5 × 8 = 40." },
  { id: "quant-6", subject: "Quantitative Aptitude", topic: "Probability", prompt: "A fair die is rolled once. What is the probability of an even number?", options: ["1/6", "1/3", "1/2", "2/3"], answer: 2, explanation: "There are three even outcomes among six equally likely outcomes." },
  { id: "quant-7", subject: "Quantitative Aptitude", topic: "Linear equations", prompt: "If 3x + 7 = 22, what is x?", options: ["3", "4", "5", "6"], answer: 2, explanation: "Subtract 7 and divide the remaining 15 by 3." },
  { id: "quant-8", subject: "Quantitative Aptitude", topic: "Statistics", prompt: "What is the median of 2, 4, 7, 9, 12?", options: ["4", "6", "7", "9"], answer: 2, explanation: "The middle observation in the ordered set is 7." },
  { id: "econ-4", subject: "Business Economics", topic: "Elasticity", prompt: "Demand is relatively elastic when the percentage change in quantity demanded is what compared with the percentage change in price?", options: ["Smaller", "Equal", "Larger", "Zero"], answer: 2, explanation: "Relatively elastic demand has elasticity greater than one." },
  { id: "econ-5", subject: "Business Economics", topic: "Costs", prompt: "Which cost does not vary with output in the short run?", options: ["Variable cost", "Marginal cost", "Fixed cost", "Average variable cost"], answer: 2, explanation: "Total fixed cost remains constant over the relevant short-run output range." },
  { id: "econ-6", subject: "Business Economics", topic: "Supply", prompt: "Other things equal, a rise in production cost usually causes the supply curve to move in which direction?", options: ["Right", "Left", "It stays fixed", "It becomes vertical"], answer: 1, explanation: "Higher cost reduces the quantity suppliers are willing to offer at each price." },
  { id: "econ-7", subject: "Business Economics", topic: "Market structure", prompt: "In perfect competition, an individual firm is generally a: ", options: ["Price maker", "Price taker", "Monopolist", "Regulator"], answer: 1, explanation: "One small firm cannot materially affect the market price." },
  { id: "econ-8", subject: "Business Economics", topic: "National income", prompt: "GDP measured at market prices includes the value of which goods?", options: ["Only intermediate goods", "Final goods and services produced domestically", "Only imported goods", "Only government goods"], answer: 1, explanation: "GDP counts final goods and services produced within the country during the period." },
  { id: "quant-9", subject: "Quantitative Aptitude", topic: "Compound interest", prompt: "₹1,000 grows at 10% compounded annually. What is its value after two years?", options: ["₹1,100", "₹1,200", "₹1,210", "₹1,220"], answer: 2, explanation: "1,000 × 1.1 × 1.1 = ₹1,210." },
  { id: "quant-10", subject: "Quantitative Aptitude", topic: "Sets", prompt: "If A has 5 elements and B has 3 elements with no overlap, how many elements are in A ∪ B?", options: ["2", "5", "8", "15"], answer: 2, explanation: "For disjoint sets, the union contains 5 + 3 = 8 elements." },
  { id: "quant-11", subject: "Quantitative Aptitude", topic: "Indices", prompt: "What is 2³ × 2²?", options: ["16", "32", "64", "128"], answer: 1, explanation: "Add exponents with the same base: 2⁵ = 32." },
  { id: "quant-12", subject: "Quantitative Aptitude", topic: "Time value", prompt: "What is the simple interest on ₹5,000 at 6% per year for one year?", options: ["₹150", "₹250", "₹300", "₹600"], answer: 2, explanation: "5,000 × 0.06 × 1 = ₹300." },
  { id: "quant-13", subject: "Quantitative Aptitude", topic: "Sequences", prompt: "In the arithmetic sequence 3, 7, 11, … what is the fifth term?", options: ["15", "17", "19", "23"], answer: 2, explanation: "The common difference is 4; the fifth term is 3 + 4×4 = 19." },
  { id: "quant-14", subject: "Quantitative Aptitude", topic: "Statistics", prompt: "The values 2, 2, 3, 5, 8 have which mode?", options: ["2", "3", "4", "8"], answer: 0, explanation: "The mode is the value appearing most often; 2 appears twice." },
  { id: "quant-15", subject: "Quantitative Aptitude", topic: "Probability", prompt: "A bag has 3 red and 2 blue balls. One ball is drawn at random. What is P(red)?", options: ["2/5", "3/5", "1/2", "3/2"], answer: 1, explanation: "Three of the five equally likely balls are red." },
  { id: "quant-16", subject: "Quantitative Aptitude", topic: "Percentages", prompt: "A ₹400 item is discounted by 10%. What is the sale price?", options: ["₹360", "₹380", "₹390", "₹440"], answer: 0, explanation: "Ten percent of ₹400 is ₹40; 400 − 40 = ₹360." },
  { id: "quant-17", subject: "Quantitative Aptitude", topic: "Linear equations", prompt: "Solve 2(x − 3) = 10.", options: ["5", "6", "8", "13"], answer: 2, explanation: "Divide by 2, then add 3: x = 8." },
  { id: "quant-18", subject: "Quantitative Aptitude", topic: "Averages", prompt: "What is the average of 10, 20, and 30?", options: ["15", "20", "25", "30"], answer: 1, explanation: "(10 + 20 + 30) ÷ 3 = 20." },
  { id: "quant-19", subject: "Quantitative Aptitude", topic: "Ratio", prompt: "Divide ₹600 in the ratio 1:2. What is the larger share?", options: ["₹200", "₹300", "₹400", "₹500"], answer: 2, explanation: "There are three parts, each ₹200. The larger share has two parts." },
  { id: "quant-20", subject: "Quantitative Aptitude", topic: "Statistics", prompt: "What is the range of 6, 8, 11, and 17?", options: ["9", "10", "11", "17"], answer: 2, explanation: "Range = maximum − minimum = 17 − 6 = 11." },
  { id: "econ-9", subject: "Business Economics", topic: "Demand", prompt: "A rise in consumer income generally shifts demand for a normal good in which direction?", options: ["Left", "Right", "It never shifts", "It becomes vertical"], answer: 1, explanation: "Higher income typically increases demand for a normal good at each price." },
  { id: "econ-10", subject: "Business Economics", topic: "Opportunity cost", prompt: "A student chooses to study instead of taking a paid shift. The forgone wage is an example of: ", options: ["Sunk cost", "Opportunity cost", "Fixed cost", "Marginal revenue"], answer: 1, explanation: "The value of the next-best option forgone is opportunity cost." },
  { id: "econ-11", subject: "Business Economics", topic: "Supply", prompt: "A production subsidy, other things equal, would usually shift supply: ", options: ["Left", "Right", "Nowhere", "Only upward along the curve"], answer: 1, explanation: "The subsidy reduces effective production cost and encourages more supply at each price." },
  { id: "econ-12", subject: "Business Economics", topic: "Elasticity", prompt: "If the price elasticity of demand is zero, demand is: ", options: ["Perfectly elastic", "Unit elastic", "Perfectly inelastic", "Relatively elastic"], answer: 2, explanation: "Quantity demanded does not respond to a change in price." },
  { id: "econ-13", subject: "Business Economics", topic: "Costs", prompt: "Marginal cost is the change in total cost from producing: ", options: ["All units", "One additional unit", "No units", "Only fixed inputs"], answer: 1, explanation: "Marginal cost measures the extra cost of one more unit of output." },
  { id: "econ-14", subject: "Business Economics", topic: "Markets", prompt: "A single seller with no close substitutes is characteristic of: ", options: ["Perfect competition", "Monopoly", "Monopolistic competition", "Oligopoly"], answer: 1, explanation: "A monopoly has one seller and no close substitutes for its product." },
  { id: "econ-15", subject: "Business Economics", topic: "National income", prompt: "Which is included in GDP for the current year?", options: ["Sale of a used car", "Newly produced services", "A gift transfer", "Purchase of an existing share"], answer: 1, explanation: "GDP counts current production of final goods and services, not transfers or resale of existing assets." },
  { id: "econ-16", subject: "Business Economics", topic: "Production", prompt: "In the short run, at least one factor of production is: ", options: ["Fixed", "Imported", "Free", "Government owned"], answer: 0, explanation: "The short run is defined by at least one fixed input." },
  { id: "econ-17", subject: "Business Economics", topic: "Demand", prompt: "Tea and coffee are substitutes. A rise in the price of tea would usually: ", options: ["Reduce demand for coffee", "Increase demand for coffee", "Leave coffee demand fixed", "Reduce coffee supply"], answer: 1, explanation: "Some consumers switch to coffee, shifting its demand to the right." },
  { id: "econ-18", subject: "Business Economics", topic: "Market equilibrium", prompt: "At a price below equilibrium, a competitive market usually has: ", options: ["Surplus", "Shortage", "No transactions", "Excess supply"], answer: 1, explanation: "Quantity demanded exceeds quantity supplied, producing a shortage." },
  { id: "econ-19", subject: "Business Economics", topic: "Costs", prompt: "Average fixed cost as output rises generally: ", options: ["Rises", "Falls", "Stays constant", "Turns negative"], answer: 1, explanation: "The same total fixed cost is spread across more units." },
  { id: "econ-20", subject: "Business Economics", topic: "Demand", prompt: "A movement along a given demand curve is caused by a change in: ", options: ["Income", "Taste", "The good's own price", "Population"], answer: 2, explanation: "Changing the good's own price changes quantity demanded along the same curve." },
];
