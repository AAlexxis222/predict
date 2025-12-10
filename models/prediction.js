"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PredictionSchema = new Schema({
  features: [Number],
  prediction: Number,
  timestamp: { type: Date, default: Date.now },
  latencyMs: Number,
  targetDate: Date,
  dailyValues: [Number],
  scalerVersion: { type: String, default: "v1" },

  kunnaMeta: {
    alias: String,
    name: String,
    daysUsed: [String],
  },
  fetchMeta: {
    timeStart: Date,
    timeEnd: Date,
    source: String,
  },

  meta: {
    featureCount: Number,
    dataId: String,
    source: String,
  },
});
module.exports = mongoose.model("Prediction", PredictionSchema);
