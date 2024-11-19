let currentSong = new Audio();
let songs;
let currfolder;

function secondsToMinutes(seconds) {
  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Pad minutes and seconds to ensure two digits
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the formatted time as MM:SS
  return `${paddedMinutes}:${paddedSeconds}`;
}

getsongs = async (folder) => {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  //showing all the songs in songlists
  let songsUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songsUL.innerHTML = "";
  for (const song of songs) {
    songsUL.innerHTML =
      songsUL.innerHTML +
      `<li><img class="invert" src="/img/music.svg" alt="">
    <div class="songinfo">
    <div>${song.replaceAll("%20", " ")}</div>
    </div>
    <div class="playnow">
    <span>Play Now</span>
    <img class="invert" src="/img/play.svg" alt="">
    </div>
    </li>`;
  }
  // Attaching eventListener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".songinfo").firstElementChild.innerHTML);
    });
  });
  return songs;
};

//Music player
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + decodeURI(track);
  if (!pause) {
    currentSong.play(9);
    play.src = "/img/pause.svg";
  }
  document.querySelector(".songname").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

//displaying all song albums in spotify playlist
const displayalbums = async () => {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  let cardContainer = document.querySelector(".card-container");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("songs/").slice(1)[0];
      //getting metadata of folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder=${folder} class="card">
            <div class="play">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="55" color="#1abc54"
                fill="#1abc54">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                <path
                  d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                  fill="black" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
          </div>`;
    }
  }
  // //loading songs from folder
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
};

main = async () => {
  //Getting songs here
  await getsongs("songs/trendingsong");
  playMusic(songs[0], true);

  // getting all albums here
  displayalbums();

  //Attaching eventlistener to play/pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/img/play.svg";
    }
  });

  // for timeupdate of songs
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )} / ${secondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Updating seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //add eventlistener to hamburger
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = 0;
  });

  //adding eventlistener for clsoing hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //adding eventlistener to Previous
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log("previous clicked ", index);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //adding eventlistener to Next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    console.log("next clicked ", index);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Update the volume value when the slider changes
  const volumeSlider = document.getElementById("volumeSlider");
  const volumeValue = document.getElementById("volumeValue");
  volumeSlider.addEventListener("input", () => {
    volumeValue.textContent = volumeSlider.value;
  });
  //updating the song volume
  document
    .querySelector(".volume-container")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
  //adding eventlistener to mute the track
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
};
main();
