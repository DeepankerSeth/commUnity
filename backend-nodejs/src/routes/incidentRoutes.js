const express = require('express');
const multer = require('multer');
const { createIncident } = require('../controllers/incidentController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/incidents', upload.single('file'), createIncident);

module.exports = router;
