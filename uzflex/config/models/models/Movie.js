const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  titleRu:     { type: String },
  titleEn:     { type: String },
  description: { type: String },
  year:        { type: Number },
  rating:      { type: Number, default: 0 },
  duration:    { type: Number },
  genre:       [{ type: String }],
  poster:      { type: String },
  backdrop:    { type: String },
  videoUrl:    { type: String },
  isNew:       { type: Boolean, default: false },
  isFeatured:  { type: Boolean, default: false },
  isTrending:  { type: Boolean, default: false },
  views:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);