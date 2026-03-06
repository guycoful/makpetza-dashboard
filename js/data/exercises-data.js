// Exercise definitions for Academy tab
export const EXERCISES = [
  {
    num: 1,
    title: 'זיהוי מגמה בגרף',
    desc: 'בחר מניה, טען גרף וזהה את המגמה הנוכחית (עולה/יורדת/צדדית). סמן רמות תמיכה והתנגדות.',
    hasChart: true,
    fields: [
      { id: 'trend', type: 'select', label: 'מגמה', options: ['עולה', 'יורדת', 'צדדית'] },
      { id: 'support', type: 'text', label: 'רמת תמיכה ($)' },
      { id: 'resistance', type: 'text', label: 'רמת התנגדות ($)' },
      { id: 'notes', type: 'textarea', label: 'הסבר' }
    ]
  },
  {
    num: 2,
    title: 'זיהוי דפוסי נרות',
    desc: 'בחר מניה, טען גרף וחפש דפוסי נרות יפניים (Doji, Hammer, Engulfing וכו\').',
    hasChart: true,
    fields: [
      { id: 'pattern', type: 'text', label: 'דפוס שזוהה' },
      { id: 'meaning', type: 'select', label: 'משמעות', options: ['שורי (Bullish)', 'דובי (Bearish)', 'ניטרלי'] },
      { id: 'notes', type: 'textarea', label: 'הסבר' }
    ]
  },
  {
    num: 3,
    title: 'ניתוח P/E ורווחיות',
    desc: 'בחר מניה, שלוף נתוני P/E ורווחיות. האם המניה יקרה או זולה יחסית?',
    hasData: true,
    dataFields: ['pe', 'fpe', 'eps', 'rev', 'gp', 'oi', 'ni', 'margin'],
    fields: [
      { id: 'valuation', type: 'select', label: 'הערכה', options: ['יקרה', 'הוגנת', 'זולה'] },
      { id: 'notes', type: 'textarea', label: 'הסבר' }
    ]
  },
  {
    num: 4,
    title: 'חישוב Risk/Reward',
    desc: 'הזן מחיר כניסה, Stop Loss ו-Target. חשב את יחס הסיכון/סיכוי. דרוש לפחות 1:4.',
    fields: [
      { id: 'entry', type: 'number', label: 'מחיר כניסה ($)' },
      { id: 'sl', type: 'number', label: 'Stop Loss ($)' },
      { id: 'target', type: 'number', label: 'Target ($)' },
      { id: 'rr', type: 'text', label: 'R/R Ratio', readonly: true },
      { id: 'notes', type: 'textarea', label: 'הסבר' }
    ]
  },
  {
    num: 5,
    title: 'ניתוח מאזן (P/B)',
    desc: 'בחר מניה ובדוק P/B, הון עצמי, חובות ויחסי נזילות.',
    hasData: true,
    dataFields: ['pb', 'bvps', 'cr', 'de', 'assets', 'liab', 'equity'],
    fields: [
      { id: 'health', type: 'select', label: 'בריאות פיננסית', options: ['חזקה', 'סבירה', 'חלשה'] },
      { id: 'notes', type: 'textarea', label: 'הסבר' }
    ]
  },
  {
    num: 6,
    title: 'הבנת הביזנס',
    desc: 'בחר חברה ותאר את המודל העסקי שלה: מה היא עושה, מי הלקוחות, איך היא מרוויחה כסף.',
    fields: [
      { id: 'business', type: 'textarea', label: 'תיאור המודל העסקי' },
      { id: 'customers', type: 'textarea', label: 'לקוחות עיקריים' },
      { id: 'revenue', type: 'textarea', label: 'מקורות הכנסה' },
      { id: 'notes', type: 'textarea', label: 'הערות נוספות' }
    ]
  },
  {
    num: 7,
    title: 'זיהוי חפיר תחרותי',
    desc: 'בחר חברה וזהה את החפיר התחרותי שלה. מהם היתרונות שמגנים עליה מפני מתחרים?',
    fields: [
      { id: 'moat-type', type: 'select', label: 'סוג חפיר', options: ['מותג', 'פטנטים', 'אפקט רשת', 'עלויות מעבר', 'יתרון בעלויות', 'אחר'] },
      { id: 'strength', type: 'select', label: 'חוזק', options: ['חזק', 'בינוני', 'חלש', 'אין חפיר'] },
      { id: 'notes', type: 'textarea', label: 'הסבר' }
    ]
  },
  {
    num: 8,
    title: 'ניתוח מתחרים',
    desc: 'בחר חברה והשווה אותה ל-2-3 מתחרים. מי מוביל? מי בפיגור?',
    fields: [
      { id: 'company', type: 'text', label: 'חברה נבחרת' },
      { id: 'comp1', type: 'text', label: 'מתחרה 1' },
      { id: 'comp2', type: 'text', label: 'מתחרה 2' },
      { id: 'comp3', type: 'text', label: 'מתחרה 3' },
      { id: 'advantage', type: 'textarea', label: 'יתרונות החברה' },
      { id: 'disadvantage', type: 'textarea', label: 'חסרונות החברה' }
    ]
  },
  {
    num: 9,
    title: 'בניית Watchlist',
    desc: 'בנה רשימת מעקב של 5 מניות מסקטורים שונים. לכל מניה ציין למה היא מעניינת.',
    fields: [
      { id: 'stock1', type: 'text', label: 'מניה 1 (Ticker + סיבה)' },
      { id: 'stock2', type: 'text', label: 'מניה 2 (Ticker + סיבה)' },
      { id: 'stock3', type: 'text', label: 'מניה 3 (Ticker + סיבה)' },
      { id: 'stock4', type: 'text', label: 'מניה 4 (Ticker + סיבה)' },
      { id: 'stock5', type: 'text', label: 'מניה 5 (Ticker + סיבה)' }
    ]
  },
  {
    num: 10,
    title: 'סיכום ניתוח מלא',
    desc: 'בצע ניתוח מלא של מניה: BUS Score + יחסים פיננסיים + ניתוח טכני. הגע להחלטת קנייה/החזקה/מכירה.',
    fields: [
      { id: 'ticker', type: 'text', label: 'Ticker' },
      { id: 'bus-score', type: 'text', label: 'BUS Score (1-5)' },
      { id: 'financial-score', type: 'text', label: 'Financial Score (1-5)' },
      { id: 'technical-score', type: 'text', label: 'Technical Score (1-5)' },
      { id: 'total', type: 'text', label: 'Total Score' },
      { id: 'decision', type: 'select', label: 'החלטה', options: ['Buy', 'Hold', 'Sell'] },
      { id: 'notes', type: 'textarea', label: 'סיכום והסבר' }
    ]
  }
];
