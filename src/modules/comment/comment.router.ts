import express,{Router} from 'express'
import { commentController } from './comment.controller';
import auth, { UserRole } from '../../middleware/auth';

const router = express.Router();


router.post('/',auth(UserRole.ADMIN,UserRole.USER),commentController.createComment)
router.get('/:commentId',commentController.getCommentById)
router.get('/author/:authorId',commentController.getCommentByAuthorId)
router.delete('/:commentId',auth(UserRole.ADMIN,UserRole.USER),commentController.deleteComment)
router.patch('/:commentId',auth(UserRole.ADMIN,UserRole.USER),commentController.updateComment)


export const commentRouter:Router = router