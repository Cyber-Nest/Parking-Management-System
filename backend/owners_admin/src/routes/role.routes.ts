import { Router } from 'express';
import { listRoles, createRole, updateRole, deleteRole } from '../controllers/role.controller';

const router = Router();

router.get('/', listRoles);
router.post('/', createRole);
router.patch('/:id', updateRole);
router.delete('/:id', deleteRole);

export default router;