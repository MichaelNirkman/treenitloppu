function getBikes(bike_id, titleTarget, statusTarget, colorTarget) {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{bikeRentalStation(id:"' + bike_id + '") { name bikesAvailable spacesAvailable}}' }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            var stationName = myJson.data.bikeRentalStation.name;
            var bikesAvailable = myJson.data.bikeRentalStation.bikesAvailable;
            var spacesAvailable = myJson.data.bikeRentalStation.spacesAvailable;
            var totalAvailable = bikesAvailable + spacesAvailable;

            var statusarea = document.getElementById(statusTarget);
            statusarea.innerHTML = "";

            var color = "";
            if (bikesAvailable <= Math.round(totalAvailable / 3) && bikesAvailable > 0) {
                color = "niceText orange"
            } else if (bikesAvailable > Math.round(totalAvailable / 3)) {
                color = "niceText green"
            } else {
                color = "niceText red"
            }
            if (bikesAvailable == 0 && totalAvailable == 0) {
                statusarea.innerHTML = "Ei käytössä"
            } else {
                for (i = 0; i < bikesAvailable; i++) {
                    statusarea.innerHTML += '<i class="fas fa-bicycle bikeicon"></i>'
                }
                for (u = 0; u < spacesAvailable; u++) {
                    statusarea.innerHTML += '<i class="fas fa-bicycle bikeicon blacktext"></i>'
                }
            }
            document.getElementById(titleTarget).innerHTML = stationName;
            statusarea.className = "stationStatus " + color;
        });
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('currentTime').innerHTML =
        h + ":" + m + ":" + s;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) { i = "0" + i }; // add zero in front of numbers < 10
    return i;
}

function getBuses(amnt) {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{  stop(id: "HSL:1431102") {    name      stoptimesWithoutPatterns(numberOfDepartures: ' + amnt + ') {     scheduledDeparture  realtimeDeparture  serviceDay   headsign trip{route{shortName}}}  }}' }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            var table = document.createElement("table");
            table.id = "timetable";
            table.className = "bustable"
            for (i = 0; i < myJson.data.stop.stoptimesWithoutPatterns.length; i++) {
                var row = table.insertRow(i);
                if (i % 2 != 0) {
                    row.className = "tablerow blue";
                } else {
                    row.className = "tablerow darkerblue";
                }
                var busNumber = row.insertCell(0);
                busNumber.className = "busNumber niceText";
                var routeName = row.insertCell(1);
                routeName.className = "routeName niceText";
                var time = row.insertCell(2);
                time.className = "bustime niceText";
                var timeSecs = myJson.data.stop.stoptimesWithoutPatterns[i].realtimeDeparture;
                if (timeSecs > myJson.data.stop.stoptimesWithoutPatterns[i].scheduledDeparture) {
                    time.className += " late";
                }
                var curdate = new Date();
                var date = new Date(myJson.data.stop.stoptimesWithoutPatterns[i].serviceDay * 1000 + (timeSecs * 1000));
                var date_diff = date - curdate;
                var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                var convertedTime = new Date(date - tzoffset).toISOString().substr(11, 5);
                if (date_diff < 1500000) {
                    var diffminutes = new Date(date_diff).getMinutes()
                    convertedTime = diffminutes.toString() + " min"
                    if (diffminutes == 0) {
                        convertedTime = "<1 min";
                    }
                }
                busNumber.innerHTML = myJson.data.stop.stoptimesWithoutPatterns[i].trip.route.shortName;
                routeName.innerHTML = myJson.data.stop.stoptimesWithoutPatterns[i].headsign;
                time.innerHTML = convertedTime;
            }
            var oldtable = document.getElementById("timetable");
            oldtable.parentNode.replaceChild(table, oldtable);
        });
}

function getMetro(statid, amnt, direction) {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{  stop(id: ' + statid + ') {    name      stoptimesWithoutPatterns(numberOfDepartures: ' + amnt + ') {     scheduledDeparture  realtimeDeparture  serviceDay   headsign trip{route{shortName}}}  }}' }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            var table = document.createElement("table");
            table.id = direction;
            for (i = 0; i < myJson.data.stop.stoptimesWithoutPatterns.length; i++) {
                var row = table.insertRow(i);
                if (i % 2 != 0) {
                    row.className = "tablerow orange";
                } else {
                    row.className = "tablerow darkerorange";
                }
                var routeName = row.insertCell(0);
                routeName.className = "metroNumber niceText";
                var time = row.insertCell(1);
                time.className = "metrotime niceText";
                var timeSecs = myJson.data.stop.stoptimesWithoutPatterns[i].realtimeDeparture;
                var curdate = new Date();
                var date = new Date(myJson.data.stop.stoptimesWithoutPatterns[i].serviceDay * 1000 + (timeSecs * 1000));
                var date_diff = date - curdate;
                var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
                var convertedTime = new Date(date - tzoffset).toISOString().substr(11, 5);
                if (date_diff < 1500000) {
                    var diffminutes = new Date(date_diff).getMinutes()
                    convertedTime = diffminutes.toString() + " min"
                    if (diffminutes == 0) {
                        convertedTime = "<1 min";
                    }
                }
                routeName.innerHTML = myJson.data.stop.stoptimesWithoutPatterns[i].headsign;
                time.innerHTML = convertedTime;
            }
            var oldtable = document.getElementById(direction);
            oldtable.parentNode.replaceChild(table, oldtable);
        });
}

function initializeData(ms = 15000) {
    // When ready...
    window.addEventListener("load", function() {
        // Set a timeout...
        setTimeout(function() {
            // Hide the address bar!
            window.scrollTo(0, 1);
        }, 0);
    });
    startTime();
    updateData();
    setInterval(function() {
        updateData()
    }, ms);
}

function updateData() {
    getBikes("256", "stationTitle1", "stationStatus1");
    getBikes("259", "stationTitle2", "stationStatus2");
    getBikes("267", "stationTitle3", "stationStatus3");
    getBuses(9);
    getMetro('"HSL:1431601"', 3, "metro_timetable_e");
    getMetro('"HSL:1431602"', 3, "metro_timetable_w");
}