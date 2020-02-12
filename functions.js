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
            var color = "";
            if (bikesAvailable <= Math.round(totalAvailable / 3) && bikesAvailable > 0) {
                color = "niceText orange"
            } else if (bikesAvailable > Math.round(totalAvailable / 3)) {
                color = "niceText green"
            } else {
                color = "niceText red"
            }
            var bikeAmnt = bikesAvailable + " / " + totalAvailable;
            if (bikesAvailable == 0 && totalAvailable == 0) {
                bikeAmnt = "X"
            }
            document.getElementById(colorTarget).className = color;
            document.getElementById(titleTarget).innerHTML = stationName;
            document.getElementById(statusTarget).innerHTML = bikeAmnt;
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

function getBuses() {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{  stop(id: "HSL:1431102") {    name      stoptimesWithoutPatterns {     scheduledDeparture  realtimeDeparture   headsign trip{route{shortName}}}  }}' }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
            var table = document.createElement("table");
            table.id = "timetable";
            for (i = 0; i < myJson.data.stop.stoptimesWithoutPatterns.length; i++) {
                var row = table.insertRow(i);
                var busNumber = row.insertCell(0);
                busNumber.className = "busNumber niceText";
                var routeName = row.insertCell(1);
                routeName.className = "routeName niceText";
                var time = row.insertCell(2);
                time.className = "time niceText";
                var date = new Date(null);
                var curdate = new Date();
                date.setSeconds(curdate.getSeconds() + parseInt(myJson.data.stop.stoptimesWithoutPatterns[i].realtimeDeparture)); // specify value for SECONDS here
                var date_diff = curdate - date;
                var diff_minutes = 60 - (Math.round(((date_diff % 86400000) % 3600000) / 60000)); // minutes
                var convertedTime = date.toISOString().substr(11, 5);
                if (diff_minutes < 25) {
                    convertedTime = diff_minutes + " min"
                }
                busNumber.innerHTML = myJson.data.stop.stoptimesWithoutPatterns[i].trip.route.shortName;
                routeName.innerHTML = myJson.data.stop.stoptimesWithoutPatterns[i].headsign;
                time.innerHTML = convertedTime;
            }
            var oldtable = document.getElementById("timetable");
            oldtable.parentNode.replaceChild(table, oldtable);
        });
}

function initializeData(ms = 15000) {
    startTime();
    updateData();
    setInterval(function() {
        updateData()
    }, ms);
}

function updateData() {
    getBikes("256", "stationTitle1", "stationStatus1", "bikeblock1");
    getBikes("259", "stationTitle2", "stationStatus2", "bikeblock2");
    getBuses();
}