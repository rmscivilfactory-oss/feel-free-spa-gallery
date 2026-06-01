const crypto = require("crypto");

const LINK_TTL_MS = 3 * 60 * 1000;

function getSecret() {
  return process.env.LINK_SECRET || "change-this-secret-in-netlify";
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(payload) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request" }) };
  }

  const adminPin = process.env.ADMIN_PIN || "1234";
  const submittedPin = String(body.pin || "").trim();
  const name = String(body.name || "Customer").replace(/[<>]/g, "").trim();
  const phone = String(body.phone || "").replace(/[^\d+]/g, "").trim();

  if (submittedPin !== adminPin) {
    return { statusCode: 401, body: JSON.stringify({ error: "Wrong admin PIN" }) };
  }

  if (phone.length < 10) {
    return { statusCode: 400, body: JSON.stringify({ error: "Enter valid customer phone" }) };
  }

  const payload = base64url(JSON.stringify({
    name: name || "Customer",
    phone,
    exp: Date.now() + LINK_TTL_MS
  }));

  const token = payload + "." + sign(payload);
  const origin = event.headers.origin || "https://" + event.headers.host;
  const url = origin + "/gallery?t=" + encodeURIComponent(token);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, expiresInSeconds: LINK_TTL_MS / 1000 })
  };
};
