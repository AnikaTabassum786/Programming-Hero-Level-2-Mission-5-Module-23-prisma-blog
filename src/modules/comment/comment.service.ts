

const createComment=async(payload:
    {
        content:string,
        authorId:string,
        postId:string,
        parentId?:string
    }

)=>{
    console.log("Create Comment Service!!",payload)
}

export const commentService = {
    createComment
}

