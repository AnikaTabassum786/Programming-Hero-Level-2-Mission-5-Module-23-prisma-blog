import { Request, Response } from "express"
import { postService } from "./post.service"
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/Pagination&SortingHelpers";
import { prisma } from "../../lib/prisma";
import { UserRole } from "../../middleware/auth";




const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        error: "Unauthorized"
      })
    }



    // console.log(req.user)
    const result = await postService.createPost(req.body, user.id as string)
    res.status(201).json(result)
  }
  catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error
    })
  }
}

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query
    const searchString = typeof search === 'string' ? search : undefined

    const tags = req.query.tags ? (req.query.tags as string).split(",") : []

    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === 'true' ? true
        : req.query.isFeatured === 'false' ? false : undefined
      : undefined


    const status = req.query.status as PostStatus | undefined
    const authorId = req.query.authorId as PostStatus | undefined

    // const page = Number(req.query.page ?? 1)
    // const limit = Number(req.query.limit ?? 10)

    // const skip = (page - 1) * limit

    // const sortBy = req.query.sortBy as string;
    // const sortOrder = req.query.sortOrder as string;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query)
    // console.log("Options:",options)

    // console.log({isFeatured})
    const result = await postService.getAllPost({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder })
    res.status(200).json(result)
  }
  catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error
    })
  }
}

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params
    if (!postId) {
      throw new Error("Post ID is required")
    }
    const result = await postService.getPostById(postId)
    res.status(201).json(result)
  }
  catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error
    })
  }
}

const getMyPost = async (req: Request, res: Response) => {
  try {
    const user = req.user
    console.log(user)
    const result = await postService.getMyPost(user?.id as string)
    res.status(201).json(result)
  }
  catch (error) {
    res.status(400).json({
      error: "Post fetched failed",
      details: error
    })
  }
}

const updatePost = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { postId } = req.params

    if (!user) {
      throw new Error("You are unauthorized")
    }

    const isAdmin = user.role === UserRole.ADMIN

    console.log(user)
    const result = await postService.updatePost(postId as string, req.body, user.id, isAdmin)
    res.status(201).json(result)
  }
  catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Post Updated failed"
    res.status(400).json({
      error: errorMessage,
      details: error
    })
  }
}

const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user
    const { postId } = req.params

    if (!user) {
      throw new Error("You are unauthorized")
    }

    const isAdmin = user.role === UserRole.ADMIN
    const result = await postService.deletePost(postId as string, user.id, isAdmin)
    res.status(201).json(result)
  }
  catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Post Updated failed"
    res.status(400).json({
      error: errorMessage,
      details: error
    })
  }
}

const getStat=async(req: Request, res: Response)=>{
  try{
    const result = await postService.getStat()
    res.status(201).json(result)
  }
  catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : "Post Fetch failed"
    res.status(400).json({
      error: errorMessage,
      details: error
    })
  }
}

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPost,
  updatePost,
  deletePost,
  getStat
}