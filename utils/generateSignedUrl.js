const cloudinary = require("../config/cloudinary");

module.exports = function generateSignedUrl(publicId, title) {
  // URL valid for 60 seconds
  const expires_at = Math.floor(Date.now() / 1000) + 60;

  return cloudinary.utils.private_download_url(
    publicId,
    "pdf", // file format
    {
      resource_type: "raw",
      type: "private",
      expires_at,
      attachment: `${title}.pdf`,
      response_type: "attachment",
    }
  );
};
