var ajax_url = window.location.origin + "/ajax/";
let playing = false;
let playerexpand = false;
var audio;
let naatpath;
let currentTitle;
var loadingDiv = document.getElementById("loading-div");
let sidebar = false;
let currentAngle = 0;
let currentid 

let next_click = false;


function PlayNaat(src, title,id) {
  
  naatpath = src;
  currentTitle = title;
  document.getElementById("loader-div").style.display = "flex";
  document.getElementById("play-btn").style.display = "none";
  document.getElementById("disk").classList.add("paused");
  document.getElementById("tone-arm").style.transform = "rotate(-28deg)";
  try {
    audio.pause();
  } catch {}
  console.log("clicked");
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "get_source",
      naat_url: src,
    },
    success: function (response) {
      currentid = id
      console.log("clicked worked");
      console.log(response["src"]);
      if (response["src"] != "None") {
        audio = new Audio(response["src"]);
        document.getElementById("download-btn-link").href =
          response["download_link"];
        audio.play();
        audio.preload = "metadata";
        let angleGap;
        audio.onloadeddata = function () {
          TriggerAnimation("Playing");
          document.getElementById("disk").classList.remove("paused");
          document.getElementById("tone-arm").style.transform = "rotate(3deg)";
          document.getElementById("track-title").innerHTML = title;
          document.getElementsByClassName('player-head')[0].firstElementChild.innerHTML = title;
          if(String(title).toLowerCase().includes('lyrics')){
            console.log(true)
            document.getElementById('lyrics-btn').style.display = 'flex';
          }else{document.getElementById('lyrics-btn').style.display = 'none'; console.log(false)}

          playing = true;
          document.getElementById(
            "play-btn"
          ).style.backgroundImage = `url('${static_url}Images/pause.png')`;
          document.getElementById("loader-div").style.display = "none";
          document.getElementById("play-btn").style.display = "flex";
          document.getElementById("duration").innerHTML =
            Math.floor(audio.duration / 60) +
            ":" +
            Math.floor(audio.duration % 60);
          console.log(audio.duration % 60);
          document.getElementById("progressbar").max = audio.duration;
          // angleGap = 19 / Math.floor(audio.duration / 60)
          angleGap = 19 / audio.duration;
        };

        setInterval(function () {
          
          if (playing) {
            audio.volume = document.getElementsByClassName('volume_adjuster')[0].value / 100;
            if(audio.currentTime === audio.duration){
              if(audio.loop === false && next_click === false){
                console.log('called...')
                next_click = true;
                document.getElementById('nxt-btn').click();
              }
            }

            currentAngle = audio.currentTime * angleGap;
            document.getElementById(
              "tone-arm"
            ).style.transform = `rotate(-${currentAngle}deg)`;
          } else {
            document.getElementById(
              "tone-arm"
            ).style.transform = `rotate(-28deg)`;
          }
          document.getElementById("progressbar").value = audio.currentTime;
          document.getElementById("timeline").innerHTML =
            Math.floor(audio.currentTime / 60) +
            ":" +
            Math.floor(audio.currentTime % 60);
          // document.getElementById('tone-arm').style.transform = 'rotate(-28deg)';
        }, 1000);
      } else {
        TriggerAnimation("Error", "error");
      }
    },
  });
}

function PlayerToggle() {
  if (audio.onloadeddata) {
    if (playing == true) {
      playing = false;
      audio.pause();
      document.getElementById("disk").classList.add("paused");
      document.getElementById(
        "play-btn"
      ).style.backgroundImage = `url('${static_url}Images/play.png')`;
      console.log(static_url);
      document.getElementById("tone-arm").style.transform = `rotate(-28deg)`;
    } else {
      playing = true;
      document.getElementById("disk").classList.remove("paused");
      document.getElementById(
        "tone-arm"
      ).style.transform = `rotate(-${currentAngle}deg)`;
      document.getElementById(
        "play-btn"
      ).style.backgroundImage = `url('${static_url}Images/pause.png')`;
      audio.play();
    }
  }
  // let audio = document.getElementsByTagName('audio');
}


function TrackChanger(action){
  if (action==='previous'){
    try{
      document.getElementById(Number(currentid)-1).click();

    }catch{}
  }else{
    try{

      document.getElementById(Number(currentid)+1).click();
    }catch{}

  }
}

document.onkeydown = function(key){
  console.log(key.code)
  document.getElementsByTagName('body')[0].focus();
  if (key.code === 'Space'){
    PlayerToggle()
    }

  if (key.code === 'ArrowRight'){
    audio.currentTime = audio.currentTime + 10;
  }
  if (key.code === 'ArrowLeft'){
    audio.currentTime = audio.currentTime - 10;
  }
  if (key.code === 'Slash'){
    document.getElementsByName('query')[0].focus();
    setTimeout(() => {
      
      document.getElementsByName('query')[0].value = '';
    }, 50);
  }
  if (key.code === 'Enter'){
    let input = document.getElementsByName('query')[0]
    if (input === document.activeElement && input.value != ''){
      document.getElementById('search-btn').click()
    }
  } 
}





function TriggerAnimation(msg, type) {
  let elem = document.getElementById("msg-div");

  let label = document.getElementById("msg-div").firstElementChild;
  if (type === "error") {
    label.innerHTML = msg;
    // elem.style.animation = '';
    // elem.style.animation = 'JumpIn 2s ease-in ';
    elem.style.opacity = "100%";
    elem.style.background = "rgba(231, 78, 78, 0.807)";
  } else {
    label.innerHTML = msg;
    elem.style.animation = "JumpIn 2s ease-in ";
    elem.style.background = "rgba(106, 231, 78, 0.807)";
  }

  setTimeout(() => {
    elem.style.animation = null;
    elem.style.opacity = "0%";
  }, 2000);
}

function SetVolume(check){
  if (check){
    if (audio.volume === 0){
      document.getElementById('volume-btn').style.backgroundImage = `url(${static_url}Images/volume-up.png)`
      audio.volume = 1;
      document.getElementsByClassName('volume_adjuster')[0].value = 100;
    }else{
      document.getElementsByClassName('volume_adjuster')[0].value = 0;
      document.getElementById('volume-btn').style.backgroundImage = `url(${static_url}Images/volume-off.png)`
      audio.volume = 0;
    }
  }else{
    console.log(document.getElementsByClassName('volume_adjuster')[0].value)
    if(document.getElementsByClassName('volume_adjuster')[0].value == 0){
      console.log('worked')
      document.getElementById('volume-btn').style.backgroundImage = `url(${static_url}Images/volume-off.png)`
    }
    audio.volume = document.getElementsByClassName('volume_adjuster')[0].value / 100;
  }
}

function LoopToggle() {
  console.log("Timing function running");
  if (audio.loop == false) {
    audio.loop = true;
    document.getElementById("loop-btn").style.opacity = "100%";
  } else {
    audio.loop = false;
    document.getElementById("loop-btn").style.opacity = "70%";
  }
}

function ChangeTimeline() {
  let seconds = document.getElementById("progressbar").value;
  audio.currentTime = seconds;
}

// let controlBtns = document.getElementsByClassName('control-btns')
// console.log(controlBtns)

const ControlBtnToggle = () => {
  let controlBtns = array.from(document.getElementsByClassName("control-btns"));
  console.log(controlBtns.length);
  console.log(controlBtns.item);
  // let btns = Array.from(controlBtns)
  console.log("hello");
  for (const i of controlBtns) {
    console.log(i);
  }
};

ControlBtnToggle();

function ExpandPlayer() {
  let tracktitle = document.getElementById("track-title").innerHTML;
  if (playerexpand) {
    document.getElementById("track-title").style.display = "flex";
    playerexpand = false;
    document.getElementById("player-div").style.height = "9rem";
    document.getElementsByClassName("player-body")[0].style.display = "none";
    document.getElementById(
      "expand-btn"
    ).style.backgroundImage = `url(${static_url}Images/arrow-up.png`;
  } else {
    playerexpand = true;
    document.getElementById("track-title").style.display = "none";
    document.getElementsByClassName(
      "player-head"
    )[0].firstElementChild.innerHTML = tracktitle;
    document.getElementById("player-div").style.height = "85%";
    document.getElementById(
      "expand-btn"
    ).style.backgroundImage = `url(${static_url}Images/down.png`;
    document.getElementsByClassName("player-body")[0].style.display = "flex";
  }
}

function GetLyrics() {
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "get_lyrics",
      naat_url: naatpath,
    },
    success: function (response) {
      document.getElementById("disk").style.display = "none";
      document.getElementById("lyrics").innerHTML = response["lyrics"];
    },
  });
}

function VoiceSearch() {
  let recognition = new speech();
  recognition.onstart = function () {
    console.log("We are listening. Try speaking into the microphone.");
  };
  recognition.onspeechend = function () {
    // when user is done speaking
    recognition.stop();
  };
  recognition.onresult = function (event) {
    var transcript = event.results[0][0].transcript;
    var confidence = event.results[0][0].confidence;
    console.log(transcript);
    console.log(confidence);
  };
  recognition.start();
}

function Like(url, title) {
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "like",
      naat_url: naatpath,
      title: currentTitle,
    },
    success: function (response) {
      if (response["msg"] === true) {
        console.log(response["msg"]);
        document.getElementById("like-btn").style.backgroundImage = `url(${static_url}Images/filled-heart.png`;
        console.log(static_url + "Images/filled-heart.png")
      } else if(response['msg'] === 'already_liked'){
        document.getElementById("like-btn").style.backgroundImage = `url(${static_url}Images/heart-empty.png`;

      }
      
      
      
      else {
        console.log(response["msg"]);
        TriggerAnimation("Login required!", "error");
      }
    },
  });
}

function Search(input) {
  // loadingDiv.style.display = 'flex';
  document.getElementById("loading-div").style.display = "flex";
  let query
  if(input === null){
      query = document.getElementsByName("query")[0].value;
      console.log('chalra',query)
  }else{query=input}
  // console.log(query)
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "search",
      query: query,
    },
    success: function (response) {
      document.getElementsByClassName('pagination-div')[0].innerHTML = response['pages']
      let div = document.getElementsByClassName("naat-cards-div")[0];
      document.getElementById("loading-div").style.display = "none";
      document.getElementById("heading").innerHTML =
        Array.from(response["result"]).length + " results found";
      div.innerHTML = "";
      for (const result in response["result"]) {
        let n = response["result"][result];
        console.log(n.title);
        let naat = `<div class="card">
                <img src="${n.thumbnail}" alt="">
                <div>
                <h4>${n.title}</h4>
                <label for="">${n.naat_khwan}</label>
                </div>
                <button id='${result}' onclick='PlayNaat("${n.link}","${n.title}",${result})' class='play-btn'></button>
                
            </div>`;
        div.innerHTML += naat;
      }
    },
  });
}


 
function SideBarToggle() {
  if (sidebar) {
    sidebar = false;
    document.getElementsByClassName("nav-links")[0].style.display = "none";
    document.getElementsByClassName("search-div")[0].style.display = "flex";
    document.getElementsByClassName("auth-div")[0].style.display = "none";
    document.getElementById("hamburger-btn").style.opacity = "100%";
  } else {
    sidebar = true;
    document.getElementsByClassName("nav-links")[0].style.display = "flex";
    document.getElementsByClassName("auth-div")[0].style.display = "flex";
    document.getElementsByClassName("search-div")[0].style.display = "none";
    document.getElementById("hamburger-btn").style.opacity = "60%";
  }
}



document.onload = () => {};

function ChangePage(current_url) {

  document.getElementById("loading-div").style.display = "flex";
  if (current_url != "") {
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: {
        action: "change_page",
        target_url: current_url,
      },
      success: function (response) {
        document.getElementById("loading-div").style.display = "none";
        let div = document.getElementsByClassName("naat-cards-div")[0];
        document.getElementById("loading-div").style.display = "none";
        document.getElementById("heading").innerHTML =
          Array.from(response["result"]).length + " results found";
        div.innerHTML = "";

   


        document.getElementsByClassName('pagination-div')[0].innerHTML = response['pages']


        for (const result in response["result"]) {
          let n = response["result"][result];
          console.log(n.title);
          let naat = `<div class="card">
                <img src="${n.thumbnail}" alt="">
                <div>
                <h4>${n.title}</h4>
                <label for="">${n.naat_khwan}</label>
                </div>
                
                <button id='${result}' onclick='PlayNaat("${n.link}","${n.title}",${result})' class='play-btn'></button>
            </div>`;
          div.innerHTML += naat;
        }
      },
    });
  }else{
    document.getElementById('loading-div').style.display = 'none';
    TriggerAnimation('Not Found','error')
    }
}
