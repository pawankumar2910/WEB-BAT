import { readFileSync } from "node:fs";

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) throw new Error("GEMINI_API_KEY not set (run node with --env-file=.env)");

function mimeFor(path) {
  const p = path.toLowerCase();
  if (p.endsWith(".png")) return "image/png";
  if (p.endsWith(".jpg") || p.endsWith(".jpeg")) return "image/jpeg";
  if (p.endsWith(".webp")) return "image/webp";
  throw new Error("Unknown image type: " + path);
}

export async function generateImage({
  prompt,
  inputImagePaths = [],
  model = "gemini-3-pro-image",
  aspectRatio,
}) {
  const parts = [{ text: prompt }];
  for (const p of inputImagePaths) {
    parts.push({
      inlineData: { mimeType: mimeFor(p), data: readFileSync(p).toString("base64") },
    });
  }

  const body = { contents: [{ role: "user", parts }] };
  if (aspectRatio) body.generationConfig = { imageConfig: { aspectRatio } };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${model} HTTP ${res.status}: ${JSON.stringify(data).slice(0, 2000)}`);
  }

  const cand = data.candidates?.[0];
  if (cand?.finishReason && cand.finishReason !== "STOP") {
    console.warn("finishReason:", cand.finishReason, cand.finishMessage || "");
  }

  const imgPart = cand?.content?.parts?.find((p) => p.inlineData?.data);
  if (!imgPart) {
    throw new Error("No image returned. Response: " + JSON.stringify(data).slice(0, 3000));
  }

  return {
    buffer: Buffer.from(imgPart.inlineData.data, "base64"),
    mimeType: imgPart.inlineData.mimeType,
    textNotes: (cand.content.parts || []).filter((p) => p.text).map((p) => p.text),
  };
}
