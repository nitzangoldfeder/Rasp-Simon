const io = require('socket.io')();
const player = require('play-sound')();
const MPR121 = require('adafruit-mpr121'),
	mpr121  = new MPR121(0x5A, 1);

io.on('connection', client => {
	console.log('client has been connected');
	mpr121.on('touch', (pin) => {
		console.log(`pin ${pin} touched`)
		playSound(pin);
		client.emit('interaction', { press: pin });
	});
	mpr121.on('release', (pin) => console.log(`pin ${pin} released`));

	client.on('play', data => {
		console.log(`playing`, data);
		playSound(data.key);
	});
});


function playSound(pin) {
	player.play(`./media/${pin}.wav.mp3`, (err) => {
		if (err) {
			console.log(`Could not play sound: ${err}`);
		}
	});
}

io.listen(5000);

