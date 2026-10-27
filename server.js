// Serveur du cours : le contenu payant (paid.json) n'est JAMAIS dans la page.
// Il n'est envoyé qu'avec un code valide, lié à 2 appareils maximum.
const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const PORT=process.env.PORT||3000,ADMIN=process.env.ADMIN_KEY,SECRET=process.env.SECRET,MAXDEV=+(process.env.MAX_DEVICES||2);
if(!ADMIN||!SECRET){console.error("Définissez ADMIN_KEY et SECRET (longues phrases aléatoires).");process.exit(1)}
const DB=process.env.DB_FILE||path.join(__dirname,"codes.json"),PAID=fs.readFileSync(path.join(__dirname,"paid.json"),"utf8"),INDEX=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
const load=()=>{try{return JSON.parse(fs.readFileSync(DB,"utf8"))}catch(e){return{}}},save=d=>fs.writeFileSync(DB,JSON.stringify(d,null,1));
const sign=s=>crypto.createHmac("sha256",SECRET).update(s).digest("hex").slice(0,32);
const same=(a,b)=>a.length===b.length&&crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));
const body=r=>new Promise(ok=>{let b="";r.on("data",c=>{b+=c;if(b.length>1e4)r.destroy()});r.on("end",()=>{try{ok(JSON.parse(b))}catch(e){ok({})}})});
const send=(res,c,o,t="application/json; charset=utf-8")=>{res.writeHead(c,{"Content-Type":t,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"});res.end(typeof o==="string"?o:JSON.stringify(o))};
const hits={},limited=ip=>{const n=Date.now(),a=(hits[ip]||[]).filter(t=>n-t<6e4);a.push(n);hits[ip]=a;return a.length>30};
http.createServer(async(req,res)=>{
 const u=new URL(req.url,"http://x"),ip=req.headers["x-forwarded-for"]||req.socket.remoteAddress;
 if(limited(ip))return send(res,429,{error:"rate"});
 if(req.method==="GET"&&u.pathname==="/")return send(res,200,INDEX,"text/html; charset=utf-8");
 if(req.method==="POST"&&u.pathname==="/api/redeem"){
  const{code,device}=await body(req),k=String(code||"").trim().toUpperCase(),dv=String(device||"").slice(0,40),d=load(),c=d[k];
  if(!c||c.revoked||!/^[\w-]{4,40}$/.test(dv))return send(res,403,{error:"invalid"});
  c.devices=c.devices||[];
  if(!c.devices.includes(dv)){if(c.devices.length>=MAXDEV)return send(res,403,{error:"limit"});c.devices.push(dv)}
  save(d);return send(res,200,{token:k+"."+dv+"."+sign(k+dv),id:k})}
 if(req.method==="GET"&&u.pathname==="/api/content"){
  const[k,dv,sg]=(u.searchParams.get("t")||"").split("."),d=load(),c=d[k];
  if(!c||c.revoked||!sg||!same(sg,sign(k+dv))||!(c.devices||[]).includes(dv))return send(res,403,{error:"denied"});
  return send(res,200,PAID)}
 if(u.pathname.startsWith("/admin/")){
  if(!same(String(u.searchParams.get("key")||""),ADMIN))return send(res,403,{error:"denied"});
  const d=load();
  if(u.pathname==="/admin/newcode"){const k="IA-"+crypto.randomBytes(4).toString("hex").toUpperCase();d[k]={created:new Date().toISOString(),note:u.searchParams.get("note")||"",devices:[]};save(d);return send(res,200,{code:k})}
  if(u.pathname==="/admin/revoke"){const k=String(u.searchParams.get("code")||"").toUpperCase();if(d[k]){d[k].revoked=true;save(d);return send(res,200,{revoked:k})}return send(res,404,{error:"unknown"})}
  if(u.pathname==="/admin/list")return send(res,200,d)}
 send(res,404,{error:"not found"})
}).listen(PORT,()=>console.log("Cours en ligne sur le port "+PORT));
