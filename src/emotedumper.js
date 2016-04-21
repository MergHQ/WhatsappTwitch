/*
  Insanely messy code i used to dump all BTTV emotes.

  I think the BTTV backend hates me after this...
*/

const amount = 24060;
var str = [];

var iterations = Math.floor(amount/100);
var offset = 0;
while((amount - offset) > 100) {
  for(var i = 0; i < iterations; i++) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.betterttv.net/2/emotes/shared?direction=desc&limit=100&offset="+offset+"&sort_by=updated", false);
    xhr.setRequestHeader("BTTV-Token", "token");
    xhr.send();
    str.push(JSON.parse(xhr.response));
    offset += 100;
  }
}

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.betterttv.net/2/emotes/shared?direction=desc&limit=100&offset="+offset+"&sort_by=updated", false);
xhr.setRequestHeader("BTTV-Token", "token");
xhr.send();
str.push(JSON.parse(xhr.response));

var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

var cleanedStr = [];

for(var i = 0; i < str.length; i++)
{
  for(var j = 0; j < str[i].emotes.length; j++)
  {
    var obj = {
      id: str[i].emotes._id,
      code: str[i].emotes.code
    }

    cleanedStr.push(obj);
  }
}

saveData(cleanedStr, "emotedump.json");
