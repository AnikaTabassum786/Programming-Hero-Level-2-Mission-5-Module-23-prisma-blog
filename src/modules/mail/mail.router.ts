import express,{NextFunction, Request, Response, Router} from 'express'

import auth, { UserRole } from '../../middleware/auth';
import { mailController } from './mail.controller';


const router = express.Router();

router.post(
  "/send",
  auth(UserRole.ADMIN), 
  mailController.createMail
);


export const mailRouter:Router = router