import { Context,Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { privyServer } from "../lib/privyServer";
import {  PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function authMiddleware(c:Context,next:Next){
    const authHeader=c.req.header('authorization')
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new HTTPException(401,{message:'Unauthorized Access'})

    }
    const token=authHeader.split(' ')[1]
    try{
        const verified=await privyServer.verifyAuthToken(token)
        const user=await prisma.user.findUnique({
            where:{
                privyUserId:verified.userId
            }
        })
        if(!user){
            throw new HTTPException(404,{
                message:'User not found'
            })
        }
        c.set('user',user)
        await next()
    }catch(error){
        throw new HTTPException(401,{
            message:"Invalid or expired token"
        })
    }
}


