const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },

  name: {
    type: String,
    required: [true, 'author is required...']
  },

  age: {
    type: Number,
    required: [true, 'age is required...']
  },

  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, 'email is required...']
  },

  password: {
    type: String,
    required: [true, 'password is required...']
  },

  books: [{
    type: Schema.Types.ObjectId,
    ref: 'Book'
  }],

  date: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('User', userSchema);