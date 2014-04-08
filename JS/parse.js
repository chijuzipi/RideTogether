Parse.initialize("b0jfwJsQkNWPdoKnDgd8KJLufCLWNJpmc5vBTkqr", "X90Jzs3gzKceNOdkFmCle8ZiwsE0HGhyNF4N3Wcj");
var arrow = '<i class="fa fa-chevron-down"></i>';


var query = new Parse.Query('Ride');
var driver;
query.ascending("Date");
query.find({
  success: function(results) {
    var q = $('#query');
    for (var i=0;i < results.length;i++){
      var time = results[i].get('Date');
      time = String(time);
      time = time.substr(0, 15);
      var DateTime = time + " " + results[i].get('TravelTime');
      console.log('DateTime is: ', DateTime);
      q.append('<div class="row" data-attribute="'+results[i].id+ '"><div class="expandable-panel-heading"><p>'+results[i].get('StartAddress')+"</p>"+'<p>'+results[i].get('Destination')+"</p>"+'<p>'+DateTime+"</p>"+arrow+'</div><div class="info"></div></div>');
    }

    $('.row').click( function(){
      console.log('here')
      var id = $(this).attr('data-attribute');
      var info = $(this).find('.info');
      console.log("ID IS: "+id)
      
      //if for some reason we end up with undefined variables
      if(!id || !info) {
        console.log("Error: could not set id or info variables.");
        return;
      }

      //check to see if it is empty,
      //if empty -> add data
      //if non empty and visible -> 'collapse' div. hide div
      //if non empty and hidden -> 'uncollapse' div and show it
      //saves us from refetching already fetched data
      if(info.is(':empty')) {
        //$(this).css('background-color', 'white');
        query.get(id, {
          success: function(object) {
            console.log('success');
            lookupDriver(object.get('DriverID'), info, object.get('OpenSeats'), object.get('StartAddress'), object.get('EndAddress'), object.get('Date'));
          },
          error: function(object, error) {
            console.log('error')
          }
        });
      }

      else if(info.is(':visible')) {
        info.hide();
        $(this).css('background-color', 'transparent');
      }

      else {
        info.show();
      }
    })
  },

  error: function(error) {
    console.log('error')
  }
});

//lookup the driver name
//uses a promise/callback method to wait for query to return
//if one result is return, then it calls insertInfo
function lookupDriver(driverID, info, openseats, sAdd, eAdd, date){
  var driverName;
  var driverQuery = new Parse.Query('Users');
  driverQuery.equalTo("objectId", driverID);

  driverQuery.find({
    success: function(results){
      console.log(results.length);
      console.log("Successfully looked up driver name: ", results[0].get('Name'), "with driverID: ", driverID);
      driverName = results[0].get('Name');
      console.log(driverName);
    },
    error: function(object, error){
      console.log('Error: Could not find objectID ', driverID, " in User database");
    }
  }).then(function(result) {
            console.log("The result of the callback is: ", result);
            if(result.length == 1)
            {
              insertInfo(info, result[0].get('Name'), result[0].get('Email'), openseats, sAdd, eAdd, date);
            }
            else
            {
              console.log("Error: Looking up driver ID did not return 1 result.");
              return;
            }
          });
}

//adds the chosen information into the appropriate div
//error checking should be 
function insertInfo(info, driver, email, seats, sAdd, eAdd, date){
  var message="Hi "+driver+",\nI'd like to join your ride from "+sAdd+" to "+eAdd+", on "+date+". Please let me know if it is still available. ";
  info.html('<p class="driverName">Driver: ' + driver +'</p><p class="seats">Open Seats: ' 
            +seats +'</p><a class="join-button" href="mailto:'+email+'?subject=I\'d like to join your ride!&body='+message+'">Join this ride</a>');
  return 0;
}