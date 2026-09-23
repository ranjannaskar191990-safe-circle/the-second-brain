const kmRe=/(\d{1,4}\s*\/\s*\d{1,3})\s*(?:to|[-–—]|থেকে|से)\s*(\d{1,4}\s*\/\s*\d{1,3})/i;
const railway=/usfd|rail|rails|sleeper|sleepers|gfb|ngfb|70\s*deg|70degree|70\s*degree|45\s*deg|0\s*deg|obsr|sej|turnout|weld|welding|plated|not\s*plated|movement|left\s*rail|right\s*rail|up\s*line|down\s*line|inspection|patrolling|kilometer|কিলোমিটার|किलोमीटर|\bkm\b|\d{1,4}\s*\/\s*\d{1,3}\s*(?:to|[-–—])\s*\d{1,4}\s*\/\s*\d{1,3}/i;
const finance=/₹|\brs\.?\b|inr|টাকা|रुपये|salary|income|earned|earning|received|balance|cash|bank|sbi|fd|fixed deposit|rd|nps|loan|emi|credit card|spent|spend|খরচ|খরচা|আয়|ইনকাম|বেতন|পেয়েছি|জমা|ব্যালেন্স|খर्च|कमाया|वेतन|expense|breakfast|lunch|dinner/i;
const project=/kidshield|project|প্রজেক্ট|प्रोजेक्ट/i;
const taskIntent=/\b(remind me|todo|to-do|need to|must|have to)\b|মনে করিয়ে|করতে হবে|করা দরকার|করবো|करना है|याद दिलाना/i;
function money(t){const patterns=[/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/ig,/([\d,]+(?:\.\d{1,2})?)\s*(?:টাকা|রুপি|रुपये|rupees?|rs\.?)/ig];let out=[];for(const p of patterns)for(const m of t.matchAll(p))out.push(m[1].replace(/,/g,""));return out.at(-1)||""}
function financeInfo(t){
 let type="Expense";
 if(/transfer|transferred|from.+to|থেকে.+(?:fd|bank|account)|একাউন্ট.+থেকে|खाते.+से/i.test(t))type="Transfer";
 else if(/balance|আমার কাছে|কাছে আছে|bank.+আছে|cash.+আছে|ব্যালেন্স|शेष|balance is/i.test(t))type="Balance";
 else if(/loan|emi|credit card due|outstanding|ধার|ঋণ|कर्ज/i.test(t))type="Liability";
 else if(/\bfd\b|fixed deposit|\brd\b|\bnps\b|invest|investment|saving|সেভ|জমা করলাম|निवेश|बचत/i.test(t))type="Saving/Investment";
 else if(/salary|income|earned|earning|received|credited|বেতন|আয়|ইনকাম|পেয়েছি|कमाया|वेतन|आय/i.test(t))type="Income";
 let subcategory="";
 if(type==="Expense"){if(/breakfast|lunch|dinner|food|খাবার|খাওয়া/i.test(t))subcategory="Food";else if(/medicine|medical|doctor|hospital|ওষুধ/i.test(t))subcategory="Medical";else if(/travel|train|bus|taxi|uber|ola|petrol|diesel/i.test(t))subcategory="Travel";else if(/electric|mobile|internet|bill|recharge/i.test(t))subcategory="Bills";else if(/shopping|কিনেছি|purchase/i.test(t))subcategory="Shopping"}
 let account="";const a=t.match(/\b(sbi|hdfc|icici|axis|pnb|canara|union bank|bank of baroda|cash)\b/i);if(a)account=a[1];
 return{type,subcategory,account};
}
export function classify(text){
 const t=text.trim(),l=t.toLowerCase();let category="Personal";
 if(finance.test(t))category="Finance";
 if(railway.test(t))category="Railway Work";
 if(category==="Personal"&&project.test(t))category="Projects";
 if(category==="Personal"&&taskIntent.test(t))category="Tasks";
 const km=t.match(kmRe),amount=category==="Finance"?money(t):"";
 const bn=/[\u0980-\u09FF]/.test(t),hi=/[\u0900-\u097F]/.test(t),en=/[A-Za-z]/.test(t);let language=bn?"বাংলা":hi?"हिंदी":"English";if((bn||hi)&&en)language="Mixed";
 let workType="";if(category==="Railway Work"){if(/usfd|gfb|ngfb|70\s*deg|obsr/i.test(t))workType="USFD";else if(/inspection/i.test(t))workType="Inspection";else if(/patrolling/i.test(t))workType="Patrolling"}
 const fi=category==="Finance"?financeInfo(t):{};
 return{original:t,language,category,amount,...fi,kmFrom:km?.[1]?.replace(/\s/g,"")||"",kmTo:km?.[2]?.replace(/\s/g,"")||"",workType,status:"New"};
}