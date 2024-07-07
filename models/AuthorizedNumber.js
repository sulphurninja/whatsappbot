// models/AuthorizedNumber.js

import mongoose from 'mongoose';

const authorizedNumberSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  Name: {
    type: String,
    required: true,
  },
  Designation: {
    type: String,
    required: true,
  },
  PoliceStation: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  district: {
    type: String,
  },
});

export default mongoose.models.AuthorizedNumber || mongoose.model('AuthorizedNumber', authorizedNumberSchema);
