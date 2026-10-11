const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:username/toggle-lock', userController.toggleLockUser);
router.delete('/:username', userController.deleteUser);

module.exports = router;
