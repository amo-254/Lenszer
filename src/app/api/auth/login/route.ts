import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
export async function POST(req:Request){try{const {username,password}=await req.json();if(!username||!password)return NextResponse.json({error:"Enter username and password"},{status:400});const user=await authenticate(username,password);if(!user)return NextResponse.json({error:"Invalid username or password"},{status:401});await createSession(user);return NextResponse.json({ok:true,role:user.role});}catch{return NextResponse.json({error:"Unable to sign in"},{status:500});}}
