const { Router } = require('express');
const AgencyRepository = require('../../helpers/repositories/AgencyRepository');
const AgencyController = require('../../modules/agency/AgencyController');
const AgencyService = require('../../modules/agency/AgencyService');

const router = new Router();
const agencyRepository = new AgencyRepository();
const agencyService = new AgencyService(agencyRepository);
const controller = new AgencyController(agencyService);
router.post('/agency', controller.create.bind(controller));

module.exports = router;
