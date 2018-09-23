'use strict';

class Vector {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	plus(obj) {
		// лучше снала проверить аргументы,
		// а потом писать основной код
		if(obj instanceof Vector) {
			let vector = new Vector(this.x + obj.x, this.y + obj.y);	
			return vector;
		// после return else не нужен
		} else {
			// лучше выбрасывать объект-ошибку, а не строку
			throw new 'Объект не является Vector';
		}
	}
	times(multiplier) {
		// если значение присваивается переменой 1 раз,
		// то лучше использовать const
		let vector = new Vector(this.x * multiplier, this.y * multiplier);
		return vector;
	}
}

class Actor {
	constructor(position = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)) {
		if (!(position instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
			// лучше объект
			throw new 'Аргумент не является Vector';
		}	
		this.pos = position;
		this.size = size;
		this.speed = speed;
	}
	get type() {
		return 'actor';
	}
	get left() {
		return this.pos.x;
	}
	get right() {
		return this.pos.x + this.size.x;
	}
	get top() {
		return this.pos.y;
	}
	get bottom() {
		return this.pos.y + this.size.y;
	}
	act() {};
	isIntersect(actor) {
		if (!(actor instanceof Actor) || actor === undefined) {
			// объект
			throw new 'Неверный аргумент';
		// после throw else не нужен
		} else if (actor === this) {
			return false;				
		// после return else не нужен
		} else {
			return this.left < actor.right && this.right > actor.left && this.bottom > actor.top && this.top < actor.bottom;
		}
	}
}

class Level {
	constructor(grid = [], actors = []) {
		// форматирование
	this.grid = grid;
	this.actors = actors;
	this.player = this.actors.find(actor => (actor.type === 'player'));
	this.status = null;
	this.finishDelay = 1;
	}
	// лучше присвоить 1 раз в конструкторе
	get height() {
		return this.grid.length;
	}
  // лучше присвоить 1 раз в конструкторе
	get width() {
		// найти максимальное значение в массиве можно проще
		return this.grid.length > 0 ? this.grid.find(item => (Math.max(item.length))).length : 0;
	}
	isFinished() {
		// тут не нужен if, можно просто return ...
		if (this.status !== null && this.finishDelay < 0) {
			return true;
		}
		return false;
	}
	actorAt(currentActor) {
		// первая половина проверки лишняя
		if (currentActor === undefined || !(currentActor instanceof Actor)) {
      // объект
			throw new 'Неверный аргумент';
		// else не нужен
		} else {
			return this.actors.find(actor => (actor.isIntersect(currentActor)));	
		}
	}
	obstacleAt(position, size) {
		if (!(position instanceof Vector) || !(size instanceof Vector)) {
			// объект
			throw new 'Аргумент не является vector'
		}
		// const
		let top = Math.floor(position.y);
		let bottom = Math.ceil(position.y + size.y);
		let left = Math.floor(position.x);
		let right =  Math.ceil(position.x + size.x);

		if (bottom > this.height) {
			return 'lava';
		// else не нужен
		} else if (left < 0 || right > this.width || top < 0) {
			return 'wall';
		// else не нужен
		} else {
			for (let y = top; y < bottom; y++) {
				for (let x = left; x < right; x++) {
					let cell = this.grid[y][x];
					if (cell) {
						return cell;
					}
				}
			}

		} 		

	}
	removeActor(actor) {
		// const
		// есть более простой способ найти объект в массиве
		// если объект не будет найдет, то метод отработат неправильно
		let index = this.actors.findIndex(el => el === actor);
		this.actors.splice(index, 1);
	}
	noMoreActors(type) {
		// тут лучше использовать другой метод для проверки наличия объекта в массиве
		// и if можно убрать
		if (this.actors.find(actor => actor.type === type)) {
			return false;
		}
		return true;
	}
	// некорректное значение по-умолчанию (оно тут не нужно)
	playerTouched(type, actor = undefined) {
		// можно обратить условие и уменьшить вложенность
		if (this.status === null) {
			if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
			} else {
				// вторая половина проверки лишняя
				if (type === 'coin' && actor !== undefined) {
				this.removeActor(actor);
				}
				if (this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}		
		}
	}
}

class LevelParser {
	constructor(dictionary = {}) {
		this.dictionary = dictionary;
	}
	actorFromSymbol(symbol) {
		// проверка лишняя
		if (symbol in this.dictionary) {
			return this.dictionary[symbol];
		}
	}
	obstacleFromSymbol(symbol) {
		if (symbol === 'x') {
			return 'wall';
		// else можно убрать
		} else if (symbol === '!') {
				return 'lava';
			// форматирование, лишняя ветка кода
			} else {
				return undefined;
			}
	}
	createGrid(array = []) {
		return array.map(element => element.split('').map(item => this.obstacleFromSymbol(item)));
	}
	createActors(symbols = []) {
		const result = [];
		const actors = symbols.map(el => el.split(''));
		actors.forEach((element, y) => element.forEach((item, x) => {
			const Constructor = this.actorFromSymbol(item);
			if (typeof Constructor === 'function') {
				const actor = new Constructor(new Vector(x,y));
				if (actor instanceof Actor) {
					result.push(actor);
				}
			}
		}));
		return  result;
	}
	parse(objects) {
		const grid = this.createGrid(objects);
		const actors = this.createActors(objects);
		return new Level (grid, actors);
	}
}

class Fireball extends Actor {
	constructor(position = new Vector(0,0), speed = new Vector(0,0)) {
		super(position, new Vector(1,1), speed);
	}
	get type() {
		return 'fireball';
	}

	getNextPosition(time = 1) {
		// тут нудно использовать методы класса Vector
		let x = this.pos.x + time * this.speed.x;
		let y = this.pos.y + time * this.speed.y;
		return new Vector(x, y);
	}
	handleObstacle() {
    // тут нудно использовать метод класса Vector
		this.speed.x *= -1;
		this.speed.y *= -1;
	}
	act(time, level) {
		let nextPosition = this.getNextPosition(time);
		if (level.obstacleAt(nextPosition, this.size)) {
			this.handleObstacle();
		} else {
			this.pos = nextPosition;
		}
	}
}
class HorizontalFireball extends Fireball {
	constructor(position) {
		super(position, new Vector(2,0));
	}
}
class VerticalFireball extends Fireball {
	constructor(position) {
		super(position, new Vector(0,2));
	}
}
class FireRain extends Fireball {
	constructor(position) {
		super(position, new Vector(0,3));
		this.startPos = position;
	}
	handleObstacle() {
		this.pos = this.startPos;
	}
}
class Coin extends Actor {
	constructor(position = new Vector(0,0)) {
		super(position.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), new Vector());
		this.initial = this.pos;
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.floor(Math.random() * 3) * Math.PI;	
	}
	get type() {
		return 'coin';
	}
	updateSpring(time = 1) {
		this.spring = this.spring + this.springSpeed * time;
	}
	getSpringVector() {
		// const
		let y = Math.sin(this.spring) * this.springDist;
		return new Vector(0, y);
	}
	getNextPosition(time = 1) {
		this.updateSpring(time);
		// const
		let springVector = this.getSpringVector();
		return this.initial.plus(springVector);
	}
	act(time) {
		this.pos = this.getNextPosition(time);
	}
}
class Player extends Actor {
	constructor(position = new Vector(0, 0)) {
		super(position.plus(new Vector(0, -0.5)),new Vector(0.8, 1.5), new Vector(0,0));
	}
	get type() {
		return 'player';
	}
}

//run Game
const schemas = [
  [
    '        o',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '    v  v       ',
    'o  =           ',
    'x               ',
    '      x        ',
    '              o',
    '@           xxxx',
    'x  o         ',
    '   xxxxxxxx x '
  ]
];

const actorDict = {
  '@': Player,
  '=': HorizontalFireball,
  'v': FireRain,
  '|': VerticalFireball,
  'o': Coin
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));