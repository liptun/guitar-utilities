var begin = 0;
var end = 0;
var frets = 0;
var strings = 6;
var space = 0;
var fretWidth = 0;
var fretHeight = 250;
var stringSpace = 0;
var noteSize = 32;

var tuning = [28, 33, 38, 43, 47, 52];
tuning.reverse();
var drawList = [];

function drawFretboard() {
    $("#fretboard").empty();
    frets = end - begin + 1;
    windowWidth = $(window).innerWidth();
    $("#fretboard").css({ width: windowWidth - 60 + "px" });
    space = $("#fretboard").innerWidth();
    fretWidth = space / frets - 1;
    if (fretWidth < 50) {
        var newEnd = end;
        setRange([begin, --newEnd]);
        return false;
    }
    stringSpace = fretHeight / (strings - 1);
    for (var x = begin; x <= end; x++) {
        var underline = "";
        var extraClasses = x === 0 ? "open" : "fret";
        switch (x) {
            case 3:
            case 5:
            case 7:
            case 9:
            case 15:
            case 17:
            case 19:
            case 21:
                extraClasses += " dot";
                break;
            case 12:
            case 24:
                extraClasses += " ddot";
                underline = "underline";
                break;
        }

        var fretHTML = "";

        fretHTML += "<div class='fret' style='height:" + (fretHeight + stringSpace) + "px'>";
        fretHTML += "<div class='fret-bar " + extraClasses + "' style='width:" + fretWidth + "px;height:" + fretHeight + "px'>";
        for (y = 1; y <= strings; y++) {
            var tuningNote = tuning[y - 1 - (strings - tuning.length)];
            var noteName = notes[tuningNote + x][0][0];
            var key = notes[tuningNote + x][1];
            var noteOctave = notes[tuningNote + x][2];
            var pitch = tuningNote + x;
            var addData = "";
            addData += " data-note='" + noteName + "' ";
            addData += " data-string='" + y + "' ";
            addData += " data-fret='" + x + "' ";
            addData += " data-octave='" + noteOctave + "' ";
            addData += " data-key='" + key + "' ";
            addData += " data-pitch='" + pitch + "' ";

            var addStyle = "style='height:" + stringSpace + "px;margin-top:-" + stringSpace / 2 + "px'";
            fretHTML += "<div class='string' style='height:" + stringSpace + "px'>";
            fretHTML += "<div class='string-marker' " + addData + " id='note-" + x + "-" + y + "' " + addStyle + ">";
            var noteStyle = "";
            noteStyle += "top:" + (stringSpace / 2 - noteSize / 2) + "px;";
            noteStyle += "width:" + noteSize + "px;";
            noteStyle += "height:" + noteSize + "px;";
            noteStyle += "line-height:" + noteSize + "px;";
            fretHTML += "<div title='" + noteName + "" + noteOctave + "' class='string-note note-" + noteName + "' style='" + noteStyle + "'>";
            fretHTML += noteName;
            fretHTML += "</div>";
            fretHTML += "</div>";
            fretHTML += "</div>";
        }
        fretHTML += "</div>";
        fretHTML += "<div class='fret-marker " + underline + "'>";
        fretHTML += x;
        fretHTML += "</div>";
        fretHTML += "</div>";

        $("#fretboard").append(fretHTML);
    }
    $("#fretboard").append("<div class='clear'></div>");

    $(".string-marker").click(function () {
        var param = {};
        param.string = parseInt($(this).data("string"));
        param.fret = parseInt($(this).data("fret"));
        param.octave = parseInt($(this).data("octave"));
        param.pitch = parseInt($(this).data("pitch"));
        param.key = parseInt($(this).data("key"));
        param.note = $(this).data("note");

        fretboardClick(param);
    });

    $("#drawList").empty();
    for (var i = 0; i < drawList.length; i++) {
        var select = "#note-";
        select += drawList[i].fret;
        select += "-";
        select += drawList[i].string;
        $(select).children().addClass("show-note");
        $(select)
            .children()
            .addClass(drawList[i].color + "-note");
        $("#drawList").append(
            "<li class='list-group-item'>drawList[" +
                i +
                "] = {string:" +
                drawList[i].string +
                ",fret:" +
                drawList[i].fret +
                ",color:'" +
                drawList[i].color +
                "'}<button data-id='" +
                i +
                "' class='remove-btn pull-right btn btn-danger btn-xs'><i class='fa fa-times'></i></button></li>"
        );
    }

    $(".remove-btn").click(function () {
        removeDrawById($(this).data("id"));
        drawFretboard();
    });
}

var octave_sharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var octave_flat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
var notes = [];
for (oct = 0; oct <= 8; oct++) {
    for (note = 0; note < 12; note++) {
        var bufer = [[octave_flat[note], octave_sharp[note]], note, oct];
        notes.push(bufer);
    }
}

function fretboardClick(param) {
    //    console.log("fretboardClick");
    //    console.log("string:"+param.string);
    //    console.log("fret:"+param.fret);
    //    console.log("octave:"+param.octave);
    //    console.log("pitch:"+param.pitch);
    //    console.log("key:"+param.key);
    //    console.log("note:"+param.note);
    //    console.log("______________________");
    var color = $("#selectColor").attr("data-color");
    var mode = parseInt($("#selectMode").attr("data-mode"));
    switch (mode) {
        case 0:
            if (checkAvailability(param.fret, param.string)) {
                drawNote(param.fret, param.string, color);
            } else {
                removeDrawByCords(param.fret, param.string);
            }
            break;
        case 1:
            if (checkAvailability(param.fret, param.string)) {
                drawAllNotesByKey(param.key, color);
            } else {
                removeDrawByKey(param.key);
            }
            break;
        case 2:
            if (checkAvailability(param.fret, param.string)) {
                drawAllNotesByPitch(param.pitch, color);
            } else {
                removeDrawByPitch(param.pitch);
            }
            break;
    }
    drawFretboard();
}
function clearFretboard() {
    drawList = [];
    drawFretboard();
}
function removeDrawById(id) {
    drawList[id] = null;
    drawList.sort();
    drawList.pop();
}
function removeDrawByCords(x, y) {
    for (i = 0; i < drawList.length; i++) {
        if (drawList[i].string === y && drawList[i].fret === x) {
            removeDrawById(i);
            break;
        }
    }
}
function removeDrawByKey(key) {
    for (var y = 1; y <= strings; y++) {
        for (var x = -10; x <= 24; x++) {
            if (notes[tuning[y - 1 - (strings - tuning.length)] + x][1] === key) {
                removeDrawByCords(x, y);
            }
        }
    }
    drawFretboard();
}
function removeDrawByPitch(pitch) {
    for (var y = 1; y <= strings; y++) {
        for (var x = -10; x <= 24; x++) {
            if (tuning[y - 1 - (strings - tuning.length)] + x === pitch) {
                removeDrawByCords(x, y);
            }
        }
    }
    drawFretboard();
}
function checkAvailability(x, y) {
    var result = true;
    for (i = 0; i < drawList.length; i++) {
        if (drawList[i].string === y && drawList[i].fret === x) {
            result = false;
        }
    }
    return result;
}
function drawNote(x, y, color) {
    if (!checkAvailability(x, y)) {
        removeDrawByCords(x, y);
    }
    drawList.push({ string: y, fret: x, color: color });
    drawFretboard();
}
function drawNoteNoReload(x, y, color) {
    if (!checkAvailability(x, y)) {
        removeDrawByCords(x, y);
    }
    drawList.push({ string: y, fret: x, color: color });
}
function transposeString(string, value) {
    for (i = 0; i < drawList.length; i++) {
        if (drawList[i].string === string) {
            drawList[i].fret += value;
        }
    }
    drawFretboard();
}
function drawAllNotesByKey(key, color) {
    //    console.log(key);
    for (var y = strings - tuning.length; y < strings; y++) {
        for (var x = -10; x <= 24; x++) {
            var note = parseInt(tuning[y - (strings - tuning.length)] + x);
            if (notes[note][1] === key) {
                drawNoteNoReload(x, y + 1, color);
            }
        }
    }
    drawFretboard();
}
function drawAllNotesByPitch(pitch, color) {
    for (var y = strings - tuning.length; y <= strings; y++) {
        for (var x = -10; x <= 24; x++) {
            if (tuning[y - 1 - (strings - tuning.length)] + x === pitch) {
                drawNoteNoReload(x, y, color);
            }
        }
    }
    drawFretboard();
}
function drawScale(root, pattern) {
    var bufer = pattern.split("-");
    drawAllNotesByKey(parseInt(root), "red");
    for (var i = 0; i < bufer.length; i++) {
        if (isNaN(bufer[i])) {
            var c = bufer[i][bufer[i].length - 1];
            var color = "";
            switch (c) {
                case "b":
                    color = "blue";
                    break;
                case "k":
                    color = "black";
                    break;
                case "o":
                    color = "orange";
                    break;
                case "r":
                    color = "red";
                    break;
                case "g":
                    color = "green";
                    break;
                case "c":
                    color = "cyan";
                    break;
                case "p":
                    color = "purple";
                    break;
                case "p":
                    color = "purple";
                    break;
                case "x":
                    color = "deeppurple";
                    break;
            }
            drawAllNotesByKey(transpose(parseInt(root), parseInt(bufer[i])), color);
        } else {
            drawAllNotesByKey(transpose(parseInt(root), parseInt(bufer[i])), "green");
        }
    }
}
function setTuning() {
    $(".tuning").hide();
    for (var i = 1; i <= strings; i++) {
        $("#string-" + i + " button").html(notes[tuning[i - 1]][0][0] + "" + notes[tuning[i - 1]][2] + " <span class='caret'></span>");
    }
    for (var i = 6; i > tuning.length - strings; i--) {
        $("#string-" + i).show();
    }
    drawFretboard();
}
function changeStrings(newValue) {
    for (var i = 0; i < drawList.length; i++) {
        drawList[i].string -= strings - newValue;
    }
    strings = newValue;
}

function setRange(range) {
    var newBegin = Math.abs(parseInt(range[0]));
    var newEnd = Math.abs(parseInt(range[1]));
    if (newBegin >= newEnd) {
        newBegin = newEnd - 1;
    }
    if (newEnd <= newBegin) {
        newEnd = newBegin + 1;
    }
    // begin
    if (isNaN(newBegin) | (newBegin === "") | (newBegin >= 24) | (newBegin === -1)) {
        newBegin = 0;
    }
    // end
    if (isNaN(newEnd) | (newEnd === "") | (newEnd > 24) | (newEnd === 0)) {
        newEnd = end;
    }
    // set
    slider.noUiSlider.set([newBegin, newEnd]);
    begin = Math.abs(newBegin);
    end = Math.abs(newEnd);
    $("#rangeBegin").val(begin);
    $("#rangeEnd").val(end);
    drawFretboard();
}

var slider = document.getElementById("fretRangeSlider");
noUiSlider.create(slider, {
    start: [0, 16],
    step: 1,
    pips: {
        mode: "values",
        values: [0, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24],
        density: 4,
    },
    range: {
        min: [0],
        max: [24],
    },
    behaviour: "drag-tap",
    connect: true,
});
slider.noUiSlider.on("slide", function () {
    setRange(slider.noUiSlider.get());
});
$(".rangeEdit").keyup(function () {
    setRange([parseInt($("#rangeBegin").val()), parseInt($("#rangeEnd").val())]);
});

$("#fretRangeSlider noUi-handle-lower").attr("data-toggle", "tooltip").attr("data-placement", "bottom").attr("title", "Black");
//data-toggle="tooltip" data-placement="bottom" title="Black"

function transpose(startVal, addVal) {
    if (startVal + addVal < 12) {
        return startVal + addVal;
    } else {
        while (startVal + addVal >= 12) {
            addVal -= 12;
        }
        return startVal + addVal;
        //return transpose(startVal, addVal - 12);
    }
}

// instrument select

$("#instrumentSelect ul li a").click(function ($e) {
    changeStrings(parseInt($(this).attr("data-strings")));
    var instrument = $(this).html();
    $("#instrumentSelect").attr("data-strings", strings);
    $("#instrumentSelect button").html(instrument + " <span class='caret'></span>");
    setTuning();
    $e.preventDefault();
});

//tuning

$("#string-6 ul li a").click(function ($e) {
    var note = parseInt($(this).data("note"));
    transposeString(6 - (tuning.length - strings), tuning[5] - note);
    tuning[5] = note;
    $("#string-6").data("note", note);
    setTuning();
    $e.preventDefault();
});
$("#string-5 ul li a").click(function ($e) {
    var note = parseInt($(this).data("note"));
    transposeString(5 - (tuning.length - strings), tuning[4] - note);
    tuning[4] = note;
    $("#string-5").data("note", note);
    setTuning();
    $e.preventDefault();
});
$("#string-4 ul li a").click(function ($e) {
    var note = parseInt($(this).data("note"));
    transposeString(4 - (tuning.length - strings), tuning[3] - note);
    tuning[3] = note;
    $("#string-4").data("note", note);
    setTuning();
    $e.preventDefault();
});
$("#string-3 ul li a").click(function ($e) {
    var note = parseInt($(this).data("note"));
    transposeString(3 - (tuning.length - strings), tuning[2] - note);
    tuning[2] = note;
    $("#string-3").data("note", note);
    setTuning();
    $e.preventDefault();
});
$("#string-2 ul li a").click(function ($e) {
    var note = parseInt($(this).data("note"));
    transposeString(2 - (tuning.length - strings), tuning[1] - note);
    tuning[1] = note;
    $("#string-2").data("note", note);
    setTuning();
    $e.preventDefault();
});
$("#string-1 ul li a").click(function ($e) {
    var note = parseInt($(this).data("note"));
    transposeString(1 - (tuning.length - strings), tuning[0] - note);
    tuning[0] = note;
    $("#string-1").data("note", note);
    setTuning();
    $e.preventDefault();
});

$("#tuning-preset ul li a").click(function ($e) {
    var preset = $(this).attr("data-tuning");
    var tuningTitle = $(this).html();
    var bufer = preset.split("-");
    bufer.reverse();
    $("#tuning-preset button").html(tuningTitle + " <span class='caret'></span>");
    for (var i = 0; i < bufer.length; i++) {
        transposeString(i + 1 - +(tuning.length - strings), tuning[i] - parseInt(bufer[i]));
        tuning[i] = parseInt(bufer[i]);
    }
    setTuning();
    $e.preventDefault();
});

// scale tools

$("#scaleRoot ul li a").click(function ($e) {
    var key = $(this).attr("data-key");
    var note = $(this).html();
    $("#scaleRoot").attr("data-key", key);
    $("#scaleRoot button").html(note + " <span class='caret'></span>");
    $e.preventDefault();
});

$("#scalePatternPreset ul li a").click(function ($e) {
    var patt = $(this).attr("data-pattern");
    var pattTitle = $(this).html();
    $("#scalePattern").val(patt);
    $("#scalePatternPreset button").html(pattTitle + " <span class='caret'></span>");
    $e.preventDefault();
});

$("#scaleGen").click(function () {
    var root = $("#scaleRoot").attr("data-key");
    var pat = $("#scalePattern").val();
    if ($("#scaleClear").is(":checked")) {
        clearFretboard();
    }
    drawScale(root, pat);
    return false;
});

// select

$("#selectColor div").click(function ($e) {
    var color = $(this).attr("data-color");
    $("#selectColor div").removeClass("active");
    $(this).addClass("active");
    $("#selectColor").attr("data-color", color);
    $e.preventDefault();
});

$("#selectMode a").click(function ($e) {
    var mode = $(this).attr("data-mode");
    $("#selectMode a").removeClass("btn-primary");
    $(this).addClass("btn-primary");
    $("#selectMode").attr("data-mode", mode);
    $e.preventDefault();
});

setRange([0, 16]);

$("#removeAllDev").click(clearFretboard);
$("#removeAllBtn").click(clearFretboard);
$("#refreshBtn").click(drawFretboard);

$(window).resize(function () {
    drawFretboard();
});

drawFretboard();
$('[data-toggle="tooltip"]').tooltip();
