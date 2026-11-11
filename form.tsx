 "use client";
import {useState} from "react";
export default function LoginForm(){const [username,setU]=useState("");const [password,setP]=useState("");const [error,setE]=useState("");
async function submit(e:React.FormEvent){e.preventDefault();setE("");const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});const j=await r.json();if(r.ok)location.href="/dashboard";else setE(j.error||"Login failed");}
return <form onSubmit={submit}><label className="field">Username<input autoComplete="username" value={username} onChange={e=>setU(e.target.value)} required/></label><label className="field">Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setP(e.target.value)} required/></label>{error&&<p style={{color:"#b42318"}}>{error}</p>}<button className="btn" style={{width:"100%",marginTop:12}}>Sign in</button></form>}
