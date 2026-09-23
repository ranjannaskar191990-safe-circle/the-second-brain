const kmRe=/(\d{1,4}\s*\/\s*\d{1,3})\s*(?:to|[-–—]|থেকে|से)\s*(\d{1,4}\s*\/\s*\d{1,3})/i;
const railway=/usfd|rail|rails|sleeper|sleepers|gfb|ngfb|70\s*deg|70degree|70\s*degree|45\s*deg|0\s*deg|obsr|sej|turnout|weld|welding|plated|not\s*plated|movement|left\s*rail|right\s*rail|up\s*line|down\s*line|inspection|patrolling|kilometer|কিলোমিটার|किलोमीटर|\bkm\b|\d{1,4}\s*\/\s*\d{1,3}\s*(?:to|[-–—])\s*\d{1,4}\s*\/\s*\d{1,3}/i;
const finance=/₹|\brs\.?\b|inr|টাকা|रुपये|salary|income|earned|earning|received|balance|cash|bank|sbi|fd|fixed deposit|rd|nps|loan|emi|credit card|spent|spend|খরচ|খরচা|আয়|ইনকাম|বেতন|পেয়েছি|জমা|ব্যালেন্স|খर्च|कमाया|वेतन|expense|breakfast|lunch|dinner/i;
const project=/kidshield|project|প্রজেক্ট|प्रोजेक्ट/i;
const taskIntent=/\b(remind me|todo|to-do|need to|must|have to|to be done|schedule|to be filled|to be submitted|to be sent|to be completed)\b|\bby\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?(?:\s+(?:today|tomorrow))?|মনে করিয়ে|করিয়ে দিও|করতে হবে|তে হবে|করা দরকার|করবো|করব|করতে চাই|करना है|करना होगा|याद दिलाना/i;
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
function taskInfo(t){
 const now=new Date(),d=new Date(now),s=t.toLowerCase();let dueDate="";
 const fmt=x=>[x.getFullYear(),String(x.getMonth()+1).padStart(2,"0"),String(x.getDate()).padStart(2,"0")].join("-");
 if(/আজ|আজকে|today/.test(s))dueDate=fmt(d);
 else if(/আগামীকাল|কালকে|tomorrow/.test(s)){d.setDate(d.getDate()+1);dueDate=fmt(d)}
 else if(/পরশু|day after tomorrow/.test(s)){d.setDate(d.getDate()+2);dueDate=fmt(d)}
 const dm=t.match(/(?:^|\s)(\d{1,2})(?:st|nd|rd|th)?\s*(?:তারিখ|date)(?:\s|$)/i);
 if(dm){const x=new Date(now);x.setDate(+dm[1]);if(x<now)x.setMonth(x.getMonth()+1);dueDate=fmt(x)}
 let dueTime="";
 const bnWords={"এক":1,"দুই":2,"তিন":3,"চার":4,"পাঁচ":5,"ছয়":6,"ছয়":6,"সাত":7,"আট":8,"নয়":9,"নয়":9,"দশ":10,"এগারো":11,"বারো":12};
 const wm=t.match(/(এক|দুই|তিন|চার|পাঁচ|ছয়|ছয়|সাত|আট|নয়|নয়|দশ|এগারো|বারো)টার?/);
 if(wm){let h=bnWords[wm[1]];if(/বিকেল|সন্ধ্যা|সন্ধ্যে|রাত/.test(t)&&h<12)h+=12;dueTime=String(h).padStart(2,"0")+":00"}
 if(!dueTime){const tm=t.match(/(?:at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|টা|টায়|টায়)/i);if(tm){let h=+tm[1],m=+(tm[2]||0),p=(tm[3]||"").toLowerCase();if((p==="pm"||(/বিকেল|সন্ধ্যা|সন্ধ্যে|রাত/.test(t)&&h<12))&&h<12)h+=12;if(p==="am"&&h===12)h=0;dueTime=String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")}}
 return{dueDate,dueTime,taskAction:t};
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
 const fi=category==="Finance"?financeInfo(t):{};const ti=category==="Tasks"?taskInfo(t):{};
 return{original:t,language,category,amount,...fi,...ti,kmFrom:km?.[1]?.replace(/\s/g,"")||"",kmTo:km?.[2]?.replace(/\s/g,"")||"",workType,status:"New"};
}