// config firebase
  var config = {
    apiKey: "AIzaSyB-_W_fbb-kLziQbc-fBwtSYOdOfb8pFpE",
    authDomain: "train-30be2.firebaseapp.com",
    databaseURL: "https://train-30be2.firebaseio.com",
    projectId: "train-30be2",
    storageBucket: "train-30be2.appspot.com",
    messagingSenderId: "434472645365"
  };
  firebase.initializeApp(config);
  var database = firebase.database();
  var trainDB = database.ref("/trains");


function buttonClick() {
    // submit button functionality
    $("button:submit").click(function (event) {
        event.preventDefault();
        // console.log("click");
        let trainName = $("#trainName").val().trim();
        let trainDest = $("#trainDest").val().trim();
        let startTime = $("#startTime").val().trim();
        let trainFreq = $("#trainFreq").val().trim();
        if (trainName && trainDest && startTime && trainFreq) {
            // console.log(trainName);
            $(".tF").val("");
            // push form info to database
            trainDB.push({
                dateAdded: firebase.database.ServerValue.TIMESTAMP,
                trainNameDB: trainName,
                trainDestDB: trainDest,
                startTimeDB: startTime,
                trainFreqDB: trainFreq
            });
        }else{
            // alert("Complete Form")
            $("#emptyForm").fadeIn(400).delay(1000).fadeOut(400);
        }

    })
    // clear button functionality
    $("button[type = 'clear']").click(function (event) {
        event.preventDefault();
        trainDB.set({});
        $(".trainTr").remove();
    });
    // delete button
    $("#train-data").on("click", "button[type = 'delete']", function(){
        let tK = $(this).parent().attr("trainKey");
        $(this).parent().remove();
        trainDB.child(tK).remove();


        // "tr[trainKey =" + childKey + "]>.times"
    })
};

// watches db for child added
function trainDBWatcher(){
    trainDB.on("child_added", function(newTD){
        updateTrainData(newTD)
        // console.log(newTD);
    })
}
// update table with train data
function updateTrainData(newTD){
    // let dateAdded = parseInt(newTD.val().dateAdded);
    let trainKey = newTD.key;
    let trainNameTD = $("<td>").text(newTD.val().trainNameDB)
    let trainDestTD = $("<td>").text(newTD.val().trainDestDB);
    let trainFreqTD = $("<td>").text(newTD.val().trainFreqDB);

    // let tbRow = $("<tr>").attr("date-data", dateAdded)
    let tbRow = $("<tr>").attr("trainKey", trainKey).addClass("trainTr");
    tbRow.append(trainNameTD, trainDestTD, trainFreqTD)
    tbRow.append(trainTil(newTD)).append('<button class="btn btn-danger btn-sm times deleteBtn" type="delete"><i class="far fa-trash-alt"></i></button>');
    $("table").prepend(tbRow);


}
// math for figuring min to arrival and time to next arrival
var trainTil = function(dataB){
    // let d = new Date();
    // let currentTime = moment();
    let startTime = dataB.val().startTimeDB;
    let startTimeConv = moment(startTime, "HH:mm").subtract(1, "years");
    // let x = startTime.split(":");
    // let y = (60*(parseInt(x[0]))) + parseInt(x[1]);
    let diff = moment().diff(moment(startTimeConv), "minutes")

    // let diff = currentTime - y;
    let trainFreq = (dataB.val().trainFreqDB);
    var tRemainder = diff % trainFreq;
    // var minTil = ( (Math.ceil(diff / trainFreq)) * trainFreq ) - diff
    var minTil = trainFreq - tRemainder;
    var timeNext = moment().add(minTil, "minutes").format("h:mm a");

    if(minTil == 1){
        timeNext = "Arriving";
    }

    let tD = $("<td>" + timeNext + "</td><td>" + minTil + "</td>")
    tD.addClass("times");
    return (tD);

}
// clock in jumbotron
function nowTime (){
    setInterval(function(){
        let time = moment().format("h:mm:ss a")
        $("#nowTime").text(time);
        let x = moment(time, "h:mm:ss").format("ss")
        // console.log("X: " + x);
        if (x == 00){
            timeRefresh();
            // console.log("Refresh");
        }
     }, 1000);
}

function timeRefresh(){
    trainDB.once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var childKey = childSnapshot.key;
            var childDateAdded = childSnapshot.val().dateAdded;
            let newTime = trainTil(childSnapshot)
            $("tr[trainKey =" + childKey + "]>.times").remove()
            $("tr[trainKey =" + childKey + "]").append(newTime).append('<button class="btn btn-danger btn-sm times deleteBtn" type="delete"><i class="far fa-trash-alt"></i></button>');
            // console.log(childKey)
            // console.log(childDateAdded)
        })
    }) 
}



$(document).ready(function(){
    buttonClick();
    trainDBWatcher();
    nowTime();


// end of doc ready
});
