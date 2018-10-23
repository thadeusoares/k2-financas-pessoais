/*
*	Page: /user/*
*/

let express = require("express"),
	router = express.Router(),
	user_controller = require('../controllers/user');

/// user ROUTES ///

// GET request for creating User. NOTE This must come before route for id (i.e. display user).
router.get('/create', user_controller.user_create_get);

// POST request for creating User.
router.post('/create', user_controller.user_create_post);

// GET request to delete User.
router.get('/:id/delete', user_controller.user_delete_get);

// POST request to delete User.
router.post('/:id/delete', user_controller.user_delete_post);

// GET request to update User.
router.get('/:id/update', user_controller.user_update_get);

// POST request to update User.
router.post('/:id/update', user_controller.user_update_post);

// GET request for one User.
router.get('/:id', user_controller.user_detail);

// GET request for list of all users.
router.get('/list', user_controller.user_list);

module.exports = router