// drive.js
const { google } = require("googleapis");
const stream = require("stream");

// ✅ Sử dụng biến môi trường thay vì hard-code secret
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://developers.google.com/oauthplayground"; 
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || "";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Gán refresh_token để tự động lấy access_token mới
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oauth2Client });

// ✅ Tạo folder con
async function createFolder(folderName, parentId) {
  const res = await drive.files.create({
    resource: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id, name",
  });
  return res.data.id;
}

// ✅ Upload file từ buffer (Multer memoryStorage)
async function uploadFileBuffer(buffer, fileName, folderId, mimeType) {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(buffer);

  const res = await drive.files.create({
    resource: { name: fileName, parents: [folderId] },
    media: { mimeType, body: bufferStream },
    fields: "id, name, webViewLink",
  });
  return res.data;
}

// ✅ Download file as buffer
async function downloadFile(fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(res.data);
}

// ✅ Liệt kê file trong folder
async function listFilesInFolder(folderId) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id, name, webViewLink, mimeType)",
  });
  return res.data.files || [];
}

// ✅ Xóa file
async function deleteFile(fileId) {
  return drive.files.delete({ fileId });
}

// ✅ Xóa folder (xóa toàn bộ file con rồi xóa folder)
async function deleteFolder(folderId) {
  try {
    const files = await listFilesInFolder(folderId);
    for (const f of files) {
      await deleteFile(f.id);
    }
    await drive.files.delete({ fileId: folderId });
  } catch (err) {
    console.error('Drive deleteFolder error:', err.message);
  }
}

module.exports = { drive, createFolder, uploadFileBuffer, downloadFile, listFilesInFolder, deleteFile, deleteFolder };
