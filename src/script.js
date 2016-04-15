var gEmotes = null;
var worker = null;
var workerTaskDone = true;
var gEmotesEncoded = null;

function loadUrl(url)
{
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", url, false);
  xmlhttp.send();

  if(xmlhttp.responseText == null)
    return null;
  else
    return xmlhttp.responseText;
}

function createEmoteWorker()
{
  worker = new Worker(chrome.runtime.getURL('src/EmoteSearcher.js'));
  encodeEmotes();
  worker.postMessage([0 ,gEmotesEncoded]);
}

// Encoding for cross-thread jobs.
function encodeEmotes()
{
  var obj = JSON.stringify(gEmotes);
  gEmotesEncoded = new TextEncoder(document.characterSet.toLowerCase()).encode(obj);
}

function loadBTTVemotes() {
  var bttvEmotes = JSON.parse(loadUrl("https://api.betterttv.net/2/emotes"));

  /*
    There doesn't seem to be a API for every bttv emote. Some emotes are only allowed
    on some channels. I'm requesting the emotes admiralbulldog has allowed to at least get some
    of them to work.
  */

  var bttvSpecialEmotes = JSON.parse(loadUrl("https://api.betterttv.net/2/channels/admiralbulldog"));
  var urlTemplate = "https://cdn.betterttv.net/emote/";

  for(var i = 0; i < bttvSpecialEmotes.emotes.length; i++) {
    bttvEmotes.emotes.push(bttvSpecialEmotes.emotes[i]);
  }

  for(var i = 0; i < bttvEmotes.emotes.length; i++) {
    var currEmote = bttvEmotes.emotes[i];
    var picUrl = urlTemplate + currEmote.id + "/1x";
    var obj = new Object;
    obj.regex = currEmote.code;
    var img = new Object;
    img.url = picUrl;
    obj.images = [];
    obj.images.push(img);
    gEmotes.emoticons.push(obj)
  }
}

function loadEmotes()
{
  console.log("Loading emotes...");
  var url = "https://api.twitch.tv/kraken/chat/emoticons";
  gEmotes = JSON.parse(loadUrl(url));
  console.log("LOADED "+gEmotes.emoticons.length+" EMOTES!")

  loadBTTVemotes();
  createEmoteWorker();
}

loadEmotes();

function createEmote(emoteW, imageURL, elemid)
{
  if(emoteW === "S" || emoteW === "R") // banned emotes
    return;

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

function updateWorker()
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

    worker.postMessage([1,o]);
  }
}

// Updating the worker.
setInterval(updateWorker, 1000);

worker.onmessage = function(e)
{
  workerTaskDone = true;
  createEmote(e.data[0], e.data[1], e.data[2]);
}
