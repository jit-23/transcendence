//import {PrismaClient} from "../src/generated/prisma";
import {PrismaClient} from "@prisma/client";
import 'dotenv/config';
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import speakeasy from "speakeasy";

import { Request, Response } from "express";

import jwt from 'jsonwebtoken';

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
		
		if (await prisma.my_users.findUnique({where : {name: req.body.username}}))
        {
            return res.status(409).json({error: `${req.body.username} already has a account with this same username!`});
        }

        if (await prisma.my_users.findUnique({where : {email: req.body.email}}))
        {
            return res.status(409).json({error: `${req.body.email} already has a account with this same email!`});
        }
    //     const user  = await prisma.my_users.create({
    //     data: {name:username, email, password: hash},
    // });
    //
    // return res.status(201).json(user); // 201 created ;
        const user = await prisma.my_users.create({
            data: { name: username, email, password: hash },
        });

// 🔐 Generate 2FA secret
        const secret = speakeasy.generateSecret({
            name: `ft_transcendence (${email})`,
        });

// Save secret immediately (testing mode)
        await prisma.my_users.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: true,
                twoFactorSecret: secret.base32,
            },
        });

// Generate QR
        const qr = await QRCode.toDataURL(secret.otpauth_url!);

        return res.status(201).json({
            message: "User created with 2FA enabled",
            qr, // 👈 frontend will display this
        });
    }
    catch (error : any)
    {
        console.error(error);
        return res.status(500).json({error: error.message || "Internal server Error"}) // 500 -> internal service error
    }
}

export const getMe = async (req: Request ,res: Response)=>{
	try
	{
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer "))
		{
			return res.status(401).json({error: "Token missing!"}); // 401 -> unauthorized
		}
		const token = authHeader.split(" ")[1];
		const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
		const userId = decoded.userId;
		if (!userId)
		{
			return res.status(401).json({error: "Invalid token!"}); // 401 -> unauthorized
		}
		const user = await prisma.my_users.findUnique({where: {id: userId}, select: {id: true, name: true, email: true}}); // Exclude password
		if (!user)
		{
			return res.status(404).json({error: "User not found!"}); // 404 -> not found
		}
		return res.status(200).json(user);
	}
	catch (error)
	{
		return res.status(401).json({error: "Invalid or expired token!"}); // 401 -> unauthorized
	}
}
		


export const login = async (req: Request ,res: Response) =>{
	try{
		const {email,password} = req.body;
		if(!email){
			return res.status(422).json({error: "Email required"});
		}
		if (!password){
			return res.status(422).json({error: "password required"}); //422   -> error for invalid data
		}
		const user = await prisma.my_users.findUnique({where : {email: req.body.email}});
		if (!user)
		{
			return res.status(404).json({error: `User Not Found!`}); 
		}
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid)
		{
			return res.status(401).json({error: "Invalid password!"}); // 401 -> unauthorized
		}
		const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
		
		return res.status(200).json({ 
            message: "Login successful",
            token, 
            user: {
                id: user.id,
                email: user.email,
                username: user.name
            }});

	}	catch (error : any)
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
//!
//export const chat_with_friends = async (req: Request ,res: Response)=>{
//    const socket = }
//!

//THIS NEEDS TO BE TRIPLE CHECKED !!!!!!!
//we will need to add middleware so the seed doesn't get stolen!

export const generate2FA = async (req: Request, res: Response) => {
    const secret = speakeasy.generateSecret({
        name: "ft_transcendence",
    });

    const qr = await QRCode.toDataURL(secret.otpauth_url!);

    return res.json({
        qr,
        secret: secret.base32,
    });
};

export const login2FA = async (req: Request, res: Response) => {
    const { code, userId } = req.body;

    const user = await prisma.my_users.findUnique({
        where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
        return res.status(400).json({ error: "2FA not setup" });
    }

    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: code,
        window: 1,
    });

    if (!verified) {
        return res.status(400).json({ error: "Invalid code" });
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
    );

    return res.json({ token });
};


export default {
    createUser,
    getMe,
    login,
    login2FA,   // 2FA
    getUser,
    updateUser
};