const refreshIn = 10

let engineStatus = false

/** @type {HTMLAudioElement | undefined} */
let backgroundSound

/** @type {HTMLCanvasElement | null} */
let canvas = document.querySelector('canvas')

/** @type {CanvasRenderingContext2D | undefined} */
let ctx

/** @type {HTMLSpanElement | null} */
const pointsIndicator = document.querySelector('.points-indicator')

/** @type {(number | undefined)[]} */
let playerColorTimer = [undefined, undefined]

let shoots = 0

let player = [
	{y: 0, points: 0, size: {w: 0, h: 20}, color: '#FFF'},
	{y: 0, points: 0, size: {w: 0, h: 20}, color: '#FFF'}
]

let activeKeys = [
	{
		up: false,
		down: false
	},
	{
		up: false,
		down: false
	}
]

const controls = [
	{
		up: 'w',
		down: 's'
	},
	{
		up: 'ArrowUp',
		down: 'ArrowDown'
	}
]

let ball = {
	accelerationX: 0,
	accelerationY: 0,
	x: 0,
	y: 0,
	size: 2
}

function start() {
	if (setupCanvas()) {
		setupSound()
		listenKeys()
		prepareEngine()
	}
}

start()

function setupSound() {
	backgroundSound = new Audio('../assets/sound/background-sound.mp3')
	backgroundSound.addEventListener('loadedmetadata', () => {
		backgroundSound.loop = true
		document.addEventListener('keydown', () => {
			backgroundSound.play()
		})
	})
}

/** @type {() => boolean} */
function setupCanvas() {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	if (!canvas) {
		console.error("HTML <canvas> not found")
		return false
	}

	ctx = canvas.getContext('2d')

	return true
}

function listenKeys() {
	document.addEventListener('keydown', event => {
		if (!engineStatus) {
			engineStatus = true
			startEngine()
		}
		switch(event.key) {
			case controls[0].up:
				activeKeys[0].up = true
				break
			case controls[0].down:
				activeKeys[0].down = true
				break
			case controls[1].up:
				activeKeys[0].up = true
				break
			case controls[1].down:
				activeKeys[0].down = true
				break
		}
	})

	document.addEventListener('keyup', event => {
		switch(event.key) {
			case controls[0].up:
				activeKeys[0].up = false
				break
			case controls[0].down:
				activeKeys[0].down = false
				break
			case controls[1].up:
				activeKeys[0].up = false
				break
			case controls[1].down:
				activeKeys[0].down = false
				break
		}
	})
}

function prepareEngine() {
	player[0].size.w = canvas.width / 80
	player[1].size.w = canvas.width / 80
	player[0].size.h = canvas.height / 100 * player[0].size.h
	player[1].size.h = canvas.height / 100 * player[1].size.h
	player[0].y = (canvas.height / 2) - (player[0].size.h / 2)
	player[1].y = (canvas.height / 2) - (player[1].size.h / 2)
	ball.size = canvas.width / 100 * ball.size
	ball.x = Math.round(canvas.width / 2) - ball.size / 2
	ball.y = Math.round(canvas.height / 2) - ball.size / 2
	draw(true)
}

function startEngine() {
	return new Promise((_, reject) => {
		const interval = setInterval(() => {
			if (!draw()) {
				clearInterval(interval)
				reject()
			}
		}, refreshIn)
	})
}

/** @type {(cancelBall?: boolean) => boolean} */
function draw(cancelBall) {
	ctx.beginPath()
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = '#FFF'
	if (!cancelBall) {
		setPlayerPosition(0)
		setBotPosition()
	}
	if (!drawPlayer(0) || !drawPlayer(1)) {
		return false
	}
	if (!cancelBall) drawBall()
	return true
}

/** @type {number | undefined} */
let timer = undefined

/** @type {() => boolean} */
function drawPlayer(index) {
	let x = player[index].size.w
	if (index === 1) {
		x = canvas.width - (player[index].size.w * 2)
	} else if (index > 1) {
		console.error('Invalid player (index: 2 | 3)')
		return false
	}

	ctx.fillStyle = player[index].color

	if (player[index].color !== '#FFF') {
		setTimeout(() => {
			player[index].color = '#FFF'
		}, 200)
	}

	ctx.fillRect(
		x,
		player[index].y,
		player[index].size.w,
		player[index].size.h
	)

	ctx.fill()

	ctx.fillStyle = '#FFF'

	return true
}

function setPlayerPosition(index) {
	if (activeKeys[index].up && player[index].y > 0) {
		player[index].y -= canvas.height / 80
	} else if (activeKeys[index].down && player[index].y + player[index].size.h < canvas.height) {
		player[index].y += canvas.height / 80
	}
}

function setBotPosition() {
	if (
		ball.x < canvas.width / (player[1].points < player[0].points ? 2 : 1.4)
		|| ball.accelerationX < 0
	) {
		return
	}

	if (player[1].y + player[1].size.h < ball.y + ball.size) {
		player[1].y += canvas.height / (player[1].points < player[0].points ? 80 : 100)
	} else if (player[1].y > ball.y) {
		player[1].y = player[1].y - (canvas.height / (player[1].points < player[0].points ? 80 : 100))
	}

	if (player[1].y < 0) {
		player[1].y = 0
	} else if (player[1].y > canvas.height - player[1].size.h) {
		player[1].y = canvas.height - player[1].size.h
	}
}

/** @type {() => boolean} */
function drawBall() {
	setBallPosition()

	ctx.fillStyle = shoots > 20 ? '#f44336'
		: shoots > 9 ? '#673ab7'
		: shoots > 5 ? '#fff176'
		: shoots > 1 ? '#80deea'
		: '#FFF'

	ctx.arc(ball.x + (ball.size / 2), ball.y + (ball.size / 2), ball.size / 2, 0, Math.PI * 2)

	ctx.fill()

	ctx.fillStyle = '#FFF'
}

function setBallPosition() {
	if (ball.accelerationX === 0) {
		ball.accelerationX = Math.random() > .5 ? canvas.width / 500 : -(canvas.width / 500)
	}

	if (ball.accelerationY === 0) {
		ball.accelerationY = Math.random() > .5 ? canvas.width / 500 : -(canvas.width / 500)
	}

	if (
		(ball.accelerationY > 0 && ball.y >= canvas.height - ball.size)
		|| (ball.accelerationY < 0 && ball.y <= 0)
	) {
		ball.accelerationY = -ball.accelerationY
	}

	if (
		(ball.accelerationX > 0 && ball.x >= canvas.width - ball.size)
		|| (ball.accelerationX < 0 && ball.x <= 0)
	) {
		ball.accelerationX = -ball.accelerationX
	} else if (
			(
			ball.accelerationX < 0
			&& ball.x <= player[0].size.w * 2
			&& player[0].y <= ball.y + ball.size
			&& player[0].y + player[0].size.h >= ball.y
		)
		|| (
			ball.accelerationX > 0
			&& ball.x >= canvas.width - (player[1].size.w * 2) - ball.size
			&& player[1].y <= ball.y + ball.size
			&& player[1].y + player[1].size.h >= ball.y
		)
	) {
		shoots++
		if (ball.accelerationX > 0) {
			player[1].color = '#F55'
			ball.x = canvas.width - (player[1].size.w * 2) - ball.size
			if (activeKeys[1].down && player[1].y + player[1].size.h < canvas.height) {
				ball.accelerationY = (ball.accelerationX / 2) * (Math.random() + 1)
				reproduceCollisionEffectSound()
			} else if (activeKeys[1].up && player[1].y > 0) {
				ball.accelerationY = -((ball.accelerationX / 2) * (Math.random() + 1))
				reproduceCollisionEffectSound()
			} else {
				reproduceCollisionSound()
			}
			if (shoots > 40) {
				ball.accelerationX = -(canvas.width / 75)
			} else if (shoots > 20) {
				ball.accelerationX = -(canvas.width / 90)
			} else if (shoots > 5) {
				ball.accelerationX = -(canvas.width / 150)
			} else if (shoots > 1) {
				ball.accelerationX = -(canvas.width / 220)
			}
		} else if (ball.accelerationX < 0) {
			player[0].color = '#55F'
			ball.x = player[0].size.w * 2
			if (activeKeys[0].down && player[0].y + player[0].size.h < canvas.height) {
				ball.accelerationY = -((ball.accelerationX / 2) * (Math.random() + 1))
				reproduceCollisionEffectSound()
			} else if (activeKeys[0].up && player[0].y > 0) {
				ball.accelerationY = (ball.accelerationX / 2) * (Math.random() + 1)
				reproduceCollisionEffectSound()
			} else {
				reproduceCollisionSound()
			}
			if (shoots > 40) {
				ball.accelerationX = canvas.width / 75
			} else if (shoots > 20) {
				ball.accelerationX = canvas.width / 90
			} else if (shoots > 5) {
				ball.accelerationX = canvas.width / 150
			} else if (shoots > 1) {
				ball.accelerationX = canvas.width / 220
			}
		}
	}
	
	if (ball.x <= 0) {
		player[1].points++
		shoots = 0
		ball.x = 0
		ball.accelerationX = canvas.width / 500
		ball.accelerationY = ball.accelerationY > 0 ? canvas.width / 500 : -(canvas.width / 500)
		reproducePointSound()
		document.querySelector('#player2-points').innerText = player[1].points
	} else if (ball.x >= canvas.width - ball.size) {
		ball.x = canvas.width - ball.size
		player[0].points++
		shoots = 0
		ball.accelerationX = -(canvas.width / 500)
		ball.accelerationY = ball.accelerationY > 0 ? canvas.width / 500 : -(canvas.width / 500)
		reproducePointSound()
		document.querySelector('#player1-points').innerText = player[0].points
	}

	ball.x += ball.accelerationX
	ball.y += ball.accelerationY
}

function reproducePointSound() {
	const pointSound = new Audio('../assets/sound/point-sound.mp3')
	pointSound.volume = .5
	pointSound.play()
	pointSound.addEventListener('ended', () => {
		delete pointSound
	})
}

function reproduceCollisionSound() {
	const collisionSound = new Audio('../assets/sound/collision-sound.mp3')
	collisionSound.volume = .5
	collisionSound.play()
	collisionSound.addEventListener('ended', () => {
		delete collisionSound
	})
}

function reproduceCollisionEffectSound() {
	const collisionEffectSound = new Audio('../assets/sound/collision-effect-sound.wav')
	collisionEffectSound.volume = .5
	collisionEffectSound.play()
	collisionEffectSound.addEventListener('ended', () => {
		delete collisionEffectSound
	})
}