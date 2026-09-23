const GOOGLE_SCRIPT_URL="https://script.google.com/macros/s/AKfycbzNZ-dqC4hIbvQQXZgNvPVd07hTgMqzqmgHXTe1fzllBMfaz6RbVeihl3Hgnq6Uw9yoAw/exec";
export async function GET(req){
 try{
  const url=new URL(req.url);const action=url.searchParams.get("action")||"list";
  const r=await fetch(GOOGLE_SCRIPT_URL+"?action="+encodeURIComponent(action),{cache:"no-store"});
  const text=await r.text();let d;try{d=JSON.parse(text)}catch{return Response.json({ok:false,error:"Google bridge returned invalid data"},{status:502})}
  if(!d.ok)return Response.json({ok:false,error:d.error||"Google Drive read failed"},{status:502});
  return Response.json(d);
 }catch{return Response.json({ok:false,error:"Google Drive data unavailable"},{status:502})}
}