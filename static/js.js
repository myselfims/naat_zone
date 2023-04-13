var ajax_url = window.location.origin + "/ajax/";
let playing = false;
let playerexpand = false;
var audio;
let naatpath;
let crnt_naat_khwan;
let currentTitle;
var loadingDiv = document.getElementById("loading-div");
let sidebar = false;
let currentAngle = 0;
let currentid;
let next_click = false;
var beepaudio = new Audio(
  "https://www.soundjay.com/buttons/sounds/button-35.mp3"
);

let colors = [
  "#6bea64",
  "#6abbcd",
  "#9485f8",
  "#f885d8",
  "#f1f885",
  "#f88585",
  "#d776ff",
];

function PlayNaat(src, title, id, naat_khwan) {
  document.getElementById('lyrics').style.display = 'none';
  document.getElementsByClassName("disk-spinner-div")[0].style.display = "flex";
  let promise = new Promise((resove, reject) => {
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: {
        action: "check_like",
        url: src,
      },
      success: function (response) {
        resove(response);
      },
    });
  });

  promise.then((resp) => {
    console.log(resp);
    if (resp.like === true) {
      document.getElementById(
        "like-btn"
      ).innerHTML = `<i class="fa-solid fa-heart"></i>`;
    } else {
      document.getElementById(
        "like-btn"
      ).innerHTML = `<i class='fa-regular fa-heart'></i>`;
    }
  });
  crnt_naat_khwan = naat_khwan;
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
      currentid = id;
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
          document.getElementsByClassName(
            "player-head"
          )[0].firstElementChild.innerHTML = title;
          if (String(title).toLowerCase().includes("lyrics")) {
            console.log(true);
            document.getElementById("lyrics-btn").style.display = "flex";
          } else {
            document.getElementById("lyrics-btn").style.display = "none";
            console.log(false);
          }

          playing = true;
          document.getElementById(
            "play-btn"
          ).innerHTML = `<i class="fa-solid fa-pause"></i>`;
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
            audio.volume =
              document.getElementsByClassName("volume_adjuster")[0].value / 100;
            if (audio.currentTime === audio.duration) {
              if (audio.loop === false && next_click === false) {
                console.log("called...");
                next_click = true;
                document.getElementById("nxt-btn").click();
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
      ).innerHTML = `<i class="fa-solid fa-play"></i>`;
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
      ).innerHTML = `<i class="fa-solid fa-pause"></i>`;
      audio.play();
    }
  }
  // let audio = document.getElementsByTagName('audio');
}

function TrackChanger(action) {
  if (action === "previous") {
    try {
      document.getElementById(Number(currentid) - 1).click();
    } catch {}
  } else {
    try {
      document.getElementById(Number(currentid) + 1).click();
    } catch {}
  }
}

document.onkeydown = function (key) {
  console.log(key.code);
  document.getElementsByTagName("body")[0].click();
  if (key.code === "Space") {
    PlayerToggle();
  }

  if (key.code === "ArrowRight") {
    audio.currentTime = audio.currentTime + 10;
  }
  if (key.code === "ArrowLeft") {
    audio.currentTime = audio.currentTime - 10;
  }
  if (key.code === "Slash") {
    document.getElementsByName("query")[0].focus();
    setTimeout(() => {
      document.getElementsByName("query")[0].value = "";
    }, 50);
  }
  if (key.code === "Enter") {
    let input = document.getElementsByName("query")[0];
    if (input === document.activeElement && input.value != "") {
      document.getElementById("search-btn").click();
    }
  }
};

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
    elem.style.opacity = "100%";
    // elem.style.animation = "JumpIn 2s ease-in ";
    elem.style.background = "rgba(106, 231, 78, 0.807)";
  }

  setTimeout(() => {
    elem.style.animation = null;
    elem.style.opacity = "0%";
  }, 2000);
}

function SetVolume(check) {
  if (check) {
    if (audio.volume === 0) {
      document.getElementById(
        "volume-btn"
      ).innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
      audio.volume = 1;
      document.getElementsByClassName("volume_adjuster")[0].value = 100;
    } else {
      document.getElementsByClassName("volume_adjuster")[0].value = 0;
      document.getElementById(
        "volume-btn"
      ).innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
      audio.volume = 0;
    }
  } else {
    console.log(document.getElementsByClassName("volume_adjuster")[0].value);
    if (document.getElementsByClassName("volume_adjuster")[0].value == 0) {
      document.getElementById(
        "volume-btn"
      ).innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    } else {
      document.getElementById(
        "volume-btn"
      ).innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
    }
    audio.volume =
      document.getElementsByClassName("volume_adjuster")[0].value / 100;
  }
}

function LoopToggle() {
  console.log("Timing function running");
  if (audio.loop == false) {
    audio.loop = true;
    document.getElementById("loop-btn").style.opacity = "100%";
  } else {
    audio.loop = false;
    document.getElementById("loop-btn").style.opacity = "50%";
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
    ).innerHTML = `<i class="fa-solid fa-chevron-up"></i>`;
  } else {
    playerexpand = true;
    document.getElementById("track-title").style.display = "none";
    document.getElementsByClassName(
      "player-head"
    )[0].firstElementChild.innerHTML = tracktitle;
    document.getElementById("player-div").style.height = "85%";
    document.getElementById(
      "expand-btn"
    ).innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
    document.getElementsByClassName("player-body")[0].style.display = "flex";
  }
}

function GetLyrics() {
  let btn = document.getElementById("lyrics-btn");
  if (btn.innerHTML === "Lyrics") {
    btn.innerHTML = "Fetching...";
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: {
        action: "get_lyrics",
        naat_url: naatpath,
      },
      success: function (response) {
        btn.innerHTML = "Close";
        document.getElementsByClassName("disk-spinner-div")[0].style.display =
          "none";
        document.getElementById("lyrics").innerHTML = response["lyrics"];
        document.getElementById("lyrics").style.display = "inline-block";
      },
    });
  } else {
    btn.innerHTML = "Lyrics";
    document.getElementsByClassName("disk-spinner-div")[0].style.display =
      "flex";
    document.getElementById("lyrics").style.display = "none";
  }
}

function VoiceSearch() {
  beepaudio.play();
  document.getElementById("mic-btn").style.color = "#39EAA8";
  TriggerAnimation("Speak now");
  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";

  recognition.start();
  recognition.onresult = function (event) {
    document.getElementById("mic-btn").style.color = "black";
    document.getElementsByName("query")[0].value =
      event.results[0][0].transcript;
    document.getElementById("search-btn").click();
    console.log(event.results[0][0].transcript);
  };
  recognition.onend = (event) => {
    document.getElementById("mic-btn").style.color = "black";
    console.log(event);
  };
  recognition.error = (event) => {
    TriggerAnimation("Please try again", "error");
    document.getElementById("mic-btn").style.color = "black";
    console.log(event);
  };
}
function Like(url, title) {
  console.log("naat khawan is ", crnt_naat_khwan);
  if (naatpath != "" && currentTitle != "") {
    $.ajax({
      type: "POST",
      url: ajax_url,
      data: {
        action: "like",
        naat_url: naatpath,
        title: currentTitle,
        naat_khwan: crnt_naat_khwan,
      },
      success: function (response) {
        if (response["msg"] === true) {
          console.log(response["msg"]);
          TriggerAnimation("Added to favorite");
          document.getElementById(
            "like-btn"
          ).innerHTML = `<i class="fa-solid fa-heart"></i>`;
        } else if (response["msg"] === "already_liked") {
          TriggerAnimation("Removed from favorite", "error");
          document.getElementById(
            "like-btn"
          ).innerHTML = `<i class="fa-regular fa-heart"></i>`;
        } else {
          console.log(response["msg"]);
          TriggerAnimation("Login required!", "error");
        }
      },
    });
  } else {
    TriggerAnimation("Plase Play Somthing", "error");
  }
}

function LoadFavorite() {
  document.getElementById("loading-div").style.display = "flex";
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "load_favorite",
    },
    success: function (response) {
      if (response["naats"] === false) {
        document.getElementById("loading-div").style.display = "none";
        TriggerAnimation("Login required", "error");
      } else {
        document.getElementById("loading-div").style.display = "none";
        document.getElementsByClassName("pagination-div")[0].innerHTML = "";
        document.getElementsByClassName(
          "top-card-div"
        )[0].firstElementChild.innerHTML = "My favorite";
        document.getElementsByClassName("naat-cards-div")[0].innerHTML = "";
        for (naat in response["naats"]) {
          console.log(naat);
          let element = `<div class="card">
        <img src="https://www.seekpng.com/png/full/415-4154541_dj-disk-png-orange-clip-art.png" alt="">
        <div>
            <h4>${response["naats"][naat].title}</h4>
            <label for="">${response["naats"][naat].naat_khwan}</label>
        </div>
        <button id='${naat}' onclick='PlayNaat("${response["naats"][naat].url}","${response["naats"][naat].title}","${naat}")' class='play-btn'></button>
        
    </div>`;

          document.getElementsByClassName("naat-cards-div")[0].innerHTML +=
            element;
        }
      }
    },
  });
}

function Search(input) {
  // loadingDiv.style.display = 'flex';
  document.getElementById("loading-div").style.display = "flex";
  let query;
  if (input === null) {
    query = document.getElementsByName("query")[0].value;
    console.log("chalra", query);
  } else {
    query = input;
  }
  // console.log(query)
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "search",
      query: query,
    },
    success: function (response) {
      document.getElementsByClassName("pagination-div")[0].innerHTML =
        response["pages"];
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
                <button id='${result}' onclick='PlayNaat("${n.link}","${n.title}",${result},"${n.naat_khwan}")' class='play-btn'></button>
                
            </div>`;
        div.innerHTML += naat;
      }
    },
  });
}

function GetArtist(url) {
  document.getElementById("loading-div").style.display = "flex";
  console.log(url);
  if (url === NaN) {
    url = "None";
  }
  console.log(url);
  $.ajax({
    type: "POST",
    url: ajax_url,
    data: {
      action: "get_artist",
      url: url,
    },
    success: function (response) {
      document.getElementById("loading-div").style.display = "none";
      console.log(response["result"][0]);
      let div = document.getElementsByClassName("naat-cards-div")[0];
      div.innerHTML = "";
      for (const result in Array.from(response["result"]).slice(1, 100)) {
        let n = response["result"][result];
        console.log(n.title);
        let naat = `<div class="card">
                <img src="${n.thumbnail}" alt="">
                <div>
                <h4>${n.name}</h4>
                <label for="">${n.name}</label>
                </div>
                <button id='${result}' onclick='GetArtist("${n.link}")' class='play-btn'></button>
                
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
    document.getElementById("hamburger-btn").style.background = "transparent";
  } else {
    sidebar = true;
    document.getElementsByClassName("nav-links")[0].style.display = "flex";
    document.getElementsByClassName("auth-div")[0].style.display = "flex";
    document.getElementsByClassName("search-div")[0].style.display = "none";
    document.getElementById("hamburger-btn").style.background = "rgb(10 142 92 / 78%)";
  }
}


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

        document.getElementsByClassName("pagination-div")[0].innerHTML =
          response["pages"];

        for (const result in response["result"]) {
          let n = response["result"][result];
          console.log(n.title);
          let naat = `<div class="card">
                <img src="${n.thumbnail}" alt="">
                <div>
                <h4>${n.title}</h4>
                <label for="">${n.naat_khwan}</label>
                </div>
                
                <button id='${result}' onclick='PlayNaat("${n.link}","${n.title}",${result},"${n.naat_khwan}")' class='play-btn'></button>
            </div>`;
          div.innerHTML += naat;
        }
      },
    });
  } else {
    document.getElementById("loading-div").style.display = "none";
    TriggerAnimation("Not Found", "error");
  }
}

function CloseSignup() {
  document.getElementsByClassName("auth-form")[0].style = "display: none;";
}

function Authentication(btn) {
  try {
    document.getElementById(
      "play-btn"
    ).innerHTML = `<i class="fa-solid fa-play"></i>`;
    audio.pause();
  } catch {}
  if(btn!='logout'){
    document.getElementsByClassName("auth-form")[0].style = "display: flex;";
    document.getElementById("loading-div").style.display = "flex";

  }
  if (btn === "login") {
    console.log("working..");
    document.getElementById("loading-div").style.display = "none";
    document.getElementsByClassName(
      "auth-form"
    )[0].innerHTML = `<div class="signup-div">
    <div class="signup-head">
        <h1>Login</h1>
        <button onclick='CloseSignup()'><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="signup-body">
        <div>
            <label for="">Username</label>
            <input name='username' class="inputbox" type="text">
        </div>
        <div>
            <label for="">Password</label>
            <input name='password' class="inputbox" type="password">
        </div>
        <button onclick='SubmitForm("login")' id='auth-btn' class="btn">Login</button> 
    </div>
  </div>`;
  } else if (btn === "signup") {
    document.getElementById("loading-div").style.display = "none";
    document.getElementsByClassName(
      "auth-form"
    )[0].innerHTML = `<div class="signup-div">
    <div class="signup-head">
        <h1>Signup</h1>
        <button onclick='CloseSignup()'><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="signup-body">
        <div>
            <label for="">Username</label>
            <input name='username' class="inputbox" type="text">
        </div>
        <div>
            <label for="">Email</label>
            <input name='email' class="inputbox" type="mail">
        </div>
        <div>
            <label for="">Password</label>
            <input name='password' class="inputbox" type="password">
        </div>
        <button onclick='SubmitForm("signup")' id='auth-btn' class="btn">Signup</button> 
    </div>
  </div>`;
  }else if(btn === 'logout'){
    $.ajax({
      type: 'POST',
      url : ajax_url,
      data : {
        action : 'logout',
      },
      success: function (response) {
        if (response["logout"] === true) {
          TriggerAnimation("Logged out",'error');
          document.getElementsByClassName(
            "auth-div"
          )[0].innerHTML = `<a onclick='Authentication("login")'><button id='loginbtn'>Login</button></a>
          <a  onclick='Authentication("signup")'><button id='signupbtn' class='btn'>Sign up</button></a>`;
        } else {
          TriggerAnimation("Something went wrong!", "error");
        }
      },
    })
  }
}

function SubmitForm(type) {
  document.getElementById("auth-btn").innerHTML =
    'Processing...';
  let username = document.getElementsByName("username")[0].value;
  let password = document.getElementsByName("username")[0].value;

  if (type === "login") {
    if (username != "" && password != "") {
      $.ajax({
        type: "POST",
        url: ajax_url,
        data: {
          action: "login",
          username: username,
          password: password,
        },
        success: function (response) {
          if (response["login"] === true) {
            TriggerAnimation("Login success");
            document.getElementsByClassName("auth-form")[0].style.display = "none";
            document.getElementsByClassName(
              "auth-div"
            )[0].innerHTML = `<a onclick='Authentication("login")'><button id='loginbtn'>${username}</button></a>
            <a  onclick='Authentication("logout")'><button id='signupbtn' class='btn'>logout</button></a>`;
          } else {
            TriggerAnimation("Invalid credintails!", "error");
          }
        },
      });
    }else{TriggerAnimation('Please fill the form','error')}
  }
  else if (type === "signup") {
    let email = document.getElementsByName("email")[0].value;
    if (username != "" && password != "" && email != '') {
      $.ajax({
        type: "POST",
        url: ajax_url,
        data: {
          action: "signup",
          username: username,
          password: password,
          email : email
        },
        success: function (response) {
          if (response["signup"] === true) {
            TriggerAnimation("Account created");
            document.getElementsByClassName("auth-form")[0].style.display = "none";
            document.getElementsByClassName(
              "auth-div"
            )[0].innerHTML = `<a onclick='Authentication("login")'><button id='loginbtn'>${username}</button></a>
            <a  onclick='Authentication("logout")'><button id='signupbtn' class='btn'>Logout</button></a>`;
          } else {
            TriggerAnimation("Username already exist!", "error");
            document.getElementById("auth-btn").innerHTML ='Signup';
          }
        },
      });
    }else{TriggerAnimation('Please fill the form','error')}
  }
}
