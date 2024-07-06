// models/AuthorizedNumber.js

import mongoose from 'mongoose';

const authorizedNumberSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true }
});

export default mongoose.models.AuthorizedNumber || mongoose.model('AuthorizedNumber', authorizedNumberSchema);
