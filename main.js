var w=window.innerWidth,
    h=window.innerHeight,
    amount=((w*h)/10000)|0;
outOf.textContent=amount+1;
c.width=w;
c.height=h;
var ctx=c.getContext('2d');
let can = document.getElementById('c');
let stat = document.getElementById('stats');
let gmOver = document.getElementById('gameover');
let body = document.getElementById('the_body');
let replay = document.getElementById('replay');
let newG = document.getElementById('newG');
// let gmStartMes = document.getElementById('gameover2');
// let okBtn = document.getElementById('okBtn');
let back = document.getElementsByClassName("topbar")[0];
let par = document.getElementsByClassName("par")[0];
let restartBtn = document.getElementsByClassName("topbar2")[0];
let mesPar = document.getElementsByClassName("mesPar")[0];
let goDetails2 = document.getElementsByClassName("goDetails2")[0];
let scoreNum = document.getElementById('scoreNum');
let timeNum = document.getElementById('timeNum');
let message = document.getElementById('message');
let devsize = document.getElementById('devsize');
let popUpClosedFlag = true;
let gameplayed = 0, timetaken;
let backG = document.getElementById('backG');
backG.addEventListener("click",goback);

function goback(){
  if(getMobileOperatingSystem()=="Android"){
      JsInterface.showToast("goback");
    }else if(getMobileOperatingSystem()=="iOS"){
//      window.location = "showToast://0/"+puzzel
      window.webkit.messageHandlers.showToast.postMessage("goback");
    }
}

/**
* Determine the mobile operating system.
* This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
*
* @returns {String}
*/
function getMobileOperatingSystem() {
var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
  }

  if (/android/i.test(userAgent)) {
      return "Android";
  }

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
  }

  return "unknown";
}


var inGame=false,
    cells=[];
function getRandomColor(min){
  return 'rgb(cr, cg, cb)'.replace(
    'cr', (Math.random()*(255-min))|0+min).replace(
    'cg', (Math.random()*(255-min))|0+min).replace(
    'cb', (Math.random()*(255-min))|0+min)
};
clicked=false;
function init(){
  // if(gameplayed == 0){
  //   gmStartMes.style.visibility = "visible";
  // }
  clicked=false;
  ctx.fillStyle='black';
  ctx.fillRect(0, 0, w, h);
  score.textContent='0';
  cells=[];
  for(var n=0; n<amount; ++n){
    cells.push(new Cell);
  }
  inGame=true;
  // console.log(cells);
  anim();
  replay.addEventListener("click", restart);
  newG.addEventListener("click", restart2);
  console.log("Device size ",window.innerWidth, window.innerHeight, window.screen.height, window.screen.width);
  // okBtn.addEventListener("click", removePopUp);
  devsize.innerHTML = window.screen.width +", "+ window.screen.height;
  if(getMobileOperatingSystem()=="iOS"){
    setForIos();
  }

}
var maxSize=10, minSize=6,
    maxV=4;
function Cell(size, x, y){
  this.color=getRandomColor(100);
  this.size=size||Math.random()*(maxSize-minSize)+minSize;
  this.initSize=this.size;
  this.x=x||Math.random()*w;
  this.y=y||Math.random()*h;
  this.vx=Math.random()*maxV*2-maxV;
  this.vy=Math.random()*maxV*2-maxV;
  this.exploded=false;
  this.explosionSize=10;
}
Cell.prototype.update=function(){
  // console.log("here")
  this.x+=this.vx;
  this.y+=this.vy;

  if(this.x<0||this.x>w) this.vx*=-1;
  if(this.y<0||this.y>h) this.vy*=-1;


  ctx.fillStyle=this.color;
  ctx.beginPath();
  ctx.arc(this.x, this.y, Math.abs(this.size/2), 0, Math.PI*2);
  ctx.fill();
  ctx.closePath();
  //ctx.fillRect(this.x-this.size/2, this.y-this.size/2, this.size, this.size);

  if(this.exploded){
    if(this.size>0){
      this.explosionSize+=1/this.explosionSize*10;
      this.size-=0.05;
    }else{
      cells.splice(cells.indexOf(this), 1);
    }
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.explosionSize, 0, Math.PI*2);

    for(var i=0; i<cells.length; ++i){
      var cell=cells[i];
      if(!cell.exploded){
        var a=this, b=cell;
        var distX=a.x-b.x,
            distY=a.y-b.y,
            dist=Math.sqrt((distX*distX)+(distY*distY));
        if(dist<=this.explosionSize) cells[i].explode();
      }
    }

    ctx.strokeStyle=this.color;
    ctx.stroke();
    ctx.closePath();
  }
}
Cell.prototype.explode=function(){
  this.exploded=true;
  this.vx=this.vy=0;
  score.textContent=parseInt(score.textContent)+1;
  // console.log("explode");
}

nextInit=false;


function anim(){
  if(nextInit){
    nextInit=false;
    init();
    return;
  }
  if(inGame) window.requestAnimationFrame(anim);
  ctx.fillStyle='rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, w, h);
  var c;
  for(c=0; c<cells.length; ++c){
   // console.log(cells[c]);
   cells[c].update();

 }

  if(cells.length===0) gameOver();
}

function setForIos() {
  back.style.width = "130px";
  back.style.height = "120px";
  par.style.width = "100%";
  restartBtn.style.width = "130px";
  restartBtn.style.height = "120px";
  stat.style.fontSize = "50px";
  goDetails2.style.fontSize = "45px";
}

function gameOver(){
  console.log("Inside gameover",cells.length);
  stop();
  inGame=false;
  gameoverAfter();
}
init();
can.addEventListener('click', function(e){
  console.log("popUpClosedFlag ",popUpClosedFlag);
  mesPar.style.visibility = 'hidden';
  if(popUpClosedFlag == true){
    reset();
    start();
    gameplayed = 1;
    reset();
    start();
    if(!inGame) init();
    else if(clicked){
      nextInit=true;
      console.log("clicked true");
    }else{
      var cell=new Cell(15, e.clientX, e.clientY)
      cells.push(cell);
      cell.explode();
      clicked=true;
      // console.log("clicked cell",cells);
    }
  }
  // popUpClosedFlag = true;
});


message.addEventListener('click', function(e){
  console.log("popUpClosedFlag ",popUpClosedFlag);
  mesPar.style.visibility = 'hidden';
  if(popUpClosedFlag == true){
    reset();
    start();
    gameplayed = 1;
    reset();
    start();
    if(!inGame) init();
    else if(clicked){
      nextInit=true;
      console.log("clicked true");
    }else{
      var cell=new Cell(15, e.clientX, e.clientY)
      cells.push(cell);
      cell.explode();
      clicked=true;
      // console.log("clicked cell",cells);
    }
  }
  // popUpClosedFlag = true;
});



var images = [];
var check;
function preload() {
console.log("preload");
    for (var i = 0; i < arguments.length; i++) {
        images[i] = new Image();
        images[i].src = preload.arguments[i];
        // images[i].onload = function(){
        //     imagesloaded = imagesloaded + 1;
        //     if(imagesloaded == 11){
        //        backgroundLoaded = true;
        //     }
        // }
    }


}


preload(
   "img/bg.jpg",
)

function backToWhitebody(){
  body.style.background = 'white';
}

function setBackgroundImage(){
  body.style.backgroundImage = 'url('+images[0].src+')';
  body.style.backgroundSize = "cover"
  body.style.backgroundRepeat = "repeat";
}

function gameoverAfter(){
  restartBtn.style.visibility = "hidden";
  back.style.visibility = "hidden";
  can.style.display = "none";
  stat.style.display = "none";
  setBackgroundImage();
  gmOver.style.visibility = "visible";
  timeNum.innerHTML = timetaken;
  scoreNum.innerHTML = score.textContent;
}

function restart(){
  // console.log("Inside restart");
  // gmStartMes.style.visibility = "hidden";
  restartBtn.style.visibility = "visible";
  back.style.visibility = "visible";
  can.style.display = "block";
  stat.style.display = "block";
  // backToWhitebody();
  gmOver.style.visibility = "hidden";
  if(popUpClosedFlag == true){
    reset();
    start();
    if(!inGame) init();
    else if(clicked){
      nextInit=true;
      // console.log("clicked true");
    }else{
      var cell=new Cell(15, e.clientX, e.clientY)
      cells.push(cell);
      cell.explode();
      clicked=true;
      // console.log("clicked cell",cells);
    }
  }

}

function restart2(){
  console.log("Inside restart2");
  // gmStartMes.style.visibility = "hidden";
  if(popUpClosedFlag == true){
    if(!inGame) init();
    else if(clicked){
      nextInit=true;
      // console.log("clicked true");
    }else{
      var cell=new Cell(15, e.clientX, e.clientY)
      cells.push(cell);
      cell.explode();
      clicked=true;
      // console.log("clicked cell",cells);
    }
  }
}

// function removePopUp(){
//   gmStartMes.style.visibility = "hidden";
//   popUpClosedFlag = true;
// }




var timeBegan = null, timeStopped = null, stoppedDuration = 0, started = null;
function start() {
    if (timeBegan === null) {
        timeBegan = new Date();
    }

    if (timeStopped !== null) {
        stoppedDuration += (new Date() - timeStopped);
    }
    console.log(stoppedDuration);

    started = setInterval(clockRunning, 10);
}

function stop() {
    timeStopped = new Date();
    clearInterval(started);
}

function reset() {
    clearInterval(started);
    stoppedDuration = 0;
    timeBegan = null;
    timeStopped = null;
    // document.getElementById("idTime").innerHTML = "00:00";
    timetaken = "00:00";
}

function clockRunning(){
    var currentTime = new Date()
        , timeElapsed = new Date(currentTime - timeBegan - stoppedDuration)
        , hour = timeElapsed.getUTCHours()
        , min = timeElapsed.getUTCMinutes()
        , sec = timeElapsed.getUTCSeconds()
        , ms = timeElapsed.getUTCMilliseconds();




       if(hour == 0){
           // document.getElementById("idTime").innerHTML =
           //
           //     (min > 9 ? min : "0" + min) + ":" +
           //     (sec > 9 ? sec : "0" + sec);
            timetaken = (min > 9 ? min : "0" + min) + ":" +(sec > 9 ? sec : "0" + sec);

       }else{

        // document.getElementById("idTime").innerHTML =
        // (hour > 9 ? hour : "0" + hour) + ":" +
        // (min > 9 ? min : "0" + min) + ":" +
        // (sec > 9 ? sec : "0" + sec);
        timetaken = (hour > 9 ? hour : "0" + hour) + ":" + (min > 9 ? min : "0" + min) + ":" + (sec > 9 ? sec : "0" + sec);
//        (ms > 99 ? ms : ms > 9 ? "0" + ms : "00" + ms);

       }
       // gl_hour = hour, gl_min = min, gl_sec = sec, gl_ms = ms;
}

function loop(){
  // console.log("inside onload");
  document.getElementsByTagName("body")[0].style.opacity = "1";
}
