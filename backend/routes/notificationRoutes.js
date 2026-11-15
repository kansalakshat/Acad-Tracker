const express = require('express');
const notificationController = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);
router.get('/vapid-public-key', notificationController.getVapidPublicKey);
router.post('/push-subscription', notificationController.savePushSubscription);
router.delete('/push-subscription', notificationController.deletePushSubscription);

module.exports = router;
