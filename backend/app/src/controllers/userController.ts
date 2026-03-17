//import {PrismaClient} from "../src/generated/prisma";
import {PrismaClient} from "@prisma/client";

import { Request, Response } from "express";
const prisma = new PrismaClient();

export const createUser = async (req: Request ,res: Response) =>{
    try{
        const {name , password} = req.body;
        console.log("name:", name);
        console.log("pass:", password);
        if (!name){

            return res.status(422).json({error: "Name required"}); //422   -> error for invalid data
        }
        if (!password){
            return res.status(422).json({error: "password required"}); //422   -> error for invalid data
        }

        if (await prisma.my_users.findUnique({where : {name: req.body.name}}))
        {
            return res.status(409).json({error: `${req.body.name} already exist!`});
        }

        const user  = await prisma.my_users.create({
        data: {name, password},
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
            if (!req.body.name)
                return res.status(422).json({error: "Name or password required"}); //422   -> error for invalid data
            if (await prisma.my_users.findUnique({where : {name: req.body.name}}))
                    return res.status(409).json({error: `${req.body.name} already exist!`});
            
            const updatedUser = await prisma.my_users.update({
                data: {
                    name: req.body.name
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
