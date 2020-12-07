'use strict';
if (!window.prog)             window.prog          = {};
if (!window.prog.audio)       window.prog.audio    = {};
if (!window.prog.elements)    window.prog.elements = {};
if (!window.prog.images)      window.prog.images   = {};
if (!window.prog.sounds)      window.prog.sounds   = {};
if (!window.prog.notes)       window.prog.notes    = {};

prog.audio.globalValue = 0.5;
prog.audio.sound_path = "audio/PIANO B2.wav";


prog.audio.onMIDISuccess = function(midiAccess) {
	prog.audio.audio_context;
	if (typeof AudioContext == "function") {
		prog.audio.audio_context = new AudioContext();
	} else if (typeof webkitAudioContext == "function") {
		prog.audio.audio_context = new webkitAudioContext();
	}
	// check if context is in suspended state (autoplay policy)
	if (prog.audio.audio_context.state === 'suspended') {
		prog.audio.audio_context.resume();
	}
    prog.audio.masterVolume =  prog.audio.audio_context.createGain();
    prog.audio.masterVolume.gain.value = 1;
	prog.audio.masterVolume.connect(prog.audio.audio_context.destination);
    //var masterVolume;
	prog.audio.oscillators = {};
    prog.audio.buffers = {};

	prog.audio.pannerOptions = { pan: 0 };
	prog.audio.panner = new StereoPannerNode(prog.audio.audio_context, prog.audio.pannerOptions);


	//prog.audio.source = prog.audio.audio_context.createMediaElementSource(prog.audio.sound);
	//prog.audio.source.connect(prog.audio.masterVolume).connect(prog.audio.panner).connect(prog.audio.audio_context.destination);


      prog.audio.source_buffer = prog.audio.audio_context.createBufferSource();
        var request = new XMLHttpRequest();
        request.open('GET', prog.audio.sound_path, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
          var audioData = request.response;

          prog.audio.audio_context.decodeAudioData(audioData, function(buffer) {
              var myBuffer = buffer;
              prog.audio.buffer = buffer;
              var ongLength = buffer.duration;
              prog.audio.source_buffer.buffer = myBuffer;
              prog.audio.source_buffer.playbackRate.value = 1;
              prog.audio.source_buffer.connect(prog.audio.audio_context.destination);
              prog.audio.source_buffer.loop = true;

             // loopstartControl.setAttribute('max', Math.floor(songLength));
             // loopendControl.setAttribute('max', Math.floor(songLength));
            },

            function(e){"Error with decoding audio data" + e.error});

        }
        request.send();

	//prog.audio.byteArray = Base64Binary.decodeArrayBuffer(prog.audio.sound);
	console.dir(prog.audio.source);
	
    console.log(midiAccess);

    var inputs = midiAccess.inputs;
    var outputs = midiAccess.outputs;
    // show all keyboards
    console.dir(Array.from(midiAccess.inputs.values()));

    midiAccess.onstatechange = function(e) {
		// Print information about the (dis)connected MIDI controller
        console.log(e.port.name, e.port.manufacturer, e.port.state);
    };
    prog.audio.playNote = function (frequency, data) {
        var source = prog.audio.buffers[frequency] = prog.audio.audio_context.createBufferSource();
        source.buffer = prog.audio.buffer;
        source.playbackRate.value = 2 ** ((data[1] - 60) / 12);
        //source.playbackRate.value = 1;
        prog.audio.masterVolume.gain.value = data[2]/100 * prog.audio.globalValue;
        if (prog.audio.masterVolume.gain.value < 0)
            prog.audio.masterVolume.gain.value = 0;
        console.log(prog.audio.masterVolume.gain.value);
        source.connect(prog.audio.masterVolume).connect(prog.audio.panner).connect(prog.audio.audio_context.destination);
        //prog.audio.masterVolume.gain.linearRampToValueAtTime(1.0, prog.audio.audio_context.currentTime - 2);
        prog.audio.masterVolume.gain.cancelScheduledValues(prog.audio.audio_context.currentTime);
        prog.audio.masterVolume.gain.setValueAtTime(0, prog.audio.audio_context.currentTime);
        prog.audio.masterVolume.gain.linearRampToValueAtTime(prog.audio.masterVolume.gain.value, prog.audio.audio_context.currentTime + 0.3);
        prog.audio.masterVolume.gain.linearRampToValueAtTime(0, prog.audio.audio_context.currentTime + 2 - 1);
        source.start(0);
    }
    prog.audio.stopNote = function (frequency) {
        prog.audio.buffers[frequency].stop(prog.audio.audio_context.currentTime);
        prog.audio.buffers[frequency].disconnect();
    }
    prog.audio.playNote_1 = function (frequency, data) {

    	prog.audio.masterVolume.gain.value = data[2]/100;
    	prog.audio.oscillators[frequency] = prog.audio.audio_context.createOscillator();
    	prog.audio.oscillators[frequency].frequency.value = frequency;

		// Set the volume to be 0.1 just before the end of the tone
		//prog.audio.masterVolume.gain.setValueAtTime(prog.audio.masterVolume.gain.value, prog.audio.audio_context.currentTime + 1);
		 
		// Make the volume ramp down to zero 0.1 seconds after the end of the tone
		//prog.audio.masterVolume.gain.linearRampToValueAtTime(0, 0.1 + 1);

    	//prog.audio.oscillators[frequency].connect(prog.audio.audio_context.destination);
    	prog.audio.oscillators[frequency].connect(prog.audio.masterVolume);
    	
    	//prog.audio.source.connect(prog.audio.audio_context.destination);

    	prog.audio.oscillators[frequency].start(prog.audio.audio_context.currentTime);

    	//prog.audio.sound.currentTime = 0;
    	//prog.audio.sound.play();
		
		//prog.audio.masterVolume.gain.value = data[2]/100;
    	//var osc = prog.audio.audio_context.createOscillator();
   		//osc.connect(prog.audio.masterVolume);
    	//prog.audio.masterVolume.connect(prog.audio.audio_context.destination);
    	//osc.start(prog.audio.audio_context.currentTime);
    	//osc.stop(prog.audio.audio_context.currentTime + 1);
	}
 
	prog.audio.stopNote_1 = function (frequency) {
    	prog.audio.oscillators[frequency].stop(prog.audio.audio_context.currentTime);
    	prog.audio.oscillators[frequency].disconnect();
    	//prog.audio.sound.pause();
	}
    prog.audio.playNote_2 = function (frequency, data) {
        //prog.audio.source.frequency.value = frequency;
        prog.audio.masterVolume.gain.value = data[2]/100;
        prog.audio.sound.currentTime = 0;
        prog.audio.sound.play();
    }
    prog.audio.stopNote_2 = function (frequency) {
        prog.audio.sound.pause();
    }
    prog.audio.midiNoteToFrequency = function (note) {
    	return Math.pow(2, ((note - 69) / 12)) * 440;
	}
    prog.audio.onMIDIMessage = function (e) {
    	console.log(e.data);
    	//console.dir(e);
    	var frequency = prog.audio.midiNoteToFrequency(e.data[1]);
    	if (e.data[0] === 144 && e.data[2] > 0) {
   			prog.audio.playNote(frequency, e.data);
		} else if (e.data[0] === 128 || e.data[2] === 0) {
    		prog.audio.stopNote(frequency);
		}
    }

  	prog.audio.inputs = midiAccess.inputs.values();
    for (var input = prog.audio.inputs.next(); input && !input.done; input = prog.audio.inputs.next()) {
    	// each time there is a midi message call the onMIDIMessage function
    	input.value.onmidimessage = prog.audio.onMIDIMessage;
	}
};

prog.audio.onMIDIFailure = function () {
    console.log('Could not access your MIDI devices.');
};
function getMIDIMessage(message) {
    var command = message.data[0];
    var note = message.data[1];
    var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

    switch (command) {
        case 144: // noteOn
            if (velocity > 0) {
                noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case 128: // noteOff
            noteOff(note);
            break;
        // we could easily expand this switch statement to cover other types of commands such as controllers or sysex
    }
};
prog.audio.connectMIDI = function () {   navigator.requestMIDIAccess().then(prog.audio.onMIDISuccess, prog.audio.onMIDIFailure);   };

//prog.audio.sound = new Audio();prog.audio.sound.crossOrigin = "anonymous";prog.audio.sound_oncanplaythrough = function() { prog.audio.sound.removeEventListener('canplaythrough', prog.audio.sound_oncanplaythrough); }





prog.newSound = document.getElementById('newSound');
prog.newSound.onchange = function (e) {
    return;
    //console.dir(arguments); return;
    if (!prog.newSound.files || prog.newSound.files.length < 1)
        return;
    prog.tools.preloader.add ({
        'target' : new FileReader(),
        'start' : function (wrap) { wrap.params.target.readAsDataURL(prog.newSound.files[0]); },
        //'start_func' : 'readAsDataURL',
        //'start_func_args' : [prog.newSound.files[0]],
        'callback' : function (wrap) {
            return;
            var data = wrap.params.target.result.split(',');
            prog.decodedSoundData = btoa(data[1]);                  // the actual conversion of data from binary to base64 format
            //console.log(prog.decodedSoundData);    
        }
    });
    //prog.tools.preloader.add ({'target': new Image(),'src': "images/notes_sheet_2_small.png",'callback': function (wrap) {document.body.appendChild(wrap.params.target);}});
    prog.tools.preloader.callback = function () {
        console.log('prog.newSound.onchange loaded');
    };
    prog.tools.preloader.start();
};



prog.createNotes = function () { //

    prog.notes.trebleClef = new prog.graphics.classes.Image(prog.images.notes, 0, 0, 36, 96, 0, 0, 36, 96);
    prog.notes.trebleClef.x_anchor = -18;
    prog.notes.trebleClef.y_anchor = -65;
    //prog.notes.container.children.push(prog.notes.trebleClef);

    prog.notes.bassClef = new prog.graphics.classes.Image(prog.images.notes, 37, 0, 36, 39, 0, 0, 36, 39);
    prog.notes.bassClef.x_anchor = 0;
    prog.notes.bassClef.y_anchor = 0;
    //prog.notes.container.children.push(prog.notes.bassClef);

    prog.notes.sharp = new prog.graphics.classes.Image(prog.images.notes, 37, 39, 20, 31, 0, 0, 20, 31);
    prog.notes.sharp.x_anchor = -10;
    prog.notes.sharp.y_anchor = -15;
    //prog.notes.container.children.push(prog.notes.sharp);

    prog.notes.flat = new prog.graphics.classes.Image(prog.images.notes, 37, 70, 18, 30, 0, 0, 18, 30);
    prog.notes.flat.x_anchor = -9;
    prog.notes.flat.y_anchor = -24;
    //prog.notes.container.children.push(prog.notes.flat);

    prog.notes.note_up = new prog.graphics.classes.Image(prog.images.notes, 73, 0, 17, 43, 0, 0, 17, 43);
    prog.notes.note_up.x_anchor = -10;
    prog.notes.note_up.y_anchor = -36;
    //prog.notes.container.children.push(prog.notes.note_up);

    prog.notes.note_down = new prog.graphics.classes.Image(prog.images.notes, 73, 43, 17, 43, 0, 0, 17, 43);
    prog.notes.note_down.x_anchor = -10;
    prog.notes.note_down.y_anchor = -7;
    //prog.notes.container.children.push(prog.notes.note_down);

    var strings = prog.notes.strings = {
        draw: function (ctx) {
            var i, l;
            ctx.fillStyle = "#000000";
            ctx.fillRect (20, 100, 6, 160);
            ctx.fillRect (ctx.canvas.width - 26, 100, 6, 160);
            i = 0, l = 10;
            while (i < l) {
                ctx.fillRect (20, (i < 5) ? (100 + i * 12) : (160 + i * 12), ctx.canvas.width - 40, 4);
                ++i;
            }
            i = 75, l = ctx.canvas.width - 40;
            while (i < l) {
                ctx.fillRect(i, 100, 2, 52);
                ctx.fillRect(i, 200, 2, 52);
                i += 105;
            }
            
        }
    };
    //prog.notes.container.children.push(prog.notes.strings);


};

/**
    type right  or  left  or  both
*/
prog.generateNotes = function (from, to) {
    if (!from || from < 1) { from = 1; };
    if (!to || to > 88) { to = 88; };
    if (to < from) { from = 1; to = 88; };
    var gap = to - from + 1;
    console.log ('from = '+ from +', to = '+to+", gap = "+gap);
    var i = 0;
    var l = Math.floor((prog.graphics.canvas.width - 40 - 100) / 30);
    prog.notes_marking = [];
    while (i < l) {
        prog.notes_marking.push(from + Math.floor(Math.random() * gap));
        ++i;
    }

    i = 0; l = 128;
    var hh = 0;
    gap = 5.5;
    prog.notes_pos = [];
    prog.notes_pos.length = l;
    while (i < l) {
        prog.notes_pos[i] = hh;
        ++i;
        if (i % 12 != 0 && i % 12 != 5) {
            hh += gap;
        }
    }
    //var notes;if (type == 'right') { notes = ['mi','fa','col','la','ci','do','re',   'mi','fa','col','la','ci','do','re','mi','fa','col','la',   'ci','do','re','mi','fa','col','la'];} else if (type == 'left') { notes = ['do','re','mi','fa','col','la','ci',   'do','re','mi','fa','col','la','ci','do','re','mi','fa',    'col','la','ci','do','re','mi','fa'];} else {var pos   = [];  var notes = ['do','re','mi','fa','col','la','ci',   'do','re','mi','fa','col','la','ci','do','re','mi','fa',    'col','la','ci','do','re','mi','fa',         'col','la','ci',   'do','re','mi','fa','col','la','ci','do','re','mi','fa',    'col','la','ci','do','re','mi','fa'];}

}


prog.initGraphics = function () {
    
    document.body.appendChild(prog.graphics.canvas);
    prog.notes.container = new prog.graphics.classes.Container();
    prog.createNotes();
    //var image = new prog.graphics.classes.Image(prog.images.notes, 0, 0, prog.images.notes.width, prog.images.notes.height, 0, 0, prog.images.notes.width, prog.images.notes.height);
    //container.children.push(image);
    prog.graphics.stage.children.push(prog.notes.container);

    if (!prog.notesCtx) {
        prog.notesCtx = document.createElement('canvas').getContext('2d');
        prog.notesCtx.canvas.width  = prog.graphics.canvas.width;
        prog.notesCtx.canvas.height = prog.graphics.canvas.height;
    }
    prog.notesCtx.clearRect(0, 0, prog.notesCtx.canvas.width, prog.notesCtx.canvas.height);
    prog.notesCtx.fillStyle = "#000000";
    prog.notes.strings.draw(prog.notesCtx);

    prog.notes.trebleClef.x = 50 + prog.notes.trebleClef.x_anchor;
    prog.notes.trebleClef.y = 135 + prog.notes.trebleClef.y_anchor;
    prog.notes.trebleClef.draw(prog.notesCtx);

    prog.notes.bassClef.x = 32 + prog.notes.bassClef.x_anchor;
    prog.notes.bassClef.y = 197 + prog.notes.bassClef.y_anchor;
    prog.notes.bassClef.draw(prog.notesCtx);
    //prog.notesCtx.drawImage(prog.notes.trebleClef.image, 0, 0, prog.notes.trebleClef.width_src, prog.notes.trebleClef.height_src, 60 + prog.notes.trebleClef.x_anchor, 125 + prog.notes.trebleClef.y_anchor, prog.notes.trebleClef.width_src, prog.notes.trebleClef.height_src, );
    // 77 - fa - begin from up to down 100px
    //var y_board = Math.floor(77 / 12); y_board = (77 - y_board) * 5.5 + 100;
    var y_board = prog.notes_pos[77] + 100;
    var xx = 100;
    var i = 0, l = prog.notes_marking.length;
    var b = prog.notes.note_up;
    while (i < l) {
        b.x = xx + b.x_anchor;
        //b.y = y_board - (prog.notes_marking[i] * 5.5) + b.y_anchor;
        b.y = y_board - prog.notes_pos[prog.notes_marking[i]] + b.y_anchor;
        b.draw(prog.notesCtx);
        xx += 30;
       ++i;
    }
    prog.notesImage = new prog.graphics.classes.Image(prog.notesCtx.canvas, 0, 0, prog.notesCtx.canvas.width, prog.notesCtx.canvas.height, 0, 0, prog.notesCtx.canvas.width, prog.notesCtx.canvas.height);
    prog.notes.container.children.push(prog.notesImage);
};

(function () {
    prog.audio.sound = new Audio();
    prog.audio.sound.crossOrigin = "anonymous";
    prog.tools.preloader.add ({'target': prog.audio.sound,'src': prog.audio.sound_path});
    prog.images.notes = new Image();
    prog.tools.preloader.add ({'target': prog.images.notes, 'src': "images/notes_sheet_2_small.png"});


    prog.tools.preloader.callback = function () {
        console.log('loaded');
        var start_prog = function (e) {
            window.document.removeEventListener('click', start_prog);
            prog.graphics.canvas.width = 1200;
            prog.graphics.canvas.height = 400;
            prog.generateNotes(60, 61);
            prog.initGraphics();
            prog.audio.connectMIDI();
            prog.mainLoop.start();
        };
        window.document.addEventListener('click', start_prog);
    };

    prog.tools.preloader.start();
})();