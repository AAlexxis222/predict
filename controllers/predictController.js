// controllers/predictController.js
const { getModelInfo, predict } = require("../services/tfModelService");

const Prediccion = require("../models/prediction");

function health(req, res) {
  res.json({
    status: "ok",
    service: "predict",
  });
}

function ready(req, res) {
  const info = getModelInfo();

  if (!info.ready) {
    return res.status(503).json({
      ready: false,
      modelVersion: info.modelVersion,
      message: "Model is still loading",
    });
  }

  res.json({
    ready: true,
    modelVersion: info.modelVersion,
  });
}

async function doPredict(req, res) {
  const start = Date.now();

  try {
    const info = getModelInfo();
    if (!info.ready) {
      return res.status(503).json({
        error: "Model not ready",
        ready: false,
      });
    }

    const { features, meta, targetDate, dailyValues, kunnaMeta, fetchMeta } =
      req.body;

    if (!features) {
      return res.status(400).json({ error: "Missing features" });
    }
    if (!meta || typeof meta !== "object") {
      return res.status(400).json({ error: "Missing meta object" });
    }

    const { featureCount } = meta;

    if (featureCount !== info.inputDim) {
      return res.status(400).json({
        error: `featureCount must be ${info.inputDim}, received ${featureCount}`,
      });
    }

    if (!Array.isArray(features) || features.length !== info.inputDim) {
      return res.status(400).json({
        error: `features must be an array of ${info.inputDim} numbers`,
      });
    }

    const prediction = await predict(features);
    const latencyMs = Date.now() - start;
    const timestamp = new Date().toISOString();

    const documento_prediccion = await Prediccion.create({
      features,
      prediction,
      timestamp,
      latencyMs,
      meta,
      targetDate,
      dailyValues,
      kunnaMeta,
      fetchMeta,
    });

    // De momento sin MongoDB → predictionId null
    res.status(201).json({
      predictionId: documento_prediccion._id,
      prediction: prediction,
      create_dt: timestamp,
      features: features,
      dataId: meta.dataId,
      latencia: latencyMs,
    });
  } catch (err) {
    console.error("Error en /predict:", err);
    res.status(500).json({ error: "Internal error" });
  }
}

module.exports = {
  health,
  ready,
  doPredict,
};
