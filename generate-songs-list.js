const fs = require("fs")
const path = require("path")

const songsBaseDir = path.join(__dirname, "songs");

function getMP3Files(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  return files.filter((file) => file.endsWith(".mp3"));
}

function getSongFolders() {
  const folders = fs
    .readdirSync(songsBaseDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  return folders;
}

function generateSongsJson() {
  const songFolders = getSongFolders();

  const songsJson = {
    folders: [],
  };

  songFolders.forEach((folder) => {
    const folderPath = path.join(songsBaseDir, folder);
    const mp3Files = getMP3Files(folderPath);

    songsJson.folders.push({
      name: folder,
      path: `songs/${folder}`,
      songs: mp3Files,
    });
  });

  const outputPath = path.join(__dirname, "songs.json");

  fs.writeFileSync(outputPath, JSON.stringify(songsJson, null, 2));

  console.log(`songs.json generated successfully at ${outputPath}`);
}

generateSongsJson();
