function getBikes(bike_id, titleTarget, statusTarget, colorTarget){
      fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{bikeRentalStation(id:"'+bike_id+'") { name bikesAvailable spacesAvailable}}'}),
      })
      .then(function(response) {
      return response.json();
      })
      .then(function(myJson) {
          var stationName = myJson.data.bikeRentalStation.name;
          var bikesAvailable = myJson.data.bikeRentalStation.bikesAvailable;
          var spacesAvailable = myJson.data.bikeRentalStation.spacesAvailable;
          var totalAvailable = bikesAvailable+spacesAvailable;
          var color = "";
          if(bikesAvailable<=Math.round(totalAvailable/3) && bikesAvailable > 0){
            color = "niceText orange"
          } else if(bikesAvailable>=Math.round(totalAvailable/3)){
              color = "niceText green"
          } else {
              color="niceText red"
          }
          document.getElementById(colorTarget).className = color;
          document.getElementById(titleTarget).innerHTML=stationName;
          document.getElementById(statusTarget).innerHTML=bikesAvailable+" / "+totalAvailable;
      });
  }
  
  function initializeData(ms=15000){
      updateData();
      setInterval(function(){
        updateData()
    }, ms);
  }

  function updateData(){
        getBikes("256", "stationTitle1", "stationStatus1", "bikeblock1");
        getBikes("259", "stationTitle2", "stationStatus2", "bikeblock2");
  }