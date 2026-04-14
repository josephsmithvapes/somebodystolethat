import { useState, useEffect, useRef } from "react";

// ── FONTS (non-blocking) ───────────────────────────────────────────────────────
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap";
  document.head.appendChild(l);
})();

// ── DESIGN TOKENS ──────────────────────────────────────────────────────────────
const T = {
  paper:    "#f8f6f1",
  white:    "#ffffff",
  ink:      "#0f0e0c",
  dim:      "#3d3835",
  quiet:    "#7a6f68",
  rule:     "#d4cfc7",
  ruleHard: "#0f0e0c",
  red:      "#b91c1c",
  green:    "#15803d",
  serif:    "'Playfair Display', Georgia, serif",
  body:     "'Lora', Georgia, serif",
  mono:     "'DM Mono', monospace",
};

// ── STATIC FALLBACK HEADLINES (shown instantly, replaced by live) ──────────────
const FALLBACK_HEADLINES = [
  { text: "DOJ charges hospice operators in $180M Medicare fraud sweep" },
  { text: "SEC halts $90M crypto Ponzi scheme targeting retail investors" },
  { text: "IRS-CI dismantles ERC mill network; $2.8B in false claims" },
  { text: "FBI arrests 15 in NJ synthetic identity credit bust-out ring" },
  { text: "SBA-OIG recovers $62M in fraudulent COVID EIDL loans" },
  { text: "FTC warns of surge in deed theft targeting elderly homeowners" },
  { text: "FinCEN flags deepfake KYC bypass attempts at US banks" },
  { text: "NICB: staged auto accident rings up 34% in Southern California" },
];

// ── DATA ───────────────────────────────────────────────────────────────────────
const YEAR_START = new Date(new Date().getFullYear(), 0, 1);
const secElapsed = () => (Date.now() - YEAR_START) / 1000;

const CATS = [
  { id:"healthcare", icon:"🏥", label:"Healthcare & Hospice", color:"#dc2626", annualB:100, perSec:3170,
    tagline:"Phantom billing, kickback networks, non-terminal enrollments",
    overview:"California hospice fraud alone has produced hundreds of federal indictments. Operators enroll non-terminal patients, bill Medicare $200–$400/day, and pay cappers $500–$2,000 per referral. LA accounts for the majority of national prosecutions.",
    stats:[["$100B","annual US loss (FBI)"],["$400/day","Medicare RHC rate"],["85%","CA share of hospice cases"],["15–20 yrs","avg scheme lifespan"]],
    cases:["Akbar Pacific Corp, Los Angeles (2022) — $27M","Amir Ayub, San Diego (2023) — $14M","Optimus Healthcare, Inland Empire (2021) — $100M+"],
    statutes:["31 U.S.C. § 3729 — False Claims Act","42 U.S.C. § 1320a-7b — Anti-Kickback Statute","18 U.S.C. § 1347 — Healthcare Fraud"],
    diagram:`flowchart LR\n  A["Capper / Marketer\n$500–2K per patient"] -->|illegal referral| B\n  C["Physician\nFake certification"] --> B\n  D["Board & Care Facility\nKickback"] --> B\n  B["Hospice Operator"] --> E["Medicare Billing\n$200–400/day"]\n  B --> F["Ghost Visit Logs"]\n  B --> G["Upcoded to GIP\n$1,000+/day"]\n  E & F & G --> H["Revenue via\nshell companies"]\n  H --> I["HHS-OIG / FBI\nWhistleblower flag"]\n  I --> J["Prosecution\n3× damages"]`
  },
  { id:"insurance", icon:"📋", label:"Insurance Fraud", color:"#b45309", annualB:308, perSec:9766,
    tagline:"Staged accidents, arson-for-profit, workers comp schemes",
    overview:"The largest fraud category by volume. Staged auto accidents, arson, and inflated claims cost every US household $400–$700/year in elevated premiums. NICB estimates 10% of all P&C premiums fund fraud.",
    stats:[["$308B","annual US loss"],["$700","cost per household/yr"],["10%","of P&C premiums lost"],["1 in 10","workers comp claims fraudulent"]],
    cases:["LA Staged Accident Ring (2021) — 30 defendants, $2.6M","Carlos Argueta Workers Comp, CA (2022) — $1.4M","Florida PIP fraud network (2023) — $150M+"],
    statutes:["18 U.S.C. § 1033 — Insurance fraud","18 U.S.C. § 1341 — Mail fraud","Cal. Ins. Code § 1871.4 — Workers comp fraud"],
    diagram:`flowchart TD\n  A["Fraud Entry Points"] --> B & C & D & E\n  B["Staged Accidents"] --> F["Fake injury claims\nPhantom passengers"]\n  C["Arson-for-Profit"] --> G["Total loss claim"]\n  D["Workers Comp\nFake injury"] --> H["Disability payments"]\n  E["Premium Fraud\nGhost brokers"] --> I["Consumer uninsured"]\n  F & G & H & I --> J["$308B/yr extracted"]`
  },
  { id:"tax", icon:"🧾", label:"Tax Fraud", color:"#0e7490", annualB:600, perSec:19025,
    tagline:"Tax gap, identity refund schemes, offshore evasion",
    overview:"The IRS 'tax gap' exceeds $600B annually. Identity theft refund fraud, ERC mill schemes, offshore account evasion, and underreported cash income are the primary vectors.",
    stats:[["$600B+","annual IRS tax gap"],["$5.5B","identity refund fraud"],["$330B","underreported income gap"],["1M+","false returns flagged/yr"]],
    cases:["GEMS refund scheme (2022) — $1.4B claimed","Offshore HSBC accounts (DOJ) — $1.9B settlement","ERC mill schemes (2023–24) — $2.8B fraudulent claims"],
    statutes:["26 U.S.C. § 7201 — Tax evasion (felony)","26 U.S.C. § 7206 — Filing false returns","18 U.S.C. § 1028A — Aggravated identity theft"],
    diagram:`flowchart TD\n  A["Tax Fraud Taxonomy"] --> B & C & D\n  B["Identity Refund Fraud\nStolen SSNs"] --> B1["Fake W-2s\nRefund to prepaid card"]\n  C["Business Fraud\nUnreported cash"] --> C1["Shell companies\nFalse invoices"]\n  D["Offshore Evasion\nFATCA violations"] --> D1["Swiss / Cayman accounts\nCrypto obfuscation"]\n  B1 & C1 & D1 --> E["$600B+ annual gap"]`
  },
  { id:"medicare", icon:"💊", label:"Medicare & Medicaid", color:"#6d28d9", annualB:60, perSec:1902,
    tagline:"DME fraud, upcoding, ghost services, telemedicine abuse",
    overview:"CMS estimates $60B in improper payments annually. Durable medical equipment schemes, unnecessary lab tests, and ghost physician services are dominant vectors. Telemedicine has accelerated DME fraud dramatically since 2020.",
    stats:[["$60B","CMS improper payments/yr"],["$1B+","DME fraud per year"],["7%","of Medicare spend improper"],["500+","federal convictions/yr"]],
    cases:["National sweep (2023) — $1.8B, 300+ defendants","Philip Esformes, Miami — $1.3B nursing/hospice fraud","Telemedicine DME ring (2022) — $1.2B brace fraud"],
    statutes:["42 U.S.C. § 1320a-7b — Anti-Kickback","42 U.S.C. § 1320a-7a — Civil Monetary Penalties","18 U.S.C. § 1347 — Healthcare Fraud"],
    diagram:`flowchart LR\n  A["Fraudulent Providers"] --> B & C & D\n  B["DME Schemes\nUnneeded equipment"] --> E["Telemedicine front\nPhysician rubber-stamps"]\n  C["Lab Billing Fraud\nUnneeded tests"] --> F["Recruiter paid per\nblood draw referral"]\n  D["Ghost Services\nNever rendered"] --> G["Fabricated records\nCloned EHR notes"]\n  E & F & G --> H["CMS auto-pays"] --> I["HEAT Task Force\nRAC audit"]`
  },
  { id:"ppp", icon:"🏛️", label:"PPP & COVID Relief", color:"#065f46", annualB:45, perSec:1427,
    tagline:"Fake businesses, inflated payrolls, EIDL abuse",
    overview:"The SBA disbursed ~$800B with minimal verification. DOJ estimates $64B was fraudulently obtained. Statute of limitations extended to 10 years for COVID fraud.",
    stats:[["$64B","fraudulent PPP (DOJ)"],["$80B","fraudulent EIDL (SBA-OIG)"],["1,000+","federal charges filed"],["10 yrs","statute of limitations"]],
    cases:["Solomon Aiabedini, CA (2023) — 151 loans, $4.5M","Dinesh Sah, TX (2021) — 15 loans, $24.8M","Richard Ayvazyan, CA (2021) — $21M, fled to Armenia"],
    statutes:["18 U.S.C. § 1344 — Bank fraud","18 U.S.C. § 1343 — Wire fraud","15 U.S.C. § 645 — SBA false statements"],
    diagram:`flowchart TD\n  A["PPP / EIDL Fraud"] --> B & C & D\n  B["Shell Business\nFake EIN, no employees"] --> B1["Fabricated payroll docs\nFraudulent bank stmts"]\n  C["Payroll Inflation\nReal biz overstates"] --> C1["Inflated 941 forms"]\n  D["Multi-Entity Stacking\nSame owner, many EINs"] --> D1["Loan network\naccount linking"]\n  B1 & C1 & D1 --> E["SBA approves without\nverification (2020)"] --> F["Crypto, cars, luxury"] --> G["SBA-OIG / FinCEN\nSAR flag"]`
  },
  { id:"identity", icon:"🪪", label:"Identity & Synthetic Fraud", color:"#9a3412", annualB:52, perSec:1649,
    tagline:"Synthetic IDs, credit bust-out, deepfake KYC bypass",
    overview:"Synthetic identity fraud — combining real SSNs with fabricated data — is the fastest-growing financial crime. AI deepfakes now defeat KYC verification at scale. Each synthetic identity can extract $10K–$100K before bust-out.",
    stats:[["$52B","annual loss (Javelin 2023)"],["$6B","synthetic ID fraud alone"],["15M","US victims/year"],["20%","of new accounts are synthetic"]],
    cases:["Manmeet Ahluwalia synthetic ring, NJ (2022) — $1M+","Deepfake KYC bypass (Binance, 2023) — disclosed","CA EDD benefit fraud (2020–21) — $20B+ state loss"],
    statutes:["18 U.S.C. § 1028 — Identity fraud","18 U.S.C. § 1028A — Aggravated (+2 yrs mandatory)","18 U.S.C. § 1344 — Bank fraud"],
    diagram:`flowchart LR\n  A["Synthetic Identity\nReal SSN + fake data"] --> B["Credit Piggybacking\nBuild history as AU"]\n  B --> C["New Accounts\n6–18 month sleeper"]\n  C --> D["Limit Increases\nOn-time payments"]\n  D --> E["BUST-OUT\nMax all lines at once"]\n  E --> F["$10K–100K per ID"]\n  A2["AI Deepfake\nBypass KYC"] --> C`
  },
  { id:"securities", icon:"📈", label:"Securities & Investment", color:"#1e3a8a", annualB:40, perSec:1268,
    tagline:"Ponzi schemes, pump & dump, insider trading, crypto fraud",
    overview:"From Madoff to FTX, securities fraud exploits information asymmetry and investor trust. The SEC received 40,000+ tips in FY2023 and issued $10.2B in enforcement actions.",
    stats:[["$40B+","annual investor losses"],["$4.9B","Madoff recovery (ongoing)"],["40K+","SEC tips/year"],["$10.2B","SEC enforcement FY2023"]],
    cases:["Bernie Madoff — $65B Ponzi (largest ever)","Sam Bankman-Fried / FTX (2022) — $8B customer funds","Trevor Milton, Nikola (2022) — $193M securities fraud"],
    statutes:["15 U.S.C. § 78j — Securities Exchange Act § 10(b)","17 C.F.R. § 240.10b-5 — SEC Rule 10b-5","18 U.S.C. § 1348 — Securities fraud (criminal)"],
    diagram:`flowchart TD\n  A["Securities Fraud"] --> B & C & D\n  B["Ponzi / Pyramid\nReturns from new capital"] --> B1["Affinity fraud\nTrusted communities"]\n  C["Pump & Dump\nHype then sell"] --> C1["Discord / Telegram\nCrypto token blasts"]\n  D["Insider Trading\nMaterial non-public info"] --> D1["Options before\nmergers / earnings"]\n  B1 & C1 & D1 --> E["Investor losses"] --> F["SEC / FINRA\nSAR / pattern detection"]`
  },
  { id:"realestate", icon:"🏠", label:"Real Estate & Mortgage", color:"#831843", annualB:26, perSec:824,
    tagline:"Deed theft, mortgage fraud, foreclosure rescue schemes",
    overview:"Mortgage fraud surged post-pandemic as rising home values created incentives. Deed theft — forging ownership documents to steal equity — devastates elderly homeowners in urban markets.",
    stats:[["$26B","annual loss (CoreLogic)"],["1 in 123","loan apps contain fraud"],["$500M+","deed fraud losses/yr"],["40%","fraud spike 2020–2022"]],
    cases:["Westside deed theft ring, LA (2023) — 11 properties","HomeSafe mortgage fraud, Phoenix (2022) — $23M","Cornelius Stripling foreclosure rescue, GA — $4.9M"],
    statutes:["18 U.S.C. § 1014 — Loan/credit application fraud","18 U.S.C. § 1343 — Wire fraud","Cal. Penal Code § 115 — Filing false instruments"],
    diagram:`flowchart TD\n  A["Real Estate Fraud"] --> B & C & D\n  B["Deed / Title Fraud\nForged grant deed"] --> B1["Vacant or rental\nElders targeted"]\n  C["Mortgage Fraud\nFalse income / appraisals"] --> C1["Default planned\nor quick flip"]\n  D["Foreclosure Rescue\nOwner signs over deed"] --> D1["Becomes tenant\nin own home"]\n  B1 & C1 & D1 --> E["Equity extracted"] --> F["FBI Mortgage Fraud\nTask Force"]`
  },
  { id:"immigration", icon:"🛂", label:"Immigration Fraud", color:"#0f766e", annualB:8, perSec:254,
    tagline:"Document fraud, visa mills, notario scams, marriage fraud",
    overview:"Immigration fraud spans both sides: schemes exploiting legal pathways (visa fraud, marriage fraud, asylum fabrication) and predatory schemes targeting immigrants themselves (notario scams). The State Dept. processes 14M+ visa applications per year.",
    stats:[["$8B+","estimated annual fraud loss"],["14M+","visa applications/yr"],["$2B+","notario fraud losses"],["90%","marriage fraud involves organized rings"]],
    cases:["Operation Janus (DOJ, ongoing) — 300K+ denaturalization reviews","Texas notario ring (2022) — $3.2M from 800+ victims","Farmington University visa mill (ICE, 2019) — 250 enrolled","Marriage fraud network, Houston (2023) — 60 defendants"],
    statutes:["18 U.S.C. § 1546 — Fraud and misuse of visas & documents","18 U.S.C. § 1425 — Procurement of citizenship by fraud (25 yrs)","18 U.S.C. § 1001 — False statements to USCIS","8 U.S.C. § 1325(c) — Marriage fraud (5 yrs)"],
    diagram:`flowchart TD\n  A["Immigration Fraud"] --> B & C & D & E\n  B["Document Fraud\nFake visas, forged I-9s"] --> B1["Counterfeit docs\nfrom criminal networks"]\n  C["Marriage Fraud\nSham marriages for\ngreen cards"] --> C1["Organized rings\n$10K–$30K per petition"]\n  D["Visa Mill Fraud\nFake schools / employers"] --> D1["Student & H-1B abuse\nWorkers never employed"]\n  E["Asylum Fraud\nFabricated persecution"] --> E1["Fraud coaches\n$2K–$10K per script"]\n  B1 & C1 & D1 & E1 --> F["USCIS approves\nwithout field verification"]\n  A --> G["Notario Scams\nTargeting immigrants"]\n  G --> H["Unlicensed practitioners\nbotch filings"]\n  H --> I["Victim faces\ndeportation & loss"]\n  F & I --> J["USCIS FDNS\nICE HSI / DOJ"]`
  },
];

const TOTAL_PER_SEC = CATS.reduce((s,c) => s + c.perSec, 0);
const SESSION_START = Date.now();

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmtBig = n => "$" + Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
const fmtShort = n => n>=1e12?"$"+(n/1e12).toFixed(2)+"T":n>=1e9?"$"+(n/1e9).toFixed(1)+"B":n>=1e6?"$"+(n/1e6).toFixed(1)+"M":"$"+Math.floor(n).toLocaleString();
const fmtDur = ms => { const s=Math.floor(ms/1000); return s<60?s+"s":Math.floor(s/60)+"m "+(s%60)+"s"; };

// ── REPORTING DATA ─────────────────────────────────────────────────────────────
const REPORTING = {
  healthcare: { agency:"HHS Office of Inspector General", hotline:"1-800-HHS-TIPS", url:"oig.hhs.gov/fraud/report-fraud", note:"Report Medicare/Medicaid billing irregularities, kickbacks, or unnecessary services." },
  insurance:  { agency:"NICB / State Dept. of Insurance", hotline:"1-800-TEL-NICB", url:"nicb.org/report-fraud", note:"Report staged accidents, arson, inflated claims. Your state DOI also accepts tips." },
  tax:        { agency:"IRS Criminal Investigation", hotline:"1-800-829-0433", url:"reportfraud.irs.gov", note:"Submit Form 3949-A. IRS whistleblowers earn 15–30% of proceeds over $2M." },
  medicare:   { agency:"HHS-OIG / CMS", hotline:"1-800-HHS-TIPS", url:"oig.hhs.gov/fraud/report-fraud", note:"Report unnecessary DME, lab tests, or ghost services billed to Medicare." },
  ppp:        { agency:"SBA Office of Inspector General", hotline:"1-800-767-0385", url:"oig.sba.gov", note:"DOJ COVID-19 Fraud Task Force reviews all SBA-OIG referrals." },
  identity:   { agency:"FTC / FBI IC3", hotline:"1-877-382-4357", url:"reportidentitytheft.gov", note:"File with FTC for recovery steps. Report cybercrime at ic3.gov." },
  securities: { agency:"SEC / FINRA", hotline:"1-800-289-9999", url:"sec.gov/tcr", note:"SEC whistleblowers earn 10–30% of sanctions over $1M. Tips are confidential." },
  realestate: { agency:"FBI / HUD OIG", hotline:"1-800-347-3735", url:"tips.fbi.gov", note:"Report deed fraud to your county recorder and local FBI field office." },
  immigration:{ agency:"ICE Homeland Security Investigations", hotline:"1-866-347-2423", url:"tips.ice.gov", note:"Report visa fraud and notario scams. USCIS Fraud Detection: 1-800-375-5283." },
};

// ── DIAGRAM CONSTANTS ──────────────────────────────────────────────────────────
const WHO_PAYS_DEF = `flowchart TD
  TOP(["$1.23 TRILLION stolen annually in the US"])
  TOP --> A & B & C & D
  A["Healthcare & Medicare\n$160B/yr"] --> A1["CMS auto-pays claims"] --> A2["Medicare funding cut\nFederal deficit expands"]
  B["Insurance Fraud\n$308B/yr"] --> B1["Carriers absorb losses"] --> B2["Premiums rise\n+$400–700/household/yr"]
  C["Tax Fraud\n$600B/yr"] --> C1["IRS fails to collect"] --> C2["Deficit spending or\nhigher rates for filers"]
  D["Financial Fraud\n$118B+/yr"] --> D1["Banks absorb losses"] --> D2["Higher fees\ntighter credit"]
  A2 & B2 & C2 & D2 --> YOU(["YOU PAY\nEvery household — ~$3,700/yr"])
  YOU --> X1["Higher premiums"] & X2["Reduced services"] & X3["Higher prices"] & X4["Tighter credit"]
  style TOP fill:#0f0e0c,color:#f8f6f1,stroke:#0f0e0c
  style YOU fill:#b91c1c,color:#fff,stroke:#7f1d1d,stroke-width:3px`;

const WHO_COMMITS_DEF = `flowchart TD
  TOP(["WHO COMMITS FRAUD?\n$1.23T+ annually"])
  TOP --> A & B & C & D & E & F
  A["Organized Crime Rings\n~40% of healthcare fraud"] --> A1["Hospice rings\nStaged accidents\nIdentity factories"]
  B["Healthcare Insiders\nPhysicians, billers, DME"] --> B1["Ghost billing\nKickback schemes"]
  C["White-Collar Professionals\nAttorneys, CPAs, execs"] --> C1["Ponzi schemes\nMortgage fraud"]
  D["Opportunistic Individuals\n80%+ of PPP defendants"] --> D1["PPP/EIDL fraud\nRefund fraud"]
  E["Corrupt Insiders\n$130K median loss"] --> E1["Embezzlement\nBid rigging"]
  F["Undocumented Individuals\n$13.6B improper EITC/yr"] --> F1["Stolen/fabricated SSNs\nFraudulent benefit claims"]
  style TOP fill:#0f0e0c,color:#f8f6f1,stroke:#0f0e0c`;

const HOW_TO_STOP_DEF = `flowchart TD
  YOU(["YOU — See, suspect, or experience fraud"]) --> A & B & C
  A["Witness / Suspect"] --> A1["Document everything"] --> D["Report to the right agency"]
  B["Insider / Whistleblower"] --> B1["False Claims Act\nQui Tam — under seal"] --> E["15–30% of recovered funds"]
  C["Direct Victim"] --> C1["FTC / FBI IC3\nNotify your bank"] --> F["Case opened\nCredit freeze"]
  D --> G["HHS-OIG\n1-800-HHS-TIPS"] & H["IRS CI\nreportfraud.irs.gov"] & I["SEC\nsec.gov/tcr"] & J["SBA-OIG\n1-800-767-0385"] & K["ICE HSI\ntips.ice.gov"]
  style YOU fill:#0f0e0c,color:#f8f6f1,stroke:#0f0e0c
  style E fill:#f0fdf4,color:#14532d,stroke:#86efac,stroke-width:2px`;

const PERPETRATORS = [
  { label:"Organized Crime Rings",      stat:"~40%",   note:"of healthcare fraud volume",     blurb:"Multi-state enterprises running hospice rings, staged accident networks, and identity factories simultaneously." },
  { label:"Healthcare Insiders",        stat:"$1B+",   note:"DME fraud alone per year",        blurb:"Physicians, billers, DME suppliers. Ghost billing and kickback arrangements often run for years inside legitimate practices." },
  { label:"White-Collar Professionals", stat:"13 yrs", note:"avg before prosecution",          blurb:"Attorneys, CPAs, executives. Ponzi schemes and complex mortgage fraud with sophisticated concealment." },
  { label:"Opportunistic Individuals",  stat:"80%+",   note:"of PPP fraud defendants",         blurb:"First-time offenders emboldened by easy programs. PPP era created a massive surge of first-time fraudsters." },
  { label:"Corrupt Insiders",           stat:"$130K",  note:"median loss per incident (ACFE)", blurb:"Employees with privileged access. Hardest to detect due to trust and system familiarity." },
  { label:"Undocumented Individuals",   stat:"$13.6B", note:"improper EITC payments/yr (IRS)", blurb:"Use of stolen SSNs for employment and benefit access. Also heavily victimized by notario fraud and wage theft." },
];

const WHISTLEBLOWER_PROGRAMS = [
  { name:"False Claims Act — Qui Tam", agency:"DOJ",  reward:"15–30%", threshold:"Any amount",    blurb:"File a sealed lawsuit on behalf of the government. Attorneys work on contingency." },
  { name:"IRS Whistleblower Program",  agency:"IRS",  reward:"15–30%", threshold:"$2M+ dispute",  blurb:"Submit Form 211. Awards have exceeded $100M. Average resolution takes 7–10 years." },
  { name:"SEC Whistleblower Program",  agency:"SEC",  reward:"10–30%", threshold:"$1M+ sanction", blurb:"Over $1.3B paid since 2012. Identity protected. Employer retaliation is prohibited." },
  { name:"CFTC Whistleblower Program", agency:"CFTC", reward:"10–30%", threshold:"$1M+ sanction", blurb:"Covers commodities and derivatives fraud. Anti-retaliation protections mirror the SEC program." },
];

// ── SECTION RULE ───────────────────────────────────────────────────────────────
function Rule({ label, number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, margin:"52px 0 36px" }}>
      {number && <span style={{ fontFamily:T.mono, fontSize:10, color:T.quiet, letterSpacing:1, flexShrink:0 }}>{number}</span>}
      <div style={{ flex:1, height:1, background:T.ruleHard }} />
      {label && <span style={{ fontFamily:T.mono, fontSize:9, color:T.ink, letterSpacing:3, textTransform:"uppercase", flexShrink:0 }}>{label}</span>}
      <div style={{ flex:1, height:1, background:T.ruleHard }} />
    </div>
  );
}

// ── PULL STAT ──────────────────────────────────────────────────────────────────
function PullStat({ value, label }) {
  return (
    <div style={{ borderTop:`1px solid ${T.ruleHard}`, borderBottom:`1px solid ${T.rule}`, padding:"20px 0" }}>
      <div style={{ fontFamily:T.serif, fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:T.ink, lineHeight:1, marginBottom:6 }}>{value}</div>
      <div style={{ fontFamily:T.body, fontSize:12, fontStyle:"italic", color:T.dim }}>{label}</div>
    </div>
  );
}

// ── MERMAID DIAGRAM ────────────────────────────────────────────────────────────
function Diagram({ id, def, ready }) {
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    if (!ready || done.current || !ref.current) return;
    done.current = true;
    window.mermaid.render("m-"+id+"-"+Date.now(), def).then(({svg}) => {
      if (ref.current) ref.current.innerHTML = svg;
    }).catch(()=>{});
  }, [ready]);
  return (
    <div ref={ref} style={{ overflowX:"auto", minHeight:80 }}>
      <div style={{ fontFamily:T.mono, fontSize:9, color:T.quiet, padding:"20px 0", letterSpacing:2 }} aria-hidden="true">Rendering diagram…</div>
    </div>
  );
}

// ── NEWS TICKER ────────────────────────────────────────────────────────────────
// Seeded with static fallbacks immediately — no layout flash
function NewsTicker({ headlines }) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const xRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const animate = () => {
      const total = el.scrollWidth / 2;
      xRef.current += 0.5;
      if (xRef.current >= total) xRef.current = 0;
      el.style.transform = `translateX(-${xRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [headlines]);

  const items = [...headlines, ...headlines];
  return (
    <div style={{ background:T.ink, overflow:"hidden", height:30, display:"flex", alignItems:"center" }} role="marquee" aria-label="Fraud Wire — latest fraud enforcement news">
      <div style={{ flexShrink:0, padding:"0 16px", fontFamily:T.mono, fontSize:8, color:T.red, letterSpacing:3, borderRight:"1px solid #2a2520", height:"100%", display:"flex", alignItems:"center", whiteSpace:"nowrap" }} aria-hidden="true">
        FRAUD WIRE
      </div>
      <div style={{ overflow:"hidden", flex:1 }} aria-hidden="true">
        <div ref={ref} style={{ display:"flex", whiteSpace:"nowrap", willChange:"transform" }}>
          {items.map((h,i) => (
            <span key={i} style={{ fontFamily:T.body, fontStyle:"italic", fontSize:11, color:"#c8c0b8", padding:"0 28px", borderRight:"1px solid #2a2520", display:"inline-flex", alignItems:"center", height:30, gap:8 }}>
              <span style={{ color:T.red, fontSize:8 }}>◆</span>{h.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SESSION WIDGET ─────────────────────────────────────────────────────────────
function SessionWidget() {
  const [elapsed, setElapsed] = useState(0);
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - SESSION_START), 1000);
    return () => clearInterval(id);
  }, []);
  if (!vis) return null;
  const stolen = (elapsed/1000) * TOTAL_PER_SEC;
  return (
    <aside aria-label="Fraud losses since you arrived" style={{ position:"fixed", bottom:"max(24px, env(safe-area-inset-bottom, 24px))", right:24, zIndex:200, background:T.white, border:`1px solid ${T.ruleHard}`, padding:"14px 18px 12px", maxWidth:200, boxShadow:"0 2px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontFamily:T.mono, fontSize:8, color:T.red, letterSpacing:3 }}>SINCE YOU ARRIVED</span>
        <button onClick={() => setVis(false)} aria-label="Dismiss" style={{ fontFamily:T.mono, fontSize:11, color:T.quiet, cursor:"pointer", background:"none", border:"none", padding:0 }}>×</button>
      </div>
      <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:900, color:T.ink, lineHeight:1, marginBottom:4 }}>
        {fmtShort(stolen)}
      </div>
      <div style={{ height:1, background:T.rule, margin:"8px 0" }} />
      <div style={{ fontFamily:T.body, fontStyle:"italic", fontSize:11, color:T.quiet }}>stolen in {fmtDur(elapsed)}</div>
    </aside>
  );
}

// ── FEATURED CASE CARD ─────────────────────────────────────────────────────────
function FeaturedCard({ item, idx }) {
  const cat = CATS.find(c => c.id === item.category) || CATS[0];
  return (
    <article style={{ flex:"1 1 200px", minWidth:0, borderTop:`2px solid ${T.ink}`, paddingTop:14, animation:`fadeUp 0.5s ease ${idx*0.1}s both` }}>
      <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>
        {cat.label} · {item.date} · {item.location}
      </div>
      <h3 style={{ fontFamily:T.serif, fontSize:16, fontWeight:700, color:T.ink, lineHeight:1.35, marginBottom:10 }}>{item.title}</h3>
      <div style={{ height:1, background:T.rule, marginBottom:10 }} />
      <p style={{ fontFamily:T.body, fontSize:12, color:T.dim, lineHeight:1.75, marginBottom:12 }}>{item.summary}</p>
      <div style={{ fontFamily:T.mono, fontSize:14, color:T.red, fontWeight:500 }}>{item.amount}</div>
    </article>
  );
}

// ── CATEGORY TILE ──────────────────────────────────────────────────────────────
function CatTile({ cat, total, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onKeyDown={e => (e.key==="Enter"||e.key===" ") && onClick()}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      role="button" tabIndex={0}
      aria-label={`View ${cat.label} fraud breakdown`}
      style={{ borderTop:`2px solid ${hov?T.ink:T.rule}`, paddingTop:14, cursor:"pointer", transition:"border-color 0.15s", outline:"none" }}
    >
      <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, textTransform:"uppercase", marginBottom:8 }}>
        {cat.icon}  ${cat.annualB}B / yr
      </div>
      <div style={{ fontFamily:T.serif, fontSize:16, fontWeight:700, color:T.ink, lineHeight:1.3, marginBottom:8 }}>{cat.label}</div>
      <p style={{ fontFamily:T.body, fontSize:11, fontStyle:"italic", color:T.quiet, lineHeight:1.6, marginBottom:14 }}>{cat.tagline}</p>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", borderTop:`1px solid ${T.rule}`, paddingTop:10 }}>
        <span style={{ fontFamily:T.mono, fontSize:11, color:T.red }}>{fmtShort(total)}</span>
        <span style={{ fontFamily:T.body, fontStyle:"italic", fontSize:11, color:hov?T.ink:T.quiet, transition:"color 0.15s" }}>Read more →</span>
      </div>
    </div>
  );
}

// ── EDITORIAL SECTIONS ─────────────────────────────────────────────────────────
function WhoPays({ mReady }) {
  const costs = [
    ["Healthcare premiums","$900/yr"],["Insurance premium inflation","$650/yr"],
    ["Tax rate distortion","$1,200/yr"],["Banking fees & credit","$450/yr"],["Reduced public services","$500/yr"],
  ];
  return (
    <section aria-labelledby="who-pays-heading">
      <Rule label="Who Pays for Fraud?" number="I" />
      <h2 id="who-pays-heading" className="sr-only">Who Pays for Fraud?</h2>
      <p style={{ fontFamily:T.body, fontSize:15, color:T.dim, lineHeight:1.85, maxWidth:660, marginBottom:40 }}>
        Fraud has no victimless category. Every dollar stolen ripples outward through insurers, banks, and government agencies — until it reaches the same place: the everyday consumer and taxpayer.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", border:`1px solid ${T.rule}`, marginBottom:48 }}>
        {costs.map(([l,v],i) => (
          <div key={l} style={{ padding:"18px 16px", borderRight:`1px solid ${T.rule}`, borderBottom:`1px solid ${T.rule}` }}>
            <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:900, color:T.ink, marginBottom:4 }}>{v}</div>
            <div style={{ fontFamily:T.body, fontSize:11, fontStyle:"italic", color:T.quiet, lineHeight:1.5 }}>{l}</div>
          </div>
        ))}
        <div style={{ padding:"18px 16px", background:T.ink, borderBottom:`1px solid ${T.rule}` }}>
          <div style={{ fontFamily:T.serif, fontSize:20, fontWeight:900, color:T.white, marginBottom:4 }}>~$3,700/yr</div>
          <div style={{ fontFamily:T.body, fontSize:11, fontStyle:"italic", color:"#a09890", lineHeight:1.5 }}>per US household, total</div>
        </div>
      </div>
      <div style={{ border:`1px solid ${T.rule}`, padding:"24px 20px" }}>
        <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:18 }}>THE COST CASCADE</div>
        <Diagram id="whopays" def={WHO_PAYS_DEF} ready={mReady} />
      </div>
    </section>
  );
}

function WhoCommits({ mReady }) {
  return (
    <section aria-labelledby="who-commits-heading">
      <Rule label="Who Commits Fraud?" number="II" />
      <h2 id="who-commits-heading" className="sr-only">Who Commits Fraud?</h2>
      <p style={{ fontFamily:T.body, fontSize:15, color:T.dim, lineHeight:1.85, maxWidth:660, marginBottom:40 }}>
        There is no single profile. Fraud is perpetrated by organized criminal enterprises, trusted professionals, first-time opportunists, and corrupt insiders — often simultaneously across the same systems.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", border:`1px solid ${T.rule}`, marginBottom:48 }}>
        {PERPETRATORS.map((p,i) => (
          <div key={p.label} style={{ padding:"20px 18px", borderRight:`1px solid ${T.rule}`, borderBottom:`1px solid ${T.rule}` }}>
            <div style={{ fontFamily:T.serif, fontSize:24, fontWeight:900, color:T.ink, marginBottom:2 }}>{p.stat}</div>
            <div style={{ fontFamily:T.mono, fontSize:9, color:T.quiet, letterSpacing:1, marginBottom:10 }}>{p.note}</div>
            <div style={{ fontFamily:T.serif, fontSize:13, fontWeight:700, color:T.ink, marginBottom:6 }}>{p.label}</div>
            <p style={{ fontFamily:T.body, fontSize:11, fontStyle:"italic", color:T.quiet, lineHeight:1.6 }}>{p.blurb}</p>
          </div>
        ))}
      </div>
      <div style={{ border:`1px solid ${T.rule}`, padding:"24px 20px" }}>
        <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:18 }}>PERPETRATOR TYPES — SCHEME & SCALE</div>
        <Diagram id="whocommits" def={WHO_COMMITS_DEF} ready={mReady} />
      </div>
    </section>
  );
}

function HowToStop({ mReady }) {
  return (
    <section aria-labelledby="how-to-stop-heading">
      <Rule label="How to Help Stop Fraud" number="III" />
      <h2 id="how-to-stop-heading" className="sr-only">How to Help Stop Fraud</h2>
      <p style={{ fontFamily:T.body, fontSize:15, color:T.dim, lineHeight:1.85, maxWidth:660, marginBottom:40 }}>
        Fraud thrives on silence. Every report matters — and whistleblower programs can make you financially whole or earn a significant federal award.
      </p>
      <div style={{ border:`1px solid ${T.rule}`, padding:"24px 20px", marginBottom:40 }}>
        <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:18 }}>REPORTING ECOSYSTEM — WHO TO CALL</div>
        <Diagram id="howtostop" def={HOW_TO_STOP_DEF} ready={mReady} />
      </div>
      <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:20 }}>WHISTLEBLOWER PROGRAMS</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", border:`1px solid ${T.rule}` }}>
        {WHISTLEBLOWER_PROGRAMS.map((p,i) => (
          <div key={p.name} style={{ padding:"20px 18px", borderRight:`1px solid ${T.rule}`, borderBottom:`1px solid ${T.rule}` }}>
            <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:2, marginBottom:8 }}>{p.agency} · {p.threshold} min</div>
            <div style={{ fontFamily:T.serif, fontSize:13, fontWeight:700, color:T.ink, lineHeight:1.3, marginBottom:8 }}>{p.name}</div>
            <div style={{ fontFamily:T.serif, fontSize:28, fontWeight:900, color:T.green, marginBottom:6 }}>{p.reward}</div>
            <p style={{ fontFamily:T.body, fontSize:11, fontStyle:"italic", color:T.quiet, lineHeight:1.6 }}>{p.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── DETAIL PAGE ────────────────────────────────────────────────────────────────
function DetailPage({ cat, mReady, onBack }) {
  const r = REPORTING[cat.id];
  return (
    <main style={{ maxWidth:880, margin:"0 auto", padding:"0 32px 80px" }}>
      <nav aria-label="Breadcrumb" style={{ padding:"20px 0 0", borderBottom:`1px solid ${T.rule}`, marginBottom:0 }}>
        <button onClick={onBack} style={{ fontFamily:T.mono, fontSize:9, color:T.quiet, cursor:"pointer", letterSpacing:2, textTransform:"uppercase", background:"none", border:"none", padding:0 }}>
          ← All Categories
        </button>
      </nav>
      <div style={{ paddingTop:40, marginBottom:12 }}>
        <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, textTransform:"uppercase", marginBottom:16 }}>
          Fraud Category · {cat.icon}
        </div>
        <h1 style={{ fontFamily:T.serif, fontSize:"clamp(26px,5vw,48px)", fontWeight:900, color:T.ink, lineHeight:1.1, marginBottom:20 }}>{cat.label}</h1>
        <div style={{ height:2, background:T.ink, marginBottom:24 }} />
        <p style={{ fontFamily:T.body, fontSize:15, color:T.dim, lineHeight:1.85, maxWidth:680 }}>{cat.overview}</p>
      </div>

      {/* Pull stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:24, margin:"40px 0" }}>
        {cat.stats.map(([v,l]) => <PullStat key={l} value={v} label={l} />)}
      </div>

      {/* Report this */}
      {r && (
        <div style={{ borderLeft:`3px solid ${T.ink}`, paddingLeft:20, margin:"36px 0", display:"flex", flexWrap:"wrap", gap:24, alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:T.mono, fontSize:8, color:T.red, letterSpacing:3, marginBottom:8 }}>REPORT THIS FRAUD</div>
            <div style={{ fontFamily:T.serif, fontSize:14, fontWeight:700, color:T.ink, marginBottom:4 }}>{r.agency}</div>
            <div style={{ fontFamily:T.mono, fontSize:13, color:T.red }}>{r.hotline}</div>
            <div style={{ fontFamily:T.mono, fontSize:10, color:"#2563eb", marginTop:2 }}>{r.url}</div>
          </div>
          <p style={{ fontFamily:T.body, fontStyle:"italic", fontSize:13, color:T.quiet, lineHeight:1.75, maxWidth:440 }}>{r.note}</p>
        </div>
      )}

      {/* Diagram */}
      <div style={{ border:`1px solid ${T.rule}`, padding:"24px 20px", margin:"36px 0" }}>
        <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:18 }}>SCHEME TOPOLOGY</div>
        <Diagram id={cat.id} def={cat.diagram} ready={mReady} />
      </div>

      {/* Cases + Statutes — responsive, not hardcoded 1fr 1fr */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:40, borderTop:`1px solid ${T.rule}`, paddingTop:32 }}>
        <div>
          <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:20 }}>PROSECUTED CASES</div>
          {cat.cases.map(c => (
            <div key={c} style={{ fontFamily:T.body, fontSize:12, color:T.dim, padding:"10px 0", borderBottom:`1px solid ${T.rule}`, lineHeight:1.7 }}>
              <span style={{ color:T.red, marginRight:10, fontSize:10 }}>◆</span>{c}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily:T.mono, fontSize:8, color:T.quiet, letterSpacing:3, marginBottom:20 }}>FEDERAL STATUTES</div>
          {cat.statutes.map(s => (
            <div key={s} style={{ fontFamily:T.mono, fontSize:11, color:T.dim, padding:"10px 0", borderBottom:`1px solid ${T.rule}`, lineHeight:1.7 }}>
              <span style={{ color:T.ink, marginRight:8 }}>§</span>{s}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function FraudWatch() {
  const [page, setPage]       = useState("home");
  const [totals, setTotals]   = useState(() => {
    const s = secElapsed();
    const o = { total: s * TOTAL_PER_SEC };
    CATS.forEach(c => { o[c.id] = s * c.perSec; });
    return o;
  });
  const [featured, setFeatured]   = useState([]);
  const [casesLoading, setCasesL] = useState(true);
  // Seed with static fallbacks immediately — no flash
  const [headlines, setHeadlines] = useState(FALLBACK_HEADLINES);
  const [search, setSearch]       = useState("");
  const [mReady, setMReady]       = useState(false);

  // Mermaid — only load when needed
  useEffect(() => {
    if (window.mermaid) { setMReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.6.1/mermaid.min.js";
    s.onload = () => {
      window.mermaid.initialize({ startOnLoad:false, theme:"neutral", flowchart:{ curve:"basis", padding:20 } });
      setMReady(true);
    };
    document.head.appendChild(s);
  }, []);

  // Live news — two focused calls with proven parser
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET || "";
async function callAPI(sys, usr) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientSecret: CLIENT_SECRET,
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      tool_choice: { type: "auto" },
      system: sys,
      messages: [{ role: "user", content: usr }]
    })
  });
  const data = await res.json();
  let txt = "";
  for (const b of data.content || []) {
    if (b.type === "text") txt += b.text;
    if (b.type === "tool_result") {
      if (typeof b.content === "string") txt += b.content;
      if (Array.isArray(b.content)) txt += b.content.map(x => x.text || "").join("");
    }
  }
  return txt;
}
async function load() {
      try {
        // Check cache first
        const cached = await fetch(`${API_URL}/api/news-cache`).then(r => r.json());
        if (cached) {
          if (cached.featured) setFeatured(cached.featured);
          if (cached.headlines) setHeadlines(cached.headlines);
          setCasesL(false);
          return;
        }

        // Cache miss — call Anthropic with Haiku
        const ct = await callAPI(
          `You are a fraud intelligence analyst. Use web_search to find recent US fraud cases from official sources (justice.gov, fbi.gov, sec.gov, ftc.gov) in 2025. Return ONLY a raw JSON array — no markdown, no backticks. Each of 4 objects: title (string), category (one of: healthcare,insurance,tax,medicare,ppp,identity,securities,realestate,immigration), amount (string), date (string), location (string), summary (one sentence under 25 words).`,
          `Search justice.gov and fbi.gov for fraud press releases in 2025. Return 4 results as JSON array only.`
        );
        const cm = ct.match(/\[[\s\S]*\]/);
        const featured = cm ? JSON.parse(cm[0]) : [];
        if (featured.length) setFeatured(featured);

        const ht = await callAPI(
          `Use web_search to find 8 recent 2025 US fraud enforcement actions from DOJ, FBI, SEC, FTC, IRS official sources. Return ONLY a raw JSON array of 8 short strings (max 12 words each). No markdown, no backticks.`,
          `Search for recent 2025 fraud enforcement news. Return 8 headline strings as JSON array only.`
        );
        const hm = ht.match(/\[[\s\S]*\]/);
        const headlines = hm
          ? JSON.parse(hm[0]).map(h => ({ text: typeof h === "string" ? h : h.text || String(h) }))
          : [];
        if (headlines.length) setHeadlines(headlines);

        // Save to cache
        await fetch(`${API_URL}/api/news-cache`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured, headlines })
        });

      } catch(e) {
        console.error("News fetch:", e);
        setTimeout(load, 5000);
      } finally {
        setCasesL(false);
      }
    }
    setTimeout(load, 2000);
  }, []);

  // Counter
  useEffect(() => {
    const id = setInterval(() => {
      const s = secElapsed();
      const o = { total: s * TOTAL_PER_SEC };
      CATS.forEach(c => { o[c.id] = s * c.perSec; });
      setTotals(o);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const filtered = search.trim()
    ? CATS.filter(c => c.label.toLowerCase().includes(search.toLowerCase()) || c.tagline.toLowerCase().includes(search.toLowerCase()))
    : CATS;

  const activeCat = CATS.find(c => c.id === page);

  return (
    <div style={{ background:T.paper, minHeight:"100vh" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:${T.paper}; }
        ::-webkit-scrollbar-thumb { background:${T.rule}; }
        [role="button"]:focus-visible, button:focus-visible, input:focus-visible {
          outline: 2px solid ${T.ink};
          outline-offset: 2px;
        }
        /* Responsive overrides */
        @media (max-width: 640px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-sidebar { display: none !important; }
          .masthead-sub { display: none !important; }
          .session-widget { display: none !important; }
        }
        @media (max-width: 480px) {
          .page-pad { padding-left: 16px !important; padding-right: 16px !important; }
          .detail-pad { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      <NewsTicker headlines={headlines} />

      {/* MASTHEAD */}
      <header role="banner" style={{ background:T.white, borderBottom:`2px solid ${T.ink}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1160, margin:"0 auto", padding:"0 32px", display:"flex", alignItems:"center", height:56, gap:16 }}>
          <button onClick={() => setPage("home")} aria-label="Go to home page" style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:12, background:"none", border:"none", padding:0 }}>
            <div style={{ width:8, height:8, background:T.red, flexShrink:0 }} aria-hidden="true" />
            <span style={{ fontFamily:T.serif, fontWeight:900, fontSize:20, color:T.ink, letterSpacing:"-0.5px", whiteSpace:"nowrap" }}>
              Somebody<span style={{ color:T.red }}>StoleThat</span>
            </span>
          </button>
          <div className="masthead-sub" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:1, height:20, background:T.rule }} aria-hidden="true" />
            <span style={{ fontFamily:T.mono, fontSize:9, color:T.quiet, letterSpacing:1, whiteSpace:"nowrap" }}>US FRAUD INTELLIGENCE · {new Date().getFullYear()}</span>
          </div>
          <div style={{ flex:1 }} />
          {page==="home" && (
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search categories…"
              aria-label="Search fraud categories"
              style={{ padding:"5px 12px", border:`1px solid ${T.rule}`, borderBottom:`1px solid ${T.ink}`, background:"transparent", fontFamily:T.mono, fontSize:11, color:T.ink, width:"min(160px, 30vw)" }}
            />
          )}
          <div style={{ display:"flex", alignItems:"center", gap:6 }} aria-label="Live data indicator">
            <div style={{ width:5, height:5, borderRadius:"50%", background:"#16a34a", animation:"pulse 2s infinite" }} aria-hidden="true" />
            <span style={{ fontFamily:T.mono, fontSize:8, color:"#16a34a", letterSpacing:2 }}>LIVE</span>
          </div>
        </div>
      </header>

      {page === "home" && (
        <main>
          <div className="page-pad" style={{ maxWidth:1160, margin:"0 auto", padding:"0 32px" }}>

            {/* HERO */}
            <div style={{ padding:"64px 0 48px", borderBottom:`1px solid ${T.rule}` }}>
              <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:40, alignItems:"end" }}>
                <div>
                  <div style={{ fontFamily:T.mono, fontSize:9, color:T.quiet, letterSpacing:4, marginBottom:20 }}>
                    ESTIMATED US FRAUD LOSSES — CALENDAR YEAR {new Date().getFullYear()}
                  </div>
                  <div style={{ fontFamily:T.serif, fontWeight:900, fontSize:"clamp(34px,6.5vw,72px)", color:T.ink, lineHeight:1, letterSpacing:"-2px", marginBottom:16 }} aria-live="polite" aria-label={`Estimated fraud losses: ${fmtBig(totals.total)}`}>
                    {fmtBig(totals.total)}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <div style={{ width:20, height:2, background:T.red, flexShrink:0 }} aria-hidden="true" />
                    <span style={{ fontFamily:T.body, fontStyle:"italic", fontSize:14, color:T.quiet }}>
                      +${TOTAL_PER_SEC.toLocaleString()} per second · FBI · IRS · CMS · DOJ · Javelin · CoreLogic
                    </span>
                  </div>
                </div>
                <nav className="hero-sidebar" aria-label="Category quick links" style={{ display:"flex", flexDirection:"column", gap:8, minWidth:160 }}>
                  {CATS.map(c => (
                    <button key={c.id} onClick={() => setPage(c.id)} style={{ display:"flex", justifyContent:"space-between", gap:12, cursor:"pointer", alignItems:"baseline", background:"none", border:"none", padding:0, textAlign:"left" }}>
                      <span style={{ fontFamily:T.mono, fontSize:9, color:T.quiet }}>{c.icon} {c.label.split(" ")[0]}</span>
                      <span style={{ fontFamily:T.mono, fontSize:9, color:T.red }}>{fmtShort(totals[c.id])}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* RECENT CASES */}
            <section aria-labelledby="recent-cases-heading" style={{ padding:"48px 0 44px", borderBottom:`1px solid ${T.rule}` }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:16, marginBottom:32, flexWrap:"wrap" }}>
                <h2 id="recent-cases-heading" style={{ fontFamily:T.serif, fontSize:26, fontWeight:900, color:T.ink }}>Recent Cases</h2>
                <div style={{ flex:1, minWidth:40, height:1, background:T.rule }} aria-hidden="true" />
                <span style={{ fontFamily:T.mono, fontSize:8, color:T.red, letterSpacing:3 }} aria-label="AI sourced live data">AI-SOURCED · LIVE</span>
              </div>
              {casesLoading ? (
                <div style={{ display:"flex", gap:32, flexWrap:"wrap" }} aria-busy="true" aria-label="Loading recent cases">
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ flex:"1 1 160px", borderTop:`2px solid ${T.rule}`, paddingTop:14 }} aria-hidden="true">
                      <div style={{ height:10, background:T.rule, marginBottom:8, width:"60%", borderRadius:2 }} />
                      <div style={{ height:18, background:T.rule, marginBottom:8, borderRadius:2 }} />
                      <div style={{ height:12, background:T.rule, width:"80%", borderRadius:2 }} />
                    </div>
                  ))}
                </div>
              ) : featured.length > 0 ? (
                <div style={{ display:"flex", gap:32, flexWrap:"wrap" }}>
                  {featured.map((item,i) => <FeaturedCard key={i} item={item} idx={i} />)}
                </div>
              ) : (
                <p style={{ fontFamily:T.body, fontStyle:"italic", color:T.quiet }}>Unable to load live cases. Check back shortly.</p>
              )}
            </section>

            <WhoPays mReady={mReady} />
            <WhoCommits mReady={mReady} />
            <HowToStop mReady={mReady} />

            {/* CATEGORY DIRECTORY */}
            <section aria-labelledby="categories-heading" style={{ paddingBottom:60 }}>
              <Rule label="Fraud Categories" number="IV" />
              <h2 id="categories-heading" className="sr-only">Fraud Categories</h2>
              {search && <p style={{ fontFamily:T.mono, fontSize:10, color:T.quiet, marginBottom:20 }}>{filtered.length} result{filtered.length!==1?"s":""} for "{search}"</p>}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:"0 32px" }}>
                {filtered.map(cat => (
                  <div key={cat.id} style={{ borderBottom:`1px solid ${T.rule}`, marginBottom:28, paddingBottom:4 }}>
                    <CatTile cat={cat} total={totals[cat.id]} onClick={() => setPage(cat.id)} />
                  </div>
                ))}
              </div>
              {filtered.length === 0 && <p style={{ fontFamily:T.body, fontStyle:"italic", color:T.quiet, padding:"40px 0" }}>No categories match "{search}"</p>}
            </section>

            <footer role="contentinfo" style={{ borderTop:`1px solid ${T.rule}`, padding:"24px 0 48px", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
              <p style={{ fontFamily:T.mono, fontSize:9, color:T.quiet, lineHeight:2, maxWidth:600 }}>
                Sources: FBI Financial Crimes Report · NICB · IRS Data Book · CMS Improper Payments · DOJ PPP Task Force · Javelin Strategy & Research · CoreLogic Mortgage Fraud · SEC Annual Report FY2023 · ACFE Report to the Nations. Dollar figures are best-available annualized estimates. Recent cases sourced live via AI web search against official DOJ/FBI/SEC press releases.
              </p>
              <span style={{ fontFamily:T.serif, fontWeight:900, fontSize:14, color:T.rule }} aria-hidden="true">SomebodyStolethat.com</span>
            </footer>
          </div>
        </main>
      )}

      {activeCat && <DetailPage cat={activeCat} mReady={mReady} onBack={() => setPage("home")} />}
      <div className="session-widget"><SessionWidget /></div>
    </div>
  );
}
