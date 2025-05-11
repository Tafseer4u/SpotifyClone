let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutes(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}`;
}

getsongs = async (folder) => {
  currfolder = folder;

  try {
    let response = await fetch("/songs.json");
    let songsData = await response.json();

    let folderData = songsData.folders.find((f) => f.path === folder);

    if (!folderData) {
      console.error("Folder not found in songs.json");
      return [];
    }

    songs = folderData.songs;

    let songsUL = document
      .querySelector(".songlist")
      .getElementsByTagName("ul")[0];
    songsUL.innerHTML = "";

    for (const song of songs) {
      songsUL.innerHTML =
        songsUL.innerHTML +
        `<li><img class="invert" src="/img/music.svg" alt="">
      <div class="songinfo">
      <div>${song.replace(/\.mp3$/, "").replaceAll("%20", " ")}</div>
      </div>
      <div class="playnow">
      <span>Play Now</span>
      <img class="invert" src="/img/play.svg" alt="">
      </div>
      </li>`;
    }

    Array.from(
      document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e, index) => {
      e.addEventListener("click", () => {
        playMusic(songs[index]);
      });
    });

    return songs;
  } catch (error) {
    console.error("Error loading songs:", error);
    return [];
  }
};

const playMusic = (track, pause = false) => {
  try {
    currentSong.src = `/${currfolder}/${encodeURIComponent(track)}`;
    if (!pause) {
      currentSong.play().catch((error) => {
        console.error("Error playing song:", error);
        alert("Unable to play song. Please check if the file exists.");
      });
      play.src = "/img/pause.svg";
    }
    document.querySelector(".songname").innerHTML = track.replace(/\.mp3$/, "");
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
  } catch (error) {
    console.error("Error setting up song:", error);
  }
};

const displayalbums = async () => {
  try {
    let response = await fetch("/songs.json");
    let songsData = await response.json();

    let cardContainer = document.querySelector(".card-container");
    cardContainer.innerHTML = "";

    for (const folder of songsData.folders) {
      let infoResponse = await fetch(`/${folder.path}/info.json`);
      let folderInfo = await infoResponse.json();

      cardContainer.innerHTML += `
        <div data-folder="${folder.path}" class="card">
          <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="55" color="#1abc54"
              fill="#1abc54">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
              <path
                d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                fill="black" />
            </svg>
          </div>
          <img src="/${folder.path}/cover.jpeg" alt="">
          <h2>${folderInfo.title}</h2>
          <p>${folderInfo.description}</p>
        </div>
      `;
    }

    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      e.addEventListener("click", async (item) => {
        await getsongs(item.currentTarget.dataset.folder);
        if (songs.length > 0) {
          playMusic(songs[0]);
        }
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
};

main = async () => {
  try {
    await getsongs("songs/trendingsong");
    if (songs.length > 0) {
      playMusic(songs[0], true);
    }

    await displayalbums();

    play.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play().catch((e) => console.error("Error playing:", e));
        play.src = "/img/pause.svg";
      } else {
        currentSong.pause();
        play.src = "/img/play.svg";
      }
    });

    currentSong.addEventListener("timeupdate", () => {
      document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
        currentSong.currentTime
      )} / ${secondsToMinutes(currentSong.duration)}`;
      document.querySelector(".circle").style.left =
        (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      document.querySelector(".circle").style.left = percent + "%";
      currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
      document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
      document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
      const currentSongName = currentSong.src.split("/").pop();
      let index = songs.indexOf(decodeURIComponent(currentSongName));
      if (index - 1 >= 0) {
        playMusic(songs[index - 1]);
      }
    });

    next.addEventListener("click", () => {
      const currentSongName = currentSong.src.split("/").pop();
      let index = songs.indexOf(decodeURIComponent(currentSongName));
      if (index + 1 < songs.length) {
        playMusic(songs[index + 1]);
      }
    });

    const volumeSlider = document.getElementById("volumeSlider");
    const volumeValue = document.getElementById("volumeValue");
    volumeSlider.addEventListener("input", () => {
      volumeValue.textContent = volumeSlider.value;
    });

    document
      .querySelector(".volume-container")
      .getElementsByTagName("input")[0]
      .addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
      });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
      if (e.target.src.includes("volume.svg")) {
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0;
        volumeSlider.value = 0;
        volumeValue.textContent = volumeSlider.value;
      } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currentSong.volume = 0.5;
        volumeSlider.value = 50;
        volumeValue.textContent = volumeSlider.value;
      }
    });
  } catch (error) {
    console.error("Error in main function:", error);
  }
};

main();
