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

export const commentService = {
    createComment
}

