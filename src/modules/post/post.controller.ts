import { Request, Response } from "express"


const createPost = async (req:Request, res:Response) =>{
  console.log("Request ",req)
}

export const postController ={
    createPost
}