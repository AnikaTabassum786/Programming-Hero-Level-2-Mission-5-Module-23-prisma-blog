import express,{Router} from 'express'
import { commentController } from './comment.controller';
import auth, { UserRole } from '../../middleware/auth';

const router = express.Router();
router.post('/',auth(UserRole.ADMIN,UserRole.USER),commentController.createComment)


export const commentRouter:Router = router