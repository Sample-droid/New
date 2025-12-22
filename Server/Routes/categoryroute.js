const express = require('express');
const router = express.Router();
const Category = require('../Model/Category');

// -------------------- CREATE CATEGORY (ADMIN) --------------------
router.post('/admin/category', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name });
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

// -------------------- GET ALL CATEGORIES (ADMIN) --------------------
router.get('/admin/categories', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

// -------------------- ENABLE / DISABLE CATEGORY --------------------
router.patch('/admin/category/:id/disable', async (req, res, next) => {
  try {
    const { disable } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.isActive = !disable;
    await category.save();

    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

// -------------------- UPDATE CATEGORY NAME --------------------
router.put('/admin/category/:id', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    category.name = name;
    await category.save();

    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
});

// -------------------- PUBLIC: GET ACTIVE CATEGORIES --------------------
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).select('name');
    res.json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;