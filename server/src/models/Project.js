const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  startDate: { type: Date },
  endDate: { type: Date },
  // Use enum tokens compatible with GraphQL enum names
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'PENDING'], default: 'PENDING' },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
