// soundcloud
SC.initialize({
    client_id: '00d8302f2dd788ccb031dadc15b615d2'
});

/*var track_url = 'https://soundcloud.com/dubstep/dreams-by-no-limits';
SC.oEmbed(track_url, { auto_play: true }, function (oEmbed) {
    console.log('oEmbed response: ', oEmbed);

    document.getElementById('soundcloud').innerHTML = oEmbed.html;
});
SC.get('/tracks/115802927', {limit: 1}, function (track) {
    console.log(track);
}); */

var currentlyPlayingMusic;

function playGameMusic() {
    // https://soundcloud.com/dubstep/dreams-by-no-limits
    SC.stream("/tracks/115802927", function (sound) {
        if (!sound) {
            setTimeout(playGameMusic, 1000);
            return;
        }
        if (currentlyPlayingMusic) {
            currentlyPlayingMusic.stop();
        }
        currentlyPlayingMusic = sound;
        sound.play();
    });
}

function playGameOverMusic() {
    // https://soundcloud.com/golden-collision/game-over-free-download
    SC.stream("/tracks/101209381", function (sound) {
        if (!sound) {
            setTimeout(playGameMusic, 1000);
            return;
        }
        if (currentlyPlayingMusic) {
            currentlyPlayingMusic.stop();
        }
        currentlyPlayingMusic = sound;
        sound.play();
    });
}



// soundmanager2
var dingSound, dongSound;

soundManager.setup({

    // where to find the SWF files, if needed
    url: 'lib/soundmanager2/swf',

    // if you'd rather have 100% HTML5 mode (where supported)
    preferFlash: false,

    onready: function () {
        // SM2 has loaded, API ready to use e.g., createSound() etc.
        dingSound = soundManager.createSound({
            url: 'sfx/ding.mp3'
        });
        dongSound = soundManager.createSound({
            url: 'sfx/dong.mp3'
        });
    },

    ontimeout: function () {
        // Uh-oh. SWF missing, Flash blocked or other issue
    }

});
