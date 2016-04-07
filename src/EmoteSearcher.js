var searchForEmotes = function(tagsarr, gEmotes)
{
  var tags = [];
  for(var i = 0; i < tagsarr.length; i++)
  {
    tags.push(JSON.parse(tagsarr[i]));
  }
  
  // Loop all messages.
  try {
    for(var i = 0; i < tags.length; i++)
    {
      for(var j = 0; j < gEmotes.emoticons.length; j++) {
        var iterEmote = gEmotes.emoticons[j];
        if(tags[i].text.indexOf(iterEmote.regex) != -1)
        {
          if(iterEmote.images.length > 0)
          {
            postMessage([iterEmote.regex, iterEmote.images[0].url, tags[i].id]);
          }
        }
      }
    }
    postMessage("");
  } catch(e) {
    postMessage("");
  }
}

var decodeEmotes = function(byteArray)
{
  var view = new DataView(byteArray.buffer, 0, byteArray.buffer.byteLength);
  var string = new TextDecoder("utf-8").decode(view);
  return JSON.parse(string);
}

onmessage = function(e)
{
  searchForEmotes(e.data[0], decodeEmotes(e.data[1]));
}
