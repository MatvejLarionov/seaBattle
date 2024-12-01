const { Router } = require("express");
const express = require('express')
const usersController = require("../controllers/usersController");

const router = Router()

router.use(express.json())
router.post('/registration', usersController.registration)
router.post('/authorization', usersController.authorization)
module.exports = router