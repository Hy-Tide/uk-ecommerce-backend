const express = require('express');
const router = express.Router();
const cuisineController = require('../../controllers/admin/cuisine.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Cuisines
 *   description: Cuisine management for admins
 */

router.use(authMiddleware.protectAdmin);

router.route('/')
    .get(cuisineController.getAllCuisines)
    .post(cuisineController.createCuisine);

router.route('/:id')
    .get(cuisineController.getCuisineById)
    .put(cuisineController.updateCuisine)
    .delete(cuisineController.deleteCuisine);

module.exports = router;
