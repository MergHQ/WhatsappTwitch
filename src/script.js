var gEmotes = "";

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

var loadEmotes = function() {
  console.log("Loading emotes...");
  var url = "https://api.twitch.tv/kraken/chat/emoticons";
  gEmotes = JSON.parse(loadUrl(url));
  console.log("LOADED "+gEmotes.emoticons.length+" EMOTES!")
}

loadEmotes();

var searchForEmotes = function() {
  var tags = document.getElementsByClassName('emojitext selectable-text')

  // Loop all messages.

  //TODO: Make iteration faster. Iterating over 40000 emotes every second takes some time.
  for(var i = 0; i < tags.length; i++)
  {
    for(var j = 0; j < gEmotes.emoticons.length; j++) {
      var iterEmote = gEmotes.emoticons[j];
      if(tags[i].innerHTML.indexOf(iterEmote.regex) != -1)
      {
        if(iterEmote.images.length > 0)
        {
          var emote = '<img src="'+iterEmote.images[0].url+'">';
          tags[i].innerHTML = tags[i].innerHTML.replace(iterEmote.regex, emote);
        }
      }
    }
  }
}

setInterval(searchForEmotes, 1000);
