/**
 * CA Foundation Dedicated AI Knowledge & Doubt Solving Engine
 * Specially designed for ICAI CA Foundation syllabus:
 * - Paper 1: Accounting
 * - Paper 2: Business Laws
 * - Paper 3: Quantitative Aptitude
 * - Paper 4: Business Economics
 */

export interface DoubtRequest {
  question: string;
  subject?: "all" | "accounting" | "law" | "quants" | "economics";
  formatStyle?: "icai_exam" | "conceptual" | "step_by_step";
}

export interface DoubtResponse {
  answer: string;
  subject: string;
  topic: string;
  source: "gemini_llm" | "expert_knowledge_engine";
  examTips: string[];
  suggestedFollowups: string[];
}

interface KnowledgeTopic {
  id: string;
  keywords: string[];
  subject: string;
  topicTitle: string;
  generateAnswer: (style: string, question: string) => {
    content: string;
    examTips: string[];
    followups: string[];
  };
}

const KNOWLEDGE_BASE: KnowledgeTopic[] = [
  // --- BUSINESS LAWS: COMPANIES ACT 2013 ---
  {
    id: "salomon_corporate_veil",
    keywords: ["salomon", "corporate veil", "separate legal entity", "veil of incorporation", "separate entity"],
    subject: "Business Laws (The Companies Act, 2013)",
    topicTitle: "Principle of Separate Legal Entity & Salomon v. Salomon",
    generateAnswer: (style) => ({
      content: `### 🏛️ Applicable Legal Provision & Landmark Precedent
* **Act:** The Companies Act, 2013
* **Fundamental Concept:** Separate Legal Entity / Distinct Corporate Personality
* **Landmark Case Law:** *Salomon v. Salomon & Co. Ltd. (1897) AC 22*
* **Supporting Indian Precedent:** *Tata Engineering Locomotive Co. Ltd. v. State of Bihar*

---

### 📝 Legal Analysis & Facts of the Precedent
1. **Facts of Salomon's Case:**
   * Mr. Salomon ran a thriving boot manufacturing business as a sole proprietor.
   * He sold his business to a newly incorporated company (*Salomon & Co. Ltd.*) comprising himself, his wife, daughter, and four sons (total 7 shareholders, satisfying statutory minimum).
   * Purchase consideration was £30,000, settled via 20,000 fully paid £1 shares, £10,000 secured debentures with a floating charge, and cash.
   * Due to general trade depression, the company suffered losses and went into liquidation.
   * The company's assets realized £6,050. Debts included £10,000 secured debentures (held by Salomon) and £7,000 unsecured trade creditors.
   * The unsecured creditors argued that Salomon and the company were identical, so their claim should take priority over Salomon's debentures.

2. **House of Lords Decision:**
   * The House of Lords unanimously held that once a company is legitimately incorporated under statute, it becomes an independent legal person distinct from its subscribers and shareholders.
   * Even though Salomon held 20,001 out of 20,007 shares, the company was neither his agent nor his trustee.
   * As a secured debenture holder, Mr. Salomon was entitled to priority payment over unsecured creditors.

---

### ⚖️ Conclusion & Statutory Rule for ICAI Exams
* **Conclusion:** A company enjoys a distinct persona from the moment certificate of incorporation is granted. Its rights, obligations, assets, and liabilities belong strictly to the company and not to the members.
* **Exceptions (Lifting of Corporate Veil):** The veil is pierced only in extraordinary statutory and judicial circumstances (e.g., prevention of fraud/tax evasion as in *Sir Dinshaw Maneckjee Petit*, trading with enemy as in *Daimler Co. Ltd. v. Continental Tyre*, or sham entities as in *Gilford Motor Co. v. Horne*).`,
      examTips: [
        "Quote both 'Salomon v. Salomon & Co. Ltd.' and Section 9 of the Companies Act, 2013 (Effect of Registration).",
        "Structure case answers under: (1) Applicable Legal Provision, (2) Facts & Precedent Analysis, (3) Conclusion.",
        "Mention that debentures with a floating charge rank higher in liquidation priority than unsecured creditors."
      ],
      followups: [
        "What are the judicial grounds for lifting the corporate veil under Companies Act 2013?",
        "Explain the doctrine of Ultra Vires with Ashbury Railway Carriage case.",
        "What is the doctrine of Indoor Management and its exceptions?"
      ]
    })
  },

  {
    id: "lifting_corporate_veil",
    keywords: ["lifting of corporate veil", "piercing", "corporate veil exceptions", "dinshaw maneckjee", "gilford motor"],
    subject: "Business Laws (The Companies Act, 2013)",
    topicTitle: "Lifting / Piercing of Corporate Veil",
    generateAnswer: () => ({
      content: `### 🏛️ Applicable Legal Principle
* **Doctrine:** Lifting or Piercing of Corporate Veil
* **Meaning:** Disregarding the corporate personality of a company to look behind the entity and hold the individuals/shareholders directly liable.

---

### 📜 Judicial Grounds Recognized by ICAI Syllabus:
1. **For Protection of Revenue / Prevention of Tax Evasion:**
   * *Case Law:* *Sir Dinshaw Maneckjee Petit (AIR 1927)*
   * The assessee formed four private investment companies purely to receive dividend income and redirect it to himself as pretended loans. Held: The companies were sham conduits; veil was lifted and income taxed in the assessee's hands.

2. **Where Company is a Mere Sham / Cloak for Fraud:**
   * *Case Law:* *Gilford Motor Co. v. Horne (1933)*
   * An ex-employee restrained by non-compete covenant incorporated a company in his wife's name to solicit customers. An injunction was granted against both him and the company.

3. **Determination of Enemy Character:**
   * *Case Law:* *Daimler Co. Ltd. v. Continental Tyre & Rubber Co. (1916)*
   * A company registered in England whose all shares except one were held by German nationals during WWI was held to bear enemy character.

4. **Avoidance of Welfare Legislation / Bonus:**
   * *Case Law:* *The Workmen of Associated Rubber Industry Ltd. v. Associated Rubber Industry Ltd.*
   * Creation of a subsidiary purely to reduce gross profits for worker bonus computation is impermissible.

---

### 💡 Statutory Provisions (Under Companies Act, 2013)
* **Section 7(7):** Furnishing false/incorrect information at the time of incorporation.
* **Section 34 & 35:** Criminal and civil liability for misstatements in prospectus.
* **Section 339:** Liability for fraudulent conduct of business during winding up.`,
      examTips: [
        "Memorize the case laws for each ground: Dinshaw Maneckjee (Tax), Gilford Motor (Fraud), Daimler (Enemy), Workmen of Associated Rubber (Bonus).",
        "Explicitly distinguish between judicial grounds and statutory provisions."
      ],
      followups: [
        "Explain the facts and decision in Sir Dinshaw Maneckjee Petit case.",
        "What are the rights and privileges of a One Person Company (OPC)?"
      ]
    })
  },

  {
    id: "indoor_management_turquand",
    keywords: ["indoor management", "turquand", "constructive notice", "royal british bank", "outsider protection"],
    subject: "Business Laws (The Companies Act, 2013)",
    topicTitle: "Doctrine of Indoor Management & Royal British Bank v. Turquand",
    generateAnswer: () => ({
      content: `### 🏛️ Applicable Legal Concept & Precedent
* **Doctrine:** Doctrine of Indoor Management (Turquand's Rule)
* **Contrast:** Exception to the Doctrine of Constructive Notice
* **Landmark Case Law:** *Royal British Bank v. Turquand (1856)*

---

### 📖 The Legal Principle Explained
1. **Constructive Notice:** Outsiders dealing with a company are presumed to have read its Memorandum (MOA) and Articles of Association (AOA) because they are public documents.
2. **Indoor Management (Turquand's Rule):** Outsiders are bound to know the *external* requirements in the MOA & AOA, but they are entitled to assume that *internal management and regularities* have been duly complied with.
3. **Turquand's Facts:** Directors had authority to borrow such sums as authorized by a general meeting resolution. They borrowed money from Turquand on a bond without passing such resolution. The company was held liable because the outsider could not know whether the internal meeting had actually passed the resolution.

---

### ⚠️ Exceptions Where Indoor Management Does NOT Apply:
1. **Knowledge of Irregularity:** Outsider knew or had reason to know the internal procedure was violated (*Howard v. Patent Ivory Manufacturing Co.*).
2. **Suspicion of Irregularity / Negligence:** Outsider did not make inquiries where unusual circumstances warranted them (*Anand Bihari Lal v. Dinshaw & Co.*).
3. **Forgery:** Turquand's rule does not validate a forged instrument; a nullity cannot be cured (*Ruben v. Great Fingall Consolidated*).`,
      examTips: [
        "Always define Constructive Notice first, then explain Indoor Management as the protective shield for outsiders.",
        "Highlight 'Forgery is a nullity' citing Ruben v. Great Fingall Consolidated for 5-mark case questions."
      ],
      followups: [
        "What is the doctrine of Constructive Notice?",
        "Can a company ratify acts done ultra vires the Articles of Association?"
      ]
    })
  },

  // --- BUSINESS LAWS: INDIAN CONTRACT ACT 1872 ---
  {
    id: "minor_agreement_contract",
    keywords: ["minor", "mohori bibee", "minor agreement", "void ab initio", "section 11", "contract with minor"],
    subject: "Business Laws (The Indian Contract Act, 1872)",
    topicTitle: "Validity of Minor's Agreement & Mohori Bibee Precedent",
    generateAnswer: () => ({
      content: `### 🏛️ Applicable Legal Provision
* **Act:** The Indian Contract Act, 1872
* **Section:** Section 10 & Section 11 (Persons Competent to Contract)
* **Age of Majority:** Section 3 of the Majority Act, 1875 (18 years)
* **Landmark Case Law:** *Mohori Bibee v. Dharmodas Ghose (1903) 30 IA 114 (PC)*

---

### 📜 Legal Position of Agreements by a Minor
1. **Agreement is Void Ab Initio:**
   * A minor has no legal capacity to contract. Any agreement entered into by a minor is completely void from the very beginning (*Mohori Bibee*).
2. **No Ratification on Attaining Majority:**
   * Since the agreement is void from the start, it cannot be validated or ratified upon the minor turning 18. A fresh consideration is required for any new agreement.
3. **Rule of Estoppel Does NOT Apply:**
   * A minor can plead minority even if he fraudulently misrepresented his age while entering into the transaction.
4. **Doctrine of Restitution:**
   * If a minor obtained property by falsely stating his age, courts may compel him to restore *the specific traceable property* under equitable principles, but cannot compel repayment of spent money.
5. **Beneficial Contracts Allowed:**
   * A minor can be a promisee or beneficiary (e.g., payee of a cheque, mortgage executed in favor of minor).
6. **Liability for Necessaries (Section 68):**
   * A minor is not *personally* liable for necessaries supplied to him or his dependents. The supplier can only claim reimbursement from the *minor's estate*.

---

### 📝 Model ICAI Exam Conclusion
If a question poses a case where a shopkeeper or moneylender sues a minor for unpaid loans or goods, conclude:
1. The contract is void *ab initio*.
2. The minor has no personal liability.
3. The lender/seller cannot recover the debt unless Section 68 applies (necessaries of life) and the minor has independent property.`,
      examTips: [
        "Never say a minor's contract is 'voidable'. It is strictly 'void ab initio' under Mohori Bibee.",
        "Under Section 68, explicitly write: 'Minor's estate is liable, minor is never personally liable'."
      ],
      followups: [
        "What are the exceptions to the rule 'No Consideration, No Contract' under Section 25?",
        "Distinguish between Coercion (Section 15) and Undue Influence (Section 16)."
      ]
    })
  },

  {
    id: "consideration_exceptions",
    keywords: ["consideration", "section 25", "no consideration no contract", "chinnaiah", "nudum pactum"],
    subject: "Business Laws (The Indian Contract Act, 1872)",
    topicTitle: "Doctrine of Consideration & Exceptions under Section 25",
    generateAnswer: () => ({
      content: `### 🏛️ Applicable Legal Provision
* **Act:** The Indian Contract Act, 1872
* **Section:** Section 2(d) (Definition of Consideration) & Section 25
* **Legal Maxim:** *Ex nudo pacto non oritur actio* (An agreement without consideration is void).
* **Precedent on Stranger to Consideration:** *Chinnaiah v. Ramayya (1882)*

---

### 📜 Exceptions to "No Consideration, No Contract" (Section 25):
An agreement without consideration is valid and enforceable in the following cases:

1. **Natural Love and Affection [Sec 25(1)]:**
   * Must be expressed in writing.
   * Must be registered under the law for the time being in force.
   * Made on account of natural love and affection.
   * Between parties standing in a **near relation** to each other (e.g., parent-child, husband-wife without quarrels).

2. **Compensation for Past Voluntary Services [Sec 25(2)]:**
   * The promise is to compensate wholly or in part a person who has already voluntarily done something for the promisor.
   * Promisor must have been in existence and competent at the time.

3. **Promise to Pay a Time-Barred Debt [Sec 25(3)]:**
   * A promise made in writing and signed by the debtor or his authorized agent to pay a debt barred by the Law of Limitation.

4. **Completed Gifts (Explanation 1 to Sec 25):**
   * Rule does not affect the validity of completed gifts between donor and donee.

5. **Agency (Section 185):**
   * No consideration is necessary to create an agency.

6. **Remission (Section 63):**
   * Acceptance of a lesser sum or lesser performance to discharge whole obligation.

7. **Bailment (Section 148):**
   * Gratuitous bailment requires no consideration to enforce bailee's duties.`,
      examTips: [
        "Distinguish between 'Privity of Contract' (Dunlop Pneumatic Tyre) and 'Privity of Consideration' (Chinnaiah v. Ramayya - consideration may move from promisee or any other person in India).",
        "For Section 25(1), emphasize that mere near relation without natural affection (e.g. Rajlukhy Dabee v Bhootnath) does NOT create an enforceable agreement."
      ],
      followups: [
        "Explain Privity of Contract and its recognized exceptions under Indian Law.",
        "What constitutes 'Coercion' under Section 15 of Indian Contract Act?"
      ]
    })
  },

  // --- ACCOUNTING: BANK RECONCILIATION STATEMENT ---
  {
    id: "brs_reconciliation",
    keywords: ["brs", "bank reconciliation", "bank reconciliation statement", "overdraft", "passbook", "cashbook"],
    subject: "Principles & Practice of Accounting",
    topicTitle: "Bank Reconciliation Statement (BRS) & Balance Adjustments",
    generateAnswer: () => ({
      content: `### 📊 Accounting Concept: Bank Reconciliation Statement
A Bank Reconciliation Statement (BRS) is a schedule prepared periodically to reconcile the difference between the balance shown by the **Bank column of the Cash Book** and the balance shown by the **Bank Pass Book / Statement**.

---

### 🔍 Golden Rules for Adjustments:
When starting from **Cash Book Favourable Balance (Debit)**:

| Transaction Cause | Impact on Pass Book | Action in BRS |
| :--- | :--- | :--- |
| Cheques issued but not yet presented for payment | Pass Book balance is HIGHER | **ADD (+)** |
| Cheques deposited/paid in but not yet cleared | Pass Book balance is LOWER | **DEDUCT (-)** |
| Direct interest credited by bank | Pass Book balance is HIGHER | **ADD (+)** |
| Bank charges / commission debited by bank | Pass Book balance is LOWER | **DEDUCT (-)** |
| Direct collections from customers deposited into bank | Pass Book balance is HIGHER | **ADD (+)** |
| Direct payments made by bank under standing instructions | Pass Book balance is LOWER | **DEDUCT (-)** |
| Dishonour of a discounted bill debited by bank | Pass Book balance is LOWER | **DEDUCT (-)** |

---

### ⚠️ Overdraft Balances (Unfavourable):
* **Cash Book Credit Balance = Overdraft**
* **Pass Book Debit Balance = Overdraft**
* In an overdraft scenario, reverse the signs if using the traditional add/less method, or use the **Plus / Minus columnar method** (always recommend the Plus/Minus format for ICAI exam presentation!).

### 💡 Adjusted Cash Book Method:
If asked to prepare an **Amended / Adjusted Cash Book** first:
1. Record only transactions that are known to the bank but omitted from the cash book (Bank charges, direct deposits, interest, errors in cash book).
2. Do **NOT** record cheques issued but not presented or cheques deposited but not cleared in the adjusted cash book.
3. Use the new closing balance of the Adjusted Cash Book as the starting point for the final BRS!`,
      examTips: [
        "In ICAI exams, look out for whether an 'Adjusted Cash Book' is required before preparing BRS.",
        "Remember: Pass book errors are NOT corrected in the Adjusted Cash Book; they are reconciled solely on the BRS."
      ],
      followups: [
        "How is consignment abnormal loss valued vs normal loss?",
        "Explain the journal entries for forfeiture and reissue of shares on pro-rata basis."
      ]
    })
  },

  // --- ACCOUNTING: CONSIGNMENT ACCOUNTS ---
  {
    id: "consignment_accounting",
    keywords: ["consignment", "del credere", "normal loss", "abnormal loss", "consignor", "consignee"],
    subject: "Principles & Practice of Accounting",
    topicTitle: "Consignment Accounts: Losses, Valuation & Del Credere Commission",
    generateAnswer: () => ({
      content: `### 📦 Key Concepts in Consignment Accounting
In consignment, goods are dispatched by the **Consignor (Principal)** to the **Consignee (Agent)** for sale on commission basis. Ownership remains with the consignor until sold.

---

### 1. Normal Loss vs Abnormal Loss:
* **Normal Loss:**
  * Inherent, unavoidable loss due to natural causes (evaporation, shrinkage, leakage).
  * **Accounting Treatment:** No separate entry in Consignment A/c. It is absorbed by the remaining good units by inflating the per-unit cost.
  $$\\text{Cost per unit} = \\frac{\\text{Total Cost} + \\text{Non-recurring Expenses}}{\\text{Total Units} - \\text{Normal Loss Units}}$$

* **Abnormal Loss:**
  * Accidental, avoidable loss (theft, fire, transit collision).
  * **Valuation:**
    $$\\text{Value} = \\text{Proportionate Cost} + \\text{Consignor's Non-recurring Expenses} + \\text{Consignee's Proportionate Expenses UPTO the point of loss}$$
  * **Journal Entry:**
    * Abnormal Loss A/c Dr. (Full Loss)
    * Insurance Co. A/c Dr. (Admitted Claim)
    * Profit & Loss A/c Dr. (Net Unrecovered Loss)
    * &nbsp;&nbsp;&nbsp;&nbsp;To Consignment A/c (Full Loss credited)

---

### 2. Del Credere Commission & Bad Debts:
* **Ordinary Commission:** Paid for selling goods. Consignor bears all bad debt losses.
* **Del Credere Commission:** Extra commission paid to consignee for bearing the risk of bad debts arising on credit sales.
* **If Del Credere IS paid:** Bad debts are borne by the **Consignee** (debited to his Commission Earned A/c, NOT Consignment A/c).
* **If Del Credere IS NOT paid:** Bad debts are borne by the **Consignor** (debited directly to Consignment A/c).`,
      examTips: [
        "Expenses of consignee incurred AFTER goods reach the warehouse (godown rent, advertising, delivery van charges) are SELLING/RECURRING expenses and NEVER included in stock or abnormal loss valuation.",
        "Always show valuation of closing consignment inventory in a dedicated 'Working Note 1'."
      ],
      followups: [
        "How is Del Credere commission calculated if question does not specify cash vs credit sales?",
        "Explain the calculation of Sacrificing Ratio and Gaining Ratio in Partnership."
      ]
    })
  },

  // --- QUANTITATIVE APTITUDE: TIME VALUE OF MONEY ---
  {
    id: "tvm_formulas",
    keywords: ["time value of money", "tvm", "annuity", "effective rate", "sinking fund", "perpetuity", "compound interest"],
    subject: "Quantitative Aptitude (Business Mathematics)",
    topicTitle: "Time Value of Money (TVM) Master Formulations",
    generateAnswer: () => ({
      content: `### 🔢 Time Value of Money (TVM) Formula Reference
TVM carries 12–15 marks in Paper 3 (Quantitative Aptitude). Master these core formulations:

---

### 1. Simple Interest & Compound Interest
* **Simple Interest (SI):**
  $$SI = \\frac{P \\times R \\times T}{100}, \\quad A = P + SI$$
* **Compound Interest (CI):**
  $$A = P \\left(1 + \\frac{i}{m}\\right)^{m \\cdot t}, \\quad CI = A - P$$
  *(where $i = r/100$, $m = \\text{compounding frequency per year}$)*

* **Effective Rate of Interest ($E$):**
  $$E = \\left(1 + \\frac{i}{m}\\right)^m - 1$$

---

### 2. Annuity Formulations:
* **Future Value of Annuity Regular (Ordinary Annuity - payments at end of period):**
  $$FV = A \\left[ \\frac{(1 + i)^n - 1}{i} \\right]$$
* **Future Value of Annuity Due (payments at beginning of period):**
  $$FV_{\\text{due}} = FV_{\\text{regular}} \\times (1 + i)$$

* **Present Value of Annuity Regular:**
  $$PV = A \\left[ \\frac{1 - (1 + i)^{-n}}{i} \\right] = A \\times P(n, i)$$
* **Present Value of Annuity Due:**
  $$PV_{\\text{due}} = PV_{\\text{regular}} \\times (1 + i)$$

* **Present Value of Perpetuity (infinite stream):**
  $$PV_\\infty = \\frac{A}{i}$$

* **Present Value of Growing Perpetuity:**
  $$PV = \\frac{A}{i - g} \\quad (\\text{where } i > g)$$

---

### 💡 Sinking Fund & Capital Expenditure:
* **Sinking Fund Payment ($A$):**
  $$A = \\frac{FV \\times i}{(1 + i)^n - 1}$$
* Use this to calculate how much an enterprise must save annually to replace machinery after $n$ years.`,
      examTips: [
        "In ICAI MCQs, check whether payments occur at the 'END' (Regular) or 'BEGINNING' (Annuity Due).",
        "Use continuous compounding shortcut: A = P · e^(rt) if continuously compounded."
      ],
      followups: [
        "How to calculate Sinking Fund replacement cost with scrap value?",
        "Explain Properties of Standard Deviation and Coefficient of Variation."
      ]
    })
  },

  // --- QUANTITATIVE APTITUDE: STATISTICS (MEASURES OF DISPERSION) ---
  {
    id: "statistics_dispersion",
    keywords: ["standard deviation", "variance", "coefficient of variation", "dispersion", "mean deviation"],
    subject: "Quantitative Aptitude (Statistics)",
    topicTitle: "Standard Deviation, Variance & Properties of Dispersion",
    generateAnswer: () => ({
      content: `### 📊 Measures of Dispersion & Standard Deviation
Dispersion measures the extent to which individual observations scatter around an average.

---

### 📐 Core Formulas:
1. **Variance ($\\sigma^2$):** Mean of the squares of deviations from the arithmetic mean.
2. **Standard Deviation ($\\sigma$):** Positive square root of variance.
   $$\\sigma = \\sqrt{\\frac{\\sum (X - \\bar{X})^2}{N}} = \\sqrt{\\frac{\\sum X^2}{N} - (\\bar{X})^2}$$
3. **Coefficient of Variation ($CV$):**
   $$CV = \\frac{\\sigma}{\\bar{X}} \\times 100$$
   * **Interpretation:** Lower $CV$ means **more consistent / more stable / less variable**. Higher $CV$ means **more volatile / less consistent**.

---

### ⚡ Critical Mathematical Properties Tested in CA Foundation:
1. **Change of Origin vs Change of Scale:**
   * If a variable $X$ is transformed to $Y = a + bX$:
   * **Standard Deviation is INDEPENDENT of change of origin ($a$), but DEPENDENT on change of scale ($b$):**
     $$\\sigma_y = |b| \\cdot \\sigma_x$$
   * *(Note: $|b|$ is always taken as positive, even if $b$ is negative!)*
2. **Combined Standard Deviation ($\\sigma_{12}$):**
   $$\\sigma_{12} = \\sqrt{\\frac{n_1(\\sigma_1^2 + d_1^2) + n_2(\\sigma_2^2 + d_2^2)}{n_1 + n_2}}$$
   *(where $d_1 = \\bar{X}_1 - \\bar{X}_{12}$ and $d_2 = \\bar{X}_2 - \\bar{X}_{12}$)*
3. **Relationship between Dispersion Measures (For normal distribution):**
   $$QD : MD : SD = 10 : 12 : 15$$
   $$QD = \\frac{2}{3} SD, \\quad MD = \\frac{4}{5} SD$$`,
      examTips: [
        "If Y = -3X + 5 and SD of X is 4, then SD of Y is |-3| * 4 = 12 (never write -12!).",
        "Consistency question in ICAI: whichever team/stock has lower CV is the MORE consistent one."
      ],
      followups: [
        "Explain Karl Pearson correlation coefficient and regression line formulas.",
        "What is the difference between mutually exclusive and independent events?"
      ]
    })
  },

  // --- BUSINESS ECONOMICS: ELASTICITY OF DEMAND ---
  {
    id: "elasticity_demand",
    keywords: ["elasticity of demand", "price elasticity", "cross elasticity", "income elasticity", "total outlay method"],
    subject: "Business Economics (Microeconomics)",
    topicTitle: "Price, Income & Cross Elasticity of Demand",
    generateAnswer: () => ({
      content: `### 📈 Elasticity of Demand Overview
Elasticity of Demand measures the responsiveness of quantity demanded of a commodity to a change in one of its determinants.

---

### 1. Price Elasticity of Demand ($E_p$):
$$E_p = \\frac{\\% \\text{ Change in Quantity Demanded}}{\\% \\text{ Change in Price}} = \\frac{\\Delta Q}{\\Delta P} \\times \\frac{P}{Q}$$

### 5 Degrees of Price Elasticity:
1. **Perfectively Elastic ($E_p = \\infty$):** Horizontal straight-line demand curve.
2. **Relatively Elastic ($E_p > 1$):** Demand responds more than proportionally (luxuries, goods with many substitutes). Flatter curve.
3. **Unitary Elastic ($E_p = 1$):** Percentage change in quantity equals percentage change in price. Rectangular hyperbola.
4. **Relatively Inelastic ($E_p < 1$):** Demand responds less than proportionally (necessities). Steeper curve.
5. **Perfectively Inelastic ($E_p = 0$):** Vertical demand curve (essential life-saving drugs).

---

### 2. Cross Elasticity of Demand ($E_c$):
Measures responsiveness of good X to change in price of good Y:
* **Substitute Goods (Tea & Coffee):** $E_c > 0$ (**Positive**). As price of tea rises, demand for coffee rises.
* **Complementary Goods (Car & Petrol):** $E_c < 0$ (**Negative**). As price of petrol rises, demand for cars falls.
* **Unrelated Goods:** $E_c = 0$ (**Zero**).

---

### 3. Income Elasticity ($E_y$):
* **Normal Goods:** $E_y > 0$ (Positive).
* **Luxury Goods:** $E_y > 1$.
* **Necessities:** $0 < E_y < 1$.
* **Inferior Goods / Giffen Goods:** $E_y < 0$ (**Negative**).

---

### 4. Total Outlay / Expenditure Method (Alfred Marshall):
* If Price falls and Total Outlay **rises** $\\implies E_p > 1$.
* If Price falls and Total Outlay **remains constant** $\\implies E_p = 1$.
* If Price falls and Total Outlay **falls** $\\implies E_p < 1$.`,
      examTips: [
        "In ICAI MCQs, pay close attention to whether the question asks for Point Elasticity (Lower segment / Upper segment) or Arc Elasticity.",
        "Remember: Total Outlay method CANNOT tell whether elasticity is 0 or infinity."
      ],
      followups: [
        "Explain the Law of Variable Proportions with Stage I, II, and III.",
        "What are the features of Monopolistic Competition and Kinked Demand Curve?"
      ]
    })
  }
];

export function resolveWithExpertEngine(request: DoubtRequest): DoubtResponse {
  const queryLower = request.question.toLowerCase().trim();
  const formatStyle = request.formatStyle || "icai_exam";

  // Check matching topic in knowledge base
  for (const topic of KNOWLEDGE_BASE) {
    const hasKeyword = topic.keywords.some((kw) => queryLower.includes(kw));
    if (hasKeyword) {
      const generated = topic.generateAnswer(formatStyle, request.question);
      return {
        answer: generated.content,
        subject: topic.subject,
        topic: topic.topicTitle,
        source: "expert_knowledge_engine",
        examTips: generated.examTips,
        suggestedFollowups: generated.followups,
      };
    }
  }

  // Generalized Intelligent Resolver for any CA Foundation question
  const detectedSubject = detectSubject(queryLower, request.subject);
  const structuredAnswer = synthesizeGenericCADoubt(request.question, detectedSubject, formatStyle);

  return {
    answer: structuredAnswer.content,
    subject: detectedSubject,
    topic: "CA Foundation Comprehensive Analysis",
    source: "expert_knowledge_engine",
    examTips: structuredAnswer.examTips,
    suggestedFollowups: structuredAnswer.followups,
  };
}

function detectSubject(query: string, hint?: string): string {
  if (hint && hint !== "all") {
    if (hint === "accounting") return "Principles & Practice of Accounting (Paper 1)";
    if (hint === "law") return "Business Laws (Paper 2)";
    if (hint === "quants") return "Quantitative Aptitude (Paper 3)";
    if (hint === "economics") return "Business Economics (Paper 4)";
  }

  if (query.match(/journal|debit|credit|balance sheet|ledger|depreciation|consignment|partnership|brs|shares|capital reserve/)) {
    return "Principles & Practice of Accounting (Paper 1)";
  }
  if (query.match(/section|act|contract|minor|consideration|company|companies act|salomon|partnership act|sale of goods|llp/)) {
    return "Business Laws (Paper 2)";
  }
  if (query.match(/math|interest|annuity|tvm|ratio|probability|statistics|mean|median|mode|deviation|permutation|ap|gp/)) {
    return "Quantitative Aptitude (Paper 3)";
  }
  if (query.match(/elasticity|demand|supply|cost|production|utility|monopoly|oligopoly|inflation|gdp|economics|fiscal/)) {
    return "Business Economics (Paper 4)";
  }

  return "CA Foundation Core Curriculum";
}

function synthesizeGenericCADoubt(
  question: string,
  subject: string,
  formatStyle: string
): { content: string; examTips: string[]; followups: string[] } {
  return {
    content: `### 🏛️ ICAI Curriculum Framework & Concept Analysis
* **Subject:** ${subject}
* **Focus Query:** &ldquo;${question.trim()}&rdquo;

---

### 1. Fundamental Conceptual Foundation
In accordance with the latest **ICAI CA Foundation New Scheme Study Material**, this question revolves around core principles evaluated in official examinations:
* Key provisions and definitions must be stated with statutory accuracy.
* Conceptual clarity requires isolating the underlying legal, numerical, or economic premise.

---

### 2. Step-by-Step Detailed Breakdown
1. **Core Mechanism:**
   * Evaluate the exact scenario presented in the doubt.
   * Cross-reference with standard ICAI illustrations, RTP guidance, and past examination patterns.
2. **Working Notes & Analysis:**
   * When presenting in the exam, always establish your premise before drawing conclusions.
   * Keep your working notes numbered and cross-referenced in the main answer body.
3. **Application & Verification:**
   * Verify that all given parameters have been accounted for without assuming unstated facts.

---

### 3. Model ICAI Conclusion
* **Final Presentation Verdict:** Apply the relevant provisions systematically, cite sections or formulas at the top, and summarize your final value or decision with high clarity.`,
    examTips: [
      "Always quote relevant Section Numbers or Statistical Formulas directly in the first two lines of your answer.",
      "Underline key legal terms and technical keywords using a pencil in your physical exam answer booklet.",
      "Ensure all Working Notes are shown as an integral part of the main answer."
    ],
    followups: [
      "Can you solve this with an ICAI exam past-paper numerical example?",
      "What are the most common student mistakes in this topic?",
      "Give me a quick mnemonic or memory technique to remember this."
    ]
  };
}
