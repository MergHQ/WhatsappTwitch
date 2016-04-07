var gEmotes = null;
var worker = null;
var workerTaskDone = true;
var gEmotesEncoded = null;

var loadUrl = function(url)
{
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", url, false);
  xmlhttp.send();

  if(xmlhttp.responseText == null)
    return null;
  else
    return xmlhttp.responseText;
}

var createEmoteWorker = function()
{
  worker = new Worker(chrome.runtime.getURL('src/EmoteSearcher.js'));
}

// Encoding for cross-thread jobs.
var encodeEmotes = function()
{
  var obj = JSON.stringify(gEmotes);
  gEmotesEncoded = new TextEncoder(document.characterSet.toLowerCase()).encode(obj);
}

var loadEmotes = function()
{
  console.log("Loading emotes...");
  var url = "https://api.twitch.tv/kraken/chat/emoticons";
  gEmotes = JSON.parse(loadUrl(url));
  console.log("LOADED "+gEmotes.emoticons.length+" EMOTES!")
  createEmoteWorker();
  encodeEmotes();
}

loadEmotes();

var createEmote = function(emoteW, imageURL, elemid)
{
  var tags = document.getElementsByClassName('emojitext selectable-text');

  for(var i = 0; i < tags.length; i++)
  {
    if(tags[i].attributes != undefined &&
      tags[i].attributes.length == 3 &&
       tags[i].attributes[2].nodeValue === elemid)
    {
      var emote = '<img src="'+imageURL+'">';
      if(tags[i].innerHTML.indexOf(emoteW) != -1) // No changes needed if the emote is already loaded.
        tags[i].innerHTML = tags[i].innerHTML.replace(emoteW, emote);
    }
  }
}

var updateWorker = function()
{
  if(workerTaskDone)
  {
    workerTaskDone = false;
    var tags = document.getElementsByClassName('emojitext selectable-text');
    var o = [];
    for(var i = 0; i < tags.length; i++)
    {
      if(tags[i].attributes != undefined && tags[i].attributes.length == 3)
      {
        var obj = new Object();
        obj.text = tags[i].innerHTML;
        obj.id = tags[i].attributes[2].nodeValue;
        o.push(JSON.stringify(obj));
      }
    }

    worker.postMessage([o, gEmotesEncoded]);
  }
}

// Updating the worker.
setInterval(updateWorker, 1000);

worker.onmessage = function(e)
{
  workerTaskDone = true;
  createEmote(e.data[0], e.data[1], e.data[2]);
}
