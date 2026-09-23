"use client";
import{useEffect,useRef,useState}from"react";import{classify}from"../lib/classify";

export default function Home(){
 const[text,setText]=useState("");const[preview,setPreview]=useState(null);const[msg,setMsg]=useState("");const[queue,setQueue]=useState([]);const[saving,setSaving]=useState(false);const[syncing,setSyncing]=useState(false);const[listening,setListening]=useState(false);const[lang,setLang]=useState("bn-IN");const rec=useRef(null);
 useEffect(()=>{setQueue(JSON.parse(localStorage.getItem("second-brain-queue")||"[]"))},[]);
 function store(item){const q=[item,...queue];setQueue(q);localStorage.setItem("second-brain-queue",JSON.stringify(q))}
 function analyse(v=text){if(!v.trim()){setMsg("আগে কিছু বলুন বা লিখুন।");return}setPreview(classify(v));setMsg("")}
 async function confirm(){if(!preview||saving)return;setSaving(true);const item={...preview,timestamp:new Date().toISOString()};try{const r=await fetch("/api/entries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});if(!r.ok)throw new Error();setMsg("Saved to Google Drive.");}catch{store({...item,syncStatus:"Pending cloud sync"});setMsg("Saved safely on this device. Google Drive sync is pending.");}finally{setSaving(false);setText("");setPreview(null)}}
 async function syncPending(){
  if(syncing||!queue.length)return;setSyncing(true);setMsg("Pending entries Google Drive-এ sync হচ্ছে…");
  const failed=[];let done=0;
  for(const item of queue){try{const r=await fetch("/api/entries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});if(!r.ok)throw new Error();done++}catch{failed.push(item)}}
  setQueue(failed);localStorage.setItem("second-brain-queue",JSON.stringify(failed));setSyncing(false);
  setMsg(failed.length?done+"টি sync হয়েছে; "+failed.length+"টি এখনও pending।":done+"টি pending entry সফলভাবে Google Drive-এ sync হয়েছে।");
 }
 function speak(){
  if(listening){rec.current?.stop();return}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setMsg("এই browser-এ voice recognition support নেই। Chrome দিয়ে খুলুন।");return}
  const r=new SR();rec.current=r;r.lang=lang;r.interimResults=true;r.continuous=false;r.maxAlternatives=1;
  let finalText="";
  r.onstart=()=>{setListening(true);setMsg("🎤 Listening… এখন বলুন।")};
  r.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const s=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=s;else interim+=s}setText((finalText||interim).trim())};
  r.onerror=e=>{setListening(false);setMsg(e.error==="not-allowed"?"Microphone permission দিন, তারপর আবার Speak চাপুন.":"Voice বুঝতে পারিনি। আবার চেষ্টা করুন।")};
  r.onend=()=>{setListening(false);setMsg(finalText.trim()?"আপনার কথাটি নিচে লেখা হয়েছে। ঠিক থাকলে Preview চাপুন।":"কোনো কথা ধরা পড়েনি। আবার Speak চাপুন।")};
  try{r.start()}catch{setListening(false);setMsg("Microphone শুরু করা যায়নি। আবার চেষ্টা করুন।")}
 }
 async function upload(e){const f=e.target.files?.[0];if(!f)return;if(!/\.(txt|csv|json)$/i.test(f.name)){setMsg("PDF, Word, Excel and image extraction is coming next.");return}const v=await f.text();setText(v.slice(0,10000));setPreview(null);setMsg("File text loaded. Check it, then press Preview.")}
 return <main className="wrap"><h1>🧠 The Second Brain</h1><p className="sub">Speak, type or upload → check your words → Preview → Save</p><section className="card"><label><b>Speaking language</b></label><select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:12,margin:"8px 0 4px",borderRadius:12,border:"1px solid #ddd",fontSize:16}}><option value="bn-IN">বাংলা (Bengali)</option><option value="en-IN">English (India)</option><option value="hi-IN">हिंदी (Hindi)</option></select><p className="small">Mixed Bengali-English হলে বাংলা নির্বাচন করে স্বাভাবিকভাবে বলুন।</p><div className="actions"><button onClick={speak}>{listening?"⏹ Stop":"🎤 Speak"}</button><button className="secondary" onClick={()=>document.querySelector("textarea")?.focus()}>✍️ Type</button><label className="upload">📎 Upload<input type="file" onChange={upload}/></label></div>{listening&&<p className="ok"><b>🎤 Listening…</b> এখন বলুন। কথা শেষ হলে Stop চাপতে পারেন।</p>}<textarea value={text} onChange={e=>{setText(e.target.value);setPreview(null)}} placeholder="আপনি যা বলবেন, প্রথমে এখানে হুবহু লেখা দেখাবে। ভুল থাকলে ঠিক করে তারপর Preview করুন।"/><button onClick={()=>analyse()} style={{width:"100%",marginTop:10}}>Preview & Organize</button>{msg&&!listening&&<p className="ok">{msg}</p>}</section>{preview&&<section className="card preview"><h2>Check before saving</h2><div><b>Original:</b> {preview.original}</div><div><b>Category:</b> {preview.category}</div><div><b>Language:</b> {preview.language}</div>{preview.amount&&<div><b>Amount:</b> ₹{preview.amount}</div>}{preview.kmFrom&&<div><b>KM:</b> {preview.kmFrom} → {preview.kmTo}</div>}<div><b>Status:</b> {preview.status}</div><p className="small">ভুল হলে উপরের লেখাটি edit করে আবার Preview করুন। Confirm না করা পর্যন্ত Google Drive-এ যাবে না।</p><button disabled={saving} onClick={confirm} style={{width:"100%"}}>{saving?"Saving…":"✓ Confirm & Save to Google Drive"}</button></section>}<section className="card"><b>Offline queue:</b> {queue.length} entr{queue.length===1?"y":"ies"}<p className="small">Google Drive unavailable হলে entry এই device-এ নিরাপদে থাকবে। Successful sync না হওয়া পর্যন্ত কোনো pending entry মুছবে না।</p>{queue.length>0&&<button disabled={syncing} onClick={syncPending} style={{width:"100%"}}>{syncing?"Syncing…":"↻ Sync Pending Entries"}</button>}</section></main>
}