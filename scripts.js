var mymap = L.map('mapid').setView([53.428544, 14.552812], 15);
const permisn = Notification.requestPermission();

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 25,
id: 'mapbox/satellite-v9',
tileSize: 512,
zoomOffset: -1,
accessToken: 'pk.eyJ1Ijoic2hhbmF2IiwiYSI6ImNraGJsNWpsczA4bDUzMW12YXFkcnJieW0ifQ.aEXrgmPr66U6prRon8A_hQ'
}).addTo(mymap);

var x = document.getElementById("MyLocation");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
    mymap.setView([position.coords.latitude, position.coords.longitude], 15)
    console.log("Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude);  
}

function addGrid()  {
  for (let i = 0; i <= 15; i++) {
  document.getElementById("puzzleDrop").innerHTML +=
    '<div class="placetodrop" id="' + (i + 1) + 'id"  ondragover="allowDrop(event)" ondrop="drop(event)"></div>';
  }
}


function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
} 

function getPuzzle(position) {
  document.getElementById("puzzleShow").style.display = "flex";
  leafletImage(mymap, function (err, canvas) {
    let map = document.getElementById("mapToRaster");
    let rasterContext = map.getContext("2d");
    map.width = 512;
    map.height = 512;
    rasterContext.drawImage(canvas, 0, 0, 512, 512);

    let puzzle = new Array();
    let width = 128;
    let height = 128;
    let cnt = 0;
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        let piece = document.createElement("canvas");
        cnt += 1;
        piece.id = cnt;
        piece.height = height;
        piece.width = width;
        piece.draggable = true;
        let pieceToDraw = piece.getContext("2d");
        pieceToDraw.drawImage(map, y * width, x * height, width, height, 0, 0, width, height);
        puzzle[cnt] = piece;
      }
    }

    puzzle.splice(0, 1);
    for (let i = 0; i <= 15; i++) {
      let z = -1;
      while (z <= -1) {
        z = randInt(0, puzzle.length);
        document.getElementById("puzzleShow").appendChild(puzzle[z]);
        puzzle.splice(z, 1);
      }
    }

    let y = document.getElementsByTagName("canvas");
    for (let j = 0; j <= 15; j++) {
      y[j].setAttribute("ondragstart", "drag(event)");
    }
  });
}

function check(permisn) {
  let elements = document.getElementsByClassName("placetodrop");
  let cnt = 0;
  for (let e of elements) {
    let first = e.id;
    let second;
    if (e.childNodes.length > 0) {
      let x = e.childNodes;
      second = x[0].id;
      if (first == second + "id") {
        cnt += 1;
      }

    } else {
      continue;
    }
  }
  
  	console.log(16-cnt + " to go");

  if (cnt == 16) {
	console.log("KONIEC");

    permisn.then(function (result) {
      if (result === "granted") {
        var text = "Hurra!";
        new Notification("Poprawnie ułożyłeś puzzle!", { body: text });
      }
    });
  }
}

function drop(ev) {
  ev.preventDefault();
  var dataHolder = ev.dataTransfer.getData("text");
  if (ev.target.childNode === undefined && ev.target.parentNode.id == "puzzleDrop") {
    ev.target.appendChild(document.getElementById(dataHolder));
    if (ev.target.id == dataHolder + "id") {
      document.getElementById(dataHolder).setAttribute("draggable", "false");
	  		  	  	    console.log("Position correct!");

    }
  } else {
    returnBack(dataHolder);
  }
	
  check(permisn);
}

function returnBack(d) {
  document.getElementById("puzzleShow").appendChild(document.getElementById(d));
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}


