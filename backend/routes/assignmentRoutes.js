const express = require('express');
const assignmentController = require('../controllers/assignmentController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', assignmentController.listAssignments);
router.post('/', assignmentController.createAssignment);
router.patch('/:id/complete', assignmentController.markAssignmentComplete);
router.get('/:id', assignmentController.getAssignment);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
