//import {PrismaClient} from "../src/generated/prisma";
import {PrismaClient} from "@prisma/client";

import { Request, Response } from "express";

import bcrypt from "bcrypt";
const prisma = new PrismaClient();

export const createUser = async (req: Request ,res: Response) =>{
    try{
        const {username , email,password} = req.body;
		
        if (!username){
			return res.status(422).json({error: "username required"}); //422   -> error for invalid data
        }
		if(!email){
			return res.status(422).json({error: "Email required"});
		}
        if (!password){
			return res.status(422).json({error: "password required"}); //422   -> error for invalid data
        }
		const hash = await bcrypt.hash(password, 10);
		
        if (await prisma.my_users.findUnique({where : {email: req.body.email}}))
        {
            return res.status(409).json({error: `${req.body.email} already has a account with this same email!`});
        }
        const user  = await prisma.my_users.create({
        data: {name:username, email, password: hash},	
    });

    return res.status(201).json(user); // 201 created ;
}
    catch (error : any)
    {
        console.error(error);
        return res.status(500).json({error: error.message || "Internal server Error"}) // 500 -> internal service error
    }
}

export const getUser = async (req: Request ,res: Response)=>{
    try
    {
        const users = await prisma.my_users.findMany();
        return res.status(200).json(users);
    }
    catch (error: any)
    {
        console.error(error);
        return res.status(500).json({error: error.message || "Internal server Error"}) // 500 -> internal service error
    }
}

export const updateUser = async (req : Request, res: Response)=>{
    try {
            if (!await prisma.my_users.findUnique({where: {id : parseInt(req.body.id)}}))
                return res.status(404).json({error: `User Not Found!`}); 
            if (!req.body.username)
                return res.status(422).json({error: "username or password required"}); //422   -> error for invalid data
            if (await prisma.my_users.findUnique({where : {name: req.body.username}}))
                    return res.status(409).json({error: `${req.body.username} already exist!`});
            
            const updatedUser = await prisma.my_users.update({
                data: {
                    name: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                },
                where: {
                    id : parseInt(req.body.id) // req.params.id?
                }
            })
            return res.status(200).json(updatedUser);
        } catch (error) {
        return res.status(500).json({error: error.message});
    }
    
}
