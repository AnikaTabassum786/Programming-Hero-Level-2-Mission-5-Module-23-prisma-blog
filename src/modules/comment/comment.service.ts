import { prisma } from "../../lib/prisma"


const createComment=async(payload:
    {
        content:string,
        authorId:string,
        postId:string,
        parentId?:string
    }

)=>{
    // console.log("Create Comment Service!!",payload)

    const postData = await prisma.post.findUniqueOrThrow({
        where:{
            id:payload.postId
        }
    })

    if(payload.parentId){
        const parentData = await prisma.comment.findUniqueOrThrow({
            where:{
                id:payload.parentId
            }
        })
    }

    const result = await prisma.comment.create({
        data:payload
    })

    return result
}

const getCommentById=async(commentId:string)=>{
    // console.log("Get comment by id",commentId)

    const result = await prisma.comment.findUnique({
        where:{
            id:commentId
        },
        // include:{
        //     post:true
        // }
        include:{
            post:{
              select:{
                id:true,
                title:true,
                tags:true,
                views:true

              }  
            }
        }
    })

    return result
}

export const commentService = {
    createComment,
    getCommentById
}

