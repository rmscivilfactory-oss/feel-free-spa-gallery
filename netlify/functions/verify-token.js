const crypto = require("crypto");

function getSecret() {
  return process.env.LINK_SECRET || "change-this-secret-in-netlify";
}

function decodeBase64url(value) {
  const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
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

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

exports.handler = async function (event) {
  const token = String((event.queryStringParameters || {}).t || "");
  const parts = token.split(".");

  if (parts.length !== 2) {
    return { statusCode: 401, body: JSON.stringify({ valid: false, error: "Invalid link" }) };
  }

  const payload = parts[0];
  const signature = parts[1];

  if (!safeEqual(signature, sign(payload))) {
    return { statusCode: 401, body: JSON.stringify({ valid: false, error: "Invalid link" }) };
  }

  let data;
  try {
    data = JSON.parse(decodeBase64url(payload));
  } catch (error) {
    return { statusCode: 401, body: JSON.stringify({ valid: false, error: "Invalid link" }) };
  }

  if (!data.exp || Date.now() > Number(data.exp)) {
    return { statusCode: 410, body: JSON.stringify({ valid: false, error: "This gallery link expired" }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      valid: true,
      name: data.name || "Customer",
      phone: data.phone,
      exp: data.exp,
      serverTime: Date.now()
    })
  };
};
