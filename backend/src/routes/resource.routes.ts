import { Router } from 'express';
import * as resourceController from '../controllers/resource.controller';

const router = Router();

/**
 * @route   POST /api/resources
 * @desc    Create a new resource
 * @access  Private (Add authentication middleware if needed)
 */
router.post('/', resourceController.createResource);

/**
 * @route   GET /api/resources
 * @desc    Get all resources with optional filtering
 * @query   state (optional) - Filter by state
 * @query   district (optional) - Filter by district
 * @access  Public
 */
router.get('/', resourceController.getResources);

/**
 * @route   GET /api/resources/stats
 * @desc    Get statistics aggregated by state/district/village
 * @query   state (optional) - Filter by state
 * @query   district (optional) - Filter by district
 * @access  Public
 */
router.get('/stats', resourceController.getStatistics);

/**
 * @route   GET /api/resources/:id
 * @desc    Get a single resource by ID
 * @access  Public
 */
router.get('/:id', resourceController.getResourceById);

/**
 * @route   PATCH /api/resources/:id
 * @desc    Update a resource
 * @access  Private (Add authentication middleware if needed)
 */
router.patch('/:id', resourceController.updateResource);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource
 * @access  Private (Add authentication middleware if needed)
 */
router.delete('/:id', resourceController.deleteResource);

export default router;
