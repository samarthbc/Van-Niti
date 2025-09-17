import { Router } from 'express';
import * as pattaController from '../controllers/patta.controller';
import { getPattasByStateWithRecommendations } from '../controllers/patta.controller';

const router = Router();

/**
 * @route   GET /api/pattas/state/:state
 * @desc    Get all pattas for a specific state
 * @access  Public
 */
router.get('/state/:state', pattaController.getPattasByState);

/**
 * @route   GET /api/pattas
 * @desc    Get all pattas with optional filtering
 * @access  Public
 */
router.get('/', pattaController.getPattas);

/**
 * @route   GET /api/pattas/state/:state/recommendations
 * @desc    Get all pattas for a specific state with scheme recommendations
 * @access  Public
 * @query   includeRecommendations - Set to 'false' to disable recommendations (default: 'true')
 */
router.get('/state/:state/recommendations', pattaController.getPattasByStateWithRecommendations);

/**
 * @route   GET /api/pattas/location
 * @desc    Search pattas by location
 * @access  Public
 */
router.get('/location', pattaController.searchPattasByLocation);

/**
 * @route   POST /api/pattas
 * @desc    Create a new patta
 * @access  Private (Add authentication middleware)
 */
router.post('/', pattaController.createPatta);

/**
 * @route   GET /api/pattas/:id
 * @desc    Get a single patta by ID
 * @access  Public
 */
router.get('/:id', pattaController.getPattaById);

/**
 * @route   PUT /api/pattas/:id
 * @desc    Update a patta
 * @access  Private (Add authentication middleware)
 */
router.put('/:id', pattaController.updatePatta);

/**
 * @route   DELETE /api/pattas/:id
 * @desc    Delete a patta
 * @access  Private (Add authentication middleware)
 */
router.delete('/:id', pattaController.deletePatta);

export default router;
