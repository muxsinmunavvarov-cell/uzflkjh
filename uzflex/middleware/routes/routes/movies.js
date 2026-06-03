const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

// Barcha kinolar
router.get('/', async (req, res) => {
  try {
    const { genre, search, sort, page = 1, limit = 20 } = req.query;
    let query = {};
    if (genre && genre !== 'all') query.genre = genre;
    if (search) query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { titleRu: { $regex: search, $options: 'i' } },
      { titleEn: { $regex: search, $options: 'i' } }
    ];
    let sortOpt = { createdAt: -1 };
    if (sort === 'rating') sortOpt = { rating: -1 };
    if (sort === 'views')  sortOpt = { views: -1 };

    const movies = await Movie.find(query).sort(sortOpt)
      .skip((page - 1) * limit).limit(Number(limit)).select('-videoUrl');
    res.json({ success: true, movies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/trending', async (req, res) => {
  const movies = await Movie.find({ isTrending: true }).sort({ views: -1 }).limit(10).select('-videoUrl');
  res.json({ success: true, movies });
});

router.get('/new', async (req, res) => {
  const movies = await Movie.find({ isNew: true }).sort({ createdAt: -1 }).limit(10).select('-videoUrl');
  res.json({ success: true, movies });
});

router.get('/featured', async (req, res) => {
  const movie = await Movie.findOne({ isFeatured: true }).select('-videoUrl');
  res.json({ success: true, movie });
});

// Bitta kino (token kerak)
router.get('/:id', protect, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Kino topilmadi' });

    movie.views += 1;
    await movie.save();

    const data = movie.toObject();
    if (!req.user.hasActiveSubscription()) {
      delete data.videoUrl;
      data.requireSubscription = true;
    }
    res.json({ success: true, movie: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Kino qo'shish
router.post('/', protect, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;