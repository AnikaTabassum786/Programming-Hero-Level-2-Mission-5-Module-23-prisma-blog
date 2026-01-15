import { Request, Response } from "express"
import { postService } from "./post.service"
import { PostStatus } from "../../../generated/prisma/enums";




const createPost = async (req:Request, res:Response) =>{
  try{
    const user = req.user;

    if(!user){
         return res.status(400).json({
            error:"Unauthorized"
          })
    }

  

    // console.log(req.user)
    const result = await postService.createPost(req.body, user.id as string)
    res.status(201).json(result)
  }
  catch(error){
    res.status(400).json({
      error:"Post creation failed",
      details: error
    })
  }
}

const getAllPost= async(req:Request, res:Response)=>{
  try{
    const {search} =req.query
    const searchString = typeof search === 'string'?search:undefined

    const tags = req.query.tags ? (req.query.tags as string).split(","):[]

    const isFeatured = req.query.isFeatured 
    ? req.query.isFeatured ==='true' ? true 
    :req.query.isFeatured ==='false' ? false : undefined
    :undefined


    const status = req.query.status as PostStatus | undefined
    const authorId = req.query.authorId as PostStatus | undefined

    const page = Number(req.query.page ?? 1)
    const limit = Number(req.query.limit ??10)

    // console.log({isFeatured})
    const result = await postService.getAllPost({search:searchString,tags,isFeatured,status,authorId,page,limit})
    res.status(200).json(result)
  }
  catch(error){
    res.status(400).json({
      error:"Post creation failed",
      details: error
    })
  }
}

export const postController ={
    createPost,
    getAllPost
}