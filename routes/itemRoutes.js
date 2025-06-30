const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const itemController = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Add new item (protected, with photo upload)
router.post(
  '/',
  protect,
  upload.array('photos', 5),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('city').notEmpty().withMessage('City is required'),
    body('college').notEmpty().withMessage('College is required')
  ],
  itemController.addItem
);

// Get/search items
router.get('/', itemController.getItems);

module.exports = router; 