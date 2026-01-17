import express,{NextFunction, Request, Response, Router} from 'express'
import { postController } from './post.controller';
import auth, { UserRole } from '../../middleware/auth';


const router = express.Router();

router.get('/',postController.getAllPost)
router.post("/", auth(UserRole.USER),postController.createPost)
router.get('/:postId',postController.getPostById)

export const postRouter:Router = router