/* Build file available at http://s.contentplus.pl/static/build/cp.js */

'use strict';


var Cp = Cp || {};

Cp.global = this;

Cp.name = 'Cp';

Cp.noop = function() {
};

Cp.isNull = function(val) {
	return val === null || val === undefined;
};

Cp.isArray = function(val) {
	return Cp.typeOf(val) == 'array' || (Cp.typeOf(val) == 'object' && val.constructor.name == 'Array');
};

Cp.typeOf = function(value) {
	return typeof value;
};

Cp.isIterable = function(val) {
	var type = Cp.typeOf(val);
	return type == 'array' || (type == 'object' && typeof val.length == 'number');
};

Cp.isString = function(val) {
	return typeof val == 'string';
};

Cp.isBoolean = function(val) {
	return typeof val == 'boolean';
};

Cp.isNumber = function(val) {
	return typeof val == 'number';
};

Cp.isFunction = function(val) {
	return Cp.typeOf(val) == 'function';
};

Cp.isObject = function(val) {
	var type = typeof val;
	return type == 'object' && val != null || type == 'function';
};

Cp.isHashMap = function(val) {
	var type = typeof val;
	return type == 'object' && typeof val.constructor == 'function';
};

Cp.arrayRemove = function(array, value) {
	var index = array.indexOf(value);
	if (index > -1) {
		array.splice(index, 1);
	}
};

Cp.each = function(i, c) {
	if (!Cp.isFunction(c)) {
		throw new TypeError();
	}
	for ( var key in i) {
		if (i.hasOwnProperty(key)) {
			if (false === c(key, i[key])) {
				break;
			}
		}
	}
};

Cp.extend = function() {
	return jQuery.extend.apply(jQuery, arguments);
};

Cp.toArray = function(array) {
	return Array.prototype.slice.call(array, 0);
};

Cp.camelCase = function(string) {
	return string.replace(/[-_ ](.)/g, function(match, group1) {
		return group1.toUpperCase();
	});
};

Cp.initObject = function(self, defObject) {
	Cp.each(defObject || {}, function(i, v) {
		var f = this[Cp.camelCase('set_' + i)];
		if (Cp.isFunction(f)) {
			f.call(this, v);
		}
	}.bind(self));
};

Cp.escapeRegex = function(string) {
	return string.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
};

Cp.requestFrame = (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
	window.setTimeout(callback, 1000 / 60);
}).bind(window);

Cp.cancelFrame = (window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function(timeout) {
	window.clearTimeout(timeout);
}).bind(window);

Cp.debounce = function(callback) {
	if (!Cp.isFunction(callback)) {
		throw new TypeError();
	}
	var _timeout;
	return function() {
		Cp.cancelFrame(_timeout);
		_timeout = Cp.requestFrame(callback);
	}.bind(this);
};

Cp.inherits = function(derived, base) {
	derived.prototype = Object.create(base.prototype);
	derived.prototype.constructor = derived;
};

function CpEventManager() {
	this._events = {};
}

CpEventManager.prototype.on = function(eventName, callback) {
	if (!Cp.isFunction(callback)) {
		return this;
	}

	this._events[eventName] = this._events[eventName] || [];
	this._events[eventName].push(callback);
	return this;
};

CpEventManager.prototype.trigger = function(eventName, data) {
	Cp.each(this._events[eventName] || [], function(i, c) {
		c(data);
	});
	return this;
};

CpEventManager.prototype.off = function(eventName) {
	this._events[eventName] = [];
	return this;
};

/**
 * Logger class
 * 
 * @param ns
 *            String|Object
 * @param level
 *            Integer
 */
function CpLogger(ns, level) {
	this.fatal = this.error = this.warn = this.info = this.debug = this.trace = Cp.noop;

	ns = ns.name ? ns.name : ns;

	switch (level || this.constructor.OFF) {
	case this.constructor.TRACE:
		this.trace = console.log.bind(console, '[TRACE][', ns, ']');
	case this.constructor.DEBUG:
		this.debug = console.debug.bind(console, '[DEBUG][', ns, ']');
	case this.constructor.INFO:
		this.info = console.info.bind(console, '[INFO ][', ns, ']');
	case this.constructor.WARN:
		this.warn = console.warn.bind(console, '[WARN ][', ns, ']');
	case this.constructor.ERROR:
		this.error = console.error.bind(console, '[ERROR][', ns, ']');
	case this.constructor.FATAL:
		this.fatal = console.error.bind(console, '[FATAL][', ns, ']');
	case this.constructor.OFF:
	}
};

CpLogger.OFF = 0;
CpLogger.FATAL = 1;
CpLogger.ERROR = 2;
CpLogger.WARN = 4;
CpLogger.INFO = 8;
CpLogger.DEBUG = 16;
CpLogger.TRACE = 32;

CpLogger._loggerRules = [];
CpLogger._loggerInstances = {};

CpLogger.setLevel = function(pattern, level) {
	pattern = pattern.name ? pattern.name : pattern;

	if (Cp.isString(pattern)) {
		pattern = new RegExp('^' + Cp.escapeRegex(pattern) + '$');
	}

	if (!(pattern instanceof RegExp)) {
		throw new TypeError();
	}

	CpLogger._loggerRules.push({
		pattern : pattern,
		level : level
	});
};

CpLogger._getLoggingLevel = function(ns) {
	ns = ns.name ? ns.name : ns;
	if (!Cp.isString(ns)) {
		throw new TypeError();
	}

	var level = CpLogger.OFF;
	Cp.each(CpLogger._loggerRules, function(i, v) {
		if (v.pattern.exec(ns)) {
			level = v.level;
		}
	});
	return level;
};

/**
 * 
 * @param {String}|{Function}|{Object}
 */
CpLogger.create = function(ns) {
	var logger = new CpLogger(ns, CpLogger._getLoggingLevel(ns) || CpLogger.OFF);
	if (Cp.isFunction(ns) || Cp.isObject(ns)) {
		ns.logger = logger;
	}
	return logger;
};

// Init with default Logging level
CpLogger.setLevel(/.*/, CpLogger.ERROR);
CpLogger.setLevel(/^Cp.*/, CpLogger.TRACE);

CpLogger.create = function(ns) {
	var logger = new CpLogger(ns, CpLogger._getLoggingLevel(ns) || CpLogger.OFF);
	if (Cp.isFunction(ns) || Cp.isObject(ns)) {
		ns.logger = logger;
	}
	return logger;
};

// Init with default Logging level
CpLogger.setLevel(/.*/, CpLogger.DEBUG);


var CpString = CpString || {};

CpString.ucfirst = function(str) {
	str = Cp.isString(str) ? str : "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function CpExclusionMap(def) {
	this._byItem = [];
	this._parseDef('all', [ def ], null);
}

CpExclusionMap.prototype._parseDef = function(rule, def, parent) {
	var child = {
		parent : parent,
		siblings : [],
		rule : rule
	};

	Cp.each(def, function(i, v) {
		if (Cp.isObject(v)) {
			Cp.each(v, function(rule2, def2) {
				this._parseDef(rule2, def2, child);
			}.bind(this));
		}

		child.siblings.push(v);
		if (Cp.isString(v)) {
			this._byItem[v] = child;
		}
	}.bind(this));
};

CpExclusionMap.prototype.getConflicting = function(name) {
	var result = [];

	if (!this._byItem[name]) {
		return result;
	}

	var tmp = this._byItem[name], oldParent = null;

	while (null !== tmp) {
		if ('one' == tmp.rule) {
			this._pushRecursive(result, tmp.siblings, oldParent);
		}
		oldParent = tmp;
		tmp = tmp.parent;
	}

	var index = result.indexOf(name);
	if (index > -1) {
		result.splice(index, 1);
	}

	return result;
};

CpExclusionMap.prototype._pushRecursive = function(arr, v, exclude) {
	Cp.each(v, function(i, v2) {
		if (v == exclude) {
			return;
		}

		if (!Cp.isString(v2)) {
			this._pushRecursive(arr, v2, null);
		} else {
			arr.push(v2);
		}
	}.bind(this));
};

function CpModel(name) {
	this._name = name;
	this._sequences = {};
	this._sprites = {};

	this._mainElement = $('<div />').css({
		position : 'absolute',
	}).attr('data-name', name).addClass('animation-wrapper');

	this._scaleWrapper = $('<div />').css('width', '0px');
	this._mainElement.append(this._scaleWrapper);

	this._readyCount = 0;
	this._baseContainerSize = 0;

	this._parallelSequencesRules = {};
	this._activeSequences = {};

	this._evm = new CpEventManager();

	this._data = {};
}

CpLogger.create(CpModel);

CpModel.prototype.ready = function(callback) {
	if (this._readyCount <= 0) {
		callback();
	} else {
		this._evm.on('ready', callback);
	}
};

CpModel.prototype._notifyReady = function() {
	this._evm.trigger('ready').off('ready');

	var context = this;
	$(window).on('resize', function() {
		var e = $(context._mainElement);
		e.css('transform', '');
		var s = $(e).height() / context._baseContainerSize;
		context._scaleWrapper.css('transform', 'scale(' + s + ')');
	}).trigger('resize');
};

CpModel.prototype.appendTo = function(container) {
	$(container).append(this._mainElement);
};

CpModel.prototype.getMainElement = function() {
	return (this._mainElement);
};

CpModel.prototype.setData = function(name, val) {
	this._data[name] = val;
};

CpModel.prototype.getData = function(name) {
	return this._data[name];
};

CpModel.prototype.createSequence = function(name, template) {
	if (this._sequences[name]) {
		throw new Error('Sequence is already defined');
	}

	this._sequences[name] = {};

	this._sequences[name].timeline = new CpTimeline({
		debug : false,
		onComplete : function() {
			this.constructor.logger.debug('Model ' + this._name + ' event : complete-' + name);
			this._evm.trigger('complete-' + name).off('complete-' + name);
		}.bind(this)
	});

	this._sequences[name].creator = new CpSequenceCreator(this._sequences[name].timeline, this);

	if (template instanceof CpTemplate) {
		template.applyToObject(this._sequences[name].creator);
	}

	return this._sequences[name].creator;
};

CpModel.prototype.createSimpleSequence = function(name, sprite) {
	if (this._sequences[name]) {
		throw new Error('Sequence is already defined');
	}

	if (undefined == sprite) {
		sprite = name;
	}

	this._sequences[name] = {
		hide : Cp.noop,
		show : Cp.noop
	};

	this._sequences[name].timeline = new CpTimeline({
		onComplete : function() {
			this._evm.trigger('complete-' + name).off('complete-' + name);
		}.bind(this)
	});

	this._sequences[name].creator = new CpSequenceCreator(this._sequences[name].timeline, this);
	this._sequences[name].creator.useSprites(sprite).play(0);
	this._sequences[name].timeline.endless(true);
};

CpModel.prototype.playSequence = function(name, time) {
	if (!name) {
		Cp.each(this._activeSequences, function(name) {
			this.playSequence(name, time);
		}.bind(this));
		return;
	}

	var allowedSequences = this._parallelSequencesRules[name] || [];

	Cp.each(this._activeSequences, function(seqName, b) {
		var i = allowedSequences.indexOf(seqName);
		if (-1 !== i || seqName == name) {
			return;
		}

		this._sequences[seqName].timeline.stop();

		delete this._activeSequences[seqName];

		Cp.each(this._sequences[seqName].creator.getUsedSprites(), function(i, v) {
			v.sprite.hide();
		});

	}.bind(this));

	this.getMainElement().show();

	if (this._sequences[name]) {
		this.show();
		this._sequences[name].timeline.play(time);
		this._evm.trigger('play-' + name);
		this._activeSequences[name] = true;
	} else {
		this.constructor.logger.fatal('Sequence ' + name + ' does not exists');
	}
};

CpModel.prototype.stopSequence = function(name) {
	if (!name) {
		Cp.each(this._activeSequences, function(name) {
			this.stopSequence(name);
		}.bind(this));
		return;
	}

	if (this._sequences[name]) {
		this._sequences[name].timeline.stop();
		delete this._activeSequences[name];
		this._evm.trigger('complete-' + name).off('complete-' + name);
	} else {
		this.constructor.logger.fatal('Sequence ' + name + ' does not exists');
	}
};

CpModel.prototype.pause = function(name) {
	if (!name) {
		Cp.each(this._activeSequences, function(name) {
			this.pause(name);
		}.bind(this));
		return;
	}

	if (this._sequences[name]) {
		this._sequences[name].timeline.pause();
		this._evm.trigger('complete-' + name).off('complete-' + name);
	} else {
		this.constructor.logger.fatal('Sequence ' + name + ' does not exists');
	}
};

CpModel.prototype.isPlaying = function(name) {
	return true === this._activeSequences[name] && this._sequences[name].timeline.isActive();
};

CpModel.prototype.isActive = function(name) {
	return true === this._activeSequences[name];
};

CpModel.prototype.onPlay = function(name, callback) {
	if (Cp.isArray(name)) {
		Cp.each(name, function(i, v) {
			this.onPlay(v, callback);
		}.bind(this));
	} else {
		this._evm.on('play-' + name, callback);
	}
};

CpModel.prototype.show = function(callback) {
	this._mainElement.css('opacity', 1);
};

CpModel.prototype.hide = function(callback) {
	Cp.each(this._activeSequences, function(seqName, b) {
		Cp.each(this._sequences[seqName].creator.getUsedSprites(), function(i, v) {
			v.sprite.hide();
		});
	}.bind(this));

	this.stopSequence();
	this._mainElement.css('opacity', 0);
};

CpModel.prototype.completeSequence = function(name, complete) {
	if (!this._sequences[name] || !this._sequences[name].timeline.isActive()) {
		this.constructor.logger.debug('Model ' + this._name + ' sequence ' + name + ' is already complete');
		(complete || Cp.noop)();
		return this;
	}

	this.constructor.logger.debug('Model ' + this._name + ' waiting for complete-' + name);
	this._evm.off('complete-' + name).on('complete-' + name, complete);
};

CpModel.prototype.setPosition = function(pos) {
	this._mainElement.css('left', Cp.isNumber(pos) ? pos + '%' : pos);
	return this;
};

CpModel.prototype.addSprites = function(array) {
	Cp.each(array, function(i, v) {
		this.addSprite(i, v);
	}.bind(this));
	return this;
};

CpModel.prototype.addSprite = function(name, def) {
	if (!(def instanceof CpTilesetDefinition)) {
		def = new CpTilesetDefinition(def);
	}

	this._sprites[name] = new CpSprite(def);
	this._sprites[name].appendTo(this._scaleWrapper);
	++this._readyCount;

	def.ready(function() {
		this._baseContainerSize = Math.max(this._baseContainerSize, def.getImageSize()[1] / def.getRowCount());
		this._scaleWrapper.css('height', this._baseContainerSize);

		--this._readyCount;
		this._notifyReady();
	}.bind(this));
};

CpModel.prototype.getSprite = function(name) {
	return this._sprites[name];
};

CpModel.prototype.allowParallelSequences = function(map1, map2) {
	if (!Cp.isArray(map1))
		map1 = [ map1 ];
	if (!Cp.isArray(map2))
		map2 = [ map2 ];

	Cp.each(map1, function(i, v) {
		this._parallelSequencesRules[v] = this._parallelSequencesRules[v] || [];
		this._parallelSequencesRules[v] = this._parallelSequencesRules[v].concat(map2);
	}.bind(this));

	Cp.each(map2, function(i, v) {
		this._parallelSequencesRules[v] = this._parallelSequencesRules[v] || [];
		this._parallelSequencesRules[v] = this._parallelSequencesRules[v].concat(map1);
	}.bind(this));
};

CpModel.prototype.setSpriteExclusionMap = function(def) {
	this._spriteExclusionMap = new CpExclusionMap(def);
};

CpModel.prototype.getSpriteExclusionMap = function(def) {
	return this._spriteExclusionMap;
};

function CpSequenceCreator(timeline, model) {
	this._timeline = timeline;
	this._spriteList = [];
	this._reversedSpriteList = {};
	this._model = model;
}

CpLogger.create(CpSequenceCreator);

CpSequenceCreator.prototype.timeline = function(callback) {
	callback.call(this, this._timeline, this._spriteList);
	return this;
};

CpSequenceCreator.prototype.useSprites = function() {
	Cp.each(arguments, function(i, v) {
		if (Cp.isArray(v)) {
			this.useSprites.apply(this, v);
		} else {
			var s = this._model.getSprite(v);
			if (!s) {
				this.constructor.logger.fatal('Sprite ', v, ' does not exists');
				return;
			}

			// this._spriteList.push(s);
			this._spriteList.push({
				name : v,
				sprite : s
			});

			this._reversedSpriteList[v] = s;
		}
	}.bind(this));
	return this;
};

CpSequenceCreator.prototype.getUsedSprites = function() {
	return this._spriteList;
};

CpSequenceCreator.prototype.call = function(callback) {
	this._timeline.call(callback, [ this._timeline ]);
	return this;
};

CpSequenceCreator.prototype.css = function(spriteIndx, cssObj) {
	this._timeline.set(this._spriteList[spriteIndx].sprite._mainElement, cssObj);
	return this;
};

CpSequenceCreator.prototype.delay = function(delay) {
	this._timeline.add(new CpTweenDelay(delay));
	return this;
};

CpSequenceCreator.prototype.hide = function(index) {
	this.css(index, {
		opacity : 0
	});
	return this;
};

CpSequenceCreator.prototype.show = function(index) {
	this.css(index, {
		opacity : 1
	});
	return this;
};

CpSequenceCreator.prototype.cssWhilePlay = function(spriteIndx, cssObj, position) {
	this._timeline.to(this._spriteList[spriteIndx].sprite._mainElement, this._spriteList[spriteIndx].sprite._timeline.duration(), cssObj, 'sprite-begin-' + spriteIndx);
	return this;
};

CpSequenceCreator.prototype.addLabel = function(label) {
	this._timeline.addLabel(label);
	return this;
};

CpSequenceCreator.prototype.jump = function(position) {
	this._timeline.call(function() {
		this._timeline.play(position);
	}.bind(this));

	return this;
};

CpSequenceCreator.prototype.play = function(spriteIndx) {
	if (!this._spriteList[spriteIndx]) {
		throw new Error('Sprite ' + spriteIndx + ' is not defined');
	}

	var exclusionMap = this._model.getSpriteExclusionMap();
	if (exclusionMap) {
		Cp.each(exclusionMap.getConflicting(this._spriteList[spriteIndx].name), function(i, v) {
			if (this._reversedSpriteList[v]) {
				this._timeline.set(this._reversedSpriteList[v]._mainElement, {
					opacity : 0
				});
			}
		}.bind(this));
	}

	this._timeline.addLabel('sprite-begin-' + spriteIndx).set(this._spriteList[spriteIndx].sprite._mainElement, {
		opacity : 1
	}).add(this._spriteList[spriteIndx].sprite);
	return this;
};

CpSequenceCreator.prototype.loop = function(spriteIndx) {
	if (0 === this._timeline.duration()) {
		throw new Error('Zero duration timeline loop');
	}

	this._timeline.loop(0);

	// do not return anything
	return;
};





function CpSequenceTemplate() {
	return new CpTemplate(CpSequenceCreator);
}


function CpSprite(tilesetDef) {
	if (!(tilesetDef instanceof CpTilesetDefinition)) {
		throw new TypeError();
	}
	this._tilesetDef = tilesetDef;
	this._initElement();
	this._timeline = this._createTimeline();
};

CpLogger.create(CpSprite);

CpSprite.prototype.duration = function() {
	return this._timeline.duration();
};

CpSprite.prototype.appendTo = function(container) {
	this.constructor.logger.trace('Apending animation ', this, ' to ', container);
	$(container).append(this._mainElement);
};

CpSprite.prototype._initElement = function() {
	var e = this._mainElement = $('<div />'), d = this._tilesetDef;
	var offset = d.getTileOffset(d.getFirstFrame());
	var staticOffset = d.getStaticOffset();

	e.css({
		'background-image' : 'url(' + d.getPath() + ')',
		'background-position' : offset.x + ' ' + offset.y,
		'background-size' : d.getColumnCount() + '00% ' + d.getRowCount() + '00%',
		'transform' : 'translateX(-50%) translate(' + staticOffset.x + ',' + staticOffset.y + ')',
		'opacity' : '0',
		'position' : 'absolute',
		'left' : '0',
		'top' : '0',
	});

	this._tilesetDef.ready(function() {
		var size = this._tilesetDef.getImageSize();

		var h = size[1] / d.getRowCount();
		var w = size[0] / d.getColumnCount();

		var scale = this._tilesetDef.getHeight() / h;

		e.css({
			width : w * scale,
			height : this._tilesetDef.getHeight()
		});
	}.bind(this));
};

CpSprite.prototype.css = function(arg1, arg2) {
	this._mainElement.css(arg1, arg2);
};

CpSprite.prototype.show = function() {
	this._mainElement.css('opacity', 1);
};

CpSprite.prototype.hide = function() {
	this._mainElement.css('opacity', 0);
};

CpSprite.prototype.isVisible = function() {
	return this._mainElement.css('opacity') == 1;
};

CpSprite.prototype.gotoFrame = function(i) {
	var e = this._mainElement, d = this._tilesetDef;
	var offset = d.getTileOffset(d.getFirstFrame() + i);
	e.css({
		'background-position' : offset.x + ' ' + offset.y,
	});
};

CpSprite.prototype._createTimeline = function() {
	var timeline = new CpTimeline();

	var context = this;

	var frameRate = this._tilesetDef.getFrameRate();
	var frames = this._tilesetDef.getFrameCount();

	if (frames == 1) {
		timeline.call(function() {
			context.gotoFrame(0);
		});
		return timeline;
	}

	for (var j = 0; j < this._tilesetDef.getRepeat(); ++j) {
		for (var i = 0; i < frames; ++i) {
			timeline.call(function(f) {
				context.gotoFrame(f);
			}, [ i ]);
			timeline.add(new CpTweenDelay(1 / frameRate));
		}
	}

	return timeline;
};

CpSprite.prototype.play = function(time, done) {
	this.gotoFrame(0);
	this._timeline.play(time);
};

CpSprite.prototype.stop = function() {
	this._timeline.stop();
};

CpSprite.prototype.pause = function() {
	this._timeline.pause();
};

CpSprite.prototype.playBackwards = function(time, done) {
	this._timeline.reverse(this._timeline.duration());
};

function CpTemplate(constructor) {
	this._storedCallback = [];

	var context = this;
	Cp.each(constructor.prototype, function(i, v) {
		this[i] = function() {
			context._storedCallback.push({
				callback : v,
				arguments : arguments
			});
			return context;
		};
	}.bind(this));
}

CpTemplate.prototype.applyToObject = function(obj) {
	Cp.each(this._storedCallback, function(i, v) {
		v.callback.apply(obj, v.arguments);
	});
};

function CpTicker() {
	this._tickerPlayCounter = 0;
	this._animFrame = {};
}

CpLogger.create(CpTicker);

CpTicker._lagThreshold = 200;

CpTicker.DEBUG_COUNTER = 0;

CpTicker.prototype.play = function(base, callback) {
	if (!Cp.isFunction(callback)) {
		throw new TypeError();
	}

	this.stop();

	++CpTicker.DEBUG_COUNTER;

	var time = performance.now() * (this.constructor.SPEED_UP || 1);
	this._animFrame[++this._tickerPlayCounter] = true;

	if (base < 0) {
		throw new Error('Base is less than zero');
	}

	this._tick(callback, this._tickerPlayCounter, time - (base * 1000 || 0), time, time);
	return this;
};

CpTicker.prototype.stop = function() {
	Cp.each(this._animFrame, function(i, v) {
		if (--CpTicker.DEBUG_COUNTER < 0) {
			throw new Error('Ticker killed too many times?');
		}

		Cp.cancelFrame(v);
		delete this._animFrame[i];
	}.bind(this));

	return this;
};

CpTicker.prototype.isTicking = function() {
	return Object.keys(this._animFrame).length > 0;
};

CpTicker.SPEED_UP = 1;

CpTicker.prototype._tick = function(callback, playCounter, base, lastTime, time) {
	var time = performance.now() * (this.constructor.SPEED_UP || 1);

	var elapsed = time - lastTime;

	if (elapsed < 0) {
		throw new Error('Negative tick time');
	}

	if (elapsed > this.constructor._lagThreshold) {
		base += elapsed - this.constructor._lagThreshold;
	}

	callback((time - base) / 1000, playCounter);

	if (this._animFrame[playCounter]) {
		this._animFrame[playCounter] = Cp.cancelFrame(this._tick.bind(this, callback, playCounter, base, time));
	}
};

function CpTilesetDefinition(defObject) {
	this._cols = 1;
	this._rows = 1;

	Cp.initObject(this, Cp.extend(true, {}, this.constructor.DEFAULTS, defObject));
	this._evm = new CpEventManager();
}

CpTilesetDefinition.setBasepath = function(basepath) {
	this._basepath = basepath;
};

CpTilesetDefinition.prototype.setPath = function(path) {
	this._path = path;

	this._image = new Image();
	this._image.src = this.getPath();
	this._image.onload = this._notifyReady.bind(this);
	this._image.onerror = this._notifyReady.bind(this);
};

CpTilesetDefinition.prototype.getPath = function() {
	return this.constructor._basepath + this._path;
};

CpTilesetDefinition.prototype.ready = function(callback) {
	if (this._ready) {
		callback();
	} else {
		this._evm.on('ready', callback);
	}
};

CpTilesetDefinition.prototype._notifyReady = function() {
	this._evm.trigger('ready').off('ready');
};

CpTilesetDefinition.prototype.getImageSize = function() {
	if (!this._image || !this._image.complete) {
		return null;
	}

	return [ this._image.width, this._image.height ];
};

CpTilesetDefinition.prototype.setRepeat = function(repeat) {
	this.repeat = repeat;
};

CpTilesetDefinition.prototype.setFirstFrame = function(firstFrame) {
	this.firstFrame = firstFrame;
};

CpTilesetDefinition.prototype.getFirstFrame = function() {
	return this.firstFrame || 0;
};

CpTilesetDefinition.prototype.getRepeat = function() {
	return this.repeat;
};

CpTilesetDefinition.prototype.setFrameRate = function(frameRate) {
	this._frameRate = frameRate;
};

CpTilesetDefinition.prototype.getFrameRate = function() {
	return this._frameRate;
};

CpTilesetDefinition.prototype.setFrameCount = function(frameCount) {
	this._frameCount = frameCount;
};

CpTilesetDefinition.prototype.getFrameCount = function() {
	return this._frameCount || this._cols * this._rows;
};

CpTilesetDefinition.prototype.setHeight = function(height) {
	this._height = height;
};

CpTilesetDefinition.prototype.getHeight = function() {
	return this._height;
};

CpTilesetDefinition.prototype.setStaticOffsetX = function(staticOffsetX) {
	this._staticOffsetX = staticOffsetX;
};

CpTilesetDefinition.prototype.setStaticOffsetY = function(staticOffsetY) {
	this._staticOffsetY = staticOffsetY;
};

CpTilesetDefinition.prototype.getStaticOffset = function() {
	return {
		x : Cp.isNumber(this._staticOffsetX) ? this._staticOffsetX + 'px' : this._staticOffsetX || 0,
		y : Cp.isNumber(this._staticOffsetY) ? this._staticOffsetY + 'px' : this._staticOffsetY || 0
	};
};

CpTilesetDefinition.prototype.setTilesCount = function(cols, rows) {
	if (Cp.isArray(cols)) {
		rows = cols[1];
		cols = cols[0];
	}

	this._cols = cols;
	this._rows = rows;
};

CpTilesetDefinition.prototype.getColumnCount = function() {
	return this._cols;
};

CpTilesetDefinition.prototype.getRowCount = function() {
	return this._rows;
};

CpTilesetDefinition.prototype.getTileOffset = function(index) {
	index = parseInt(index);

	var v = this._cols > 1 ? 100 * (index % this._cols) / (this._cols - 1) : 0;
	var h = this._rows > 1 ? 100 * Math.floor(index / this._cols) / (this._rows - 1) : 0;

	return {
		x : v + '%',
		y : h + '%'
	};
};

function CpTimeline(options) {
	this._ticker = new CpTicker();
	this._duration = 0;
	this._labels = {};
	this._timeline = {};
	this._playTime = 0;

	options = options || {};

	this._onComplete = options.onComplete || Cp.noop;
	this._debug = options.debug;
};

CpLogger.create(CpTimeline);

CpTimeline.prototype._tickHandler = function(time, debugID) {
	if (this._debug) {
		this.constructor.logger.error('Play time : ', this._playTime);
	}

	var oldTime = this._playTime;
	this._playTime = time;

	Cp.each(this._timeline, function(i, v) {
		i = parseFloat(i);
		if ((i > oldTime && i < time) || i == oldTime) {
			Cp.each(v, function(i2, v2) {
				v2.play(Math.max(time - i, 0));
			}.bind(this));
		}
	}.bind(this));

	// Compare current _playTime should increase
	if (this._playTime >= this._duration) {
		this._ticker.stop();
		this._onComplete();
	}
};

CpTimeline.prototype.play = function(position) {
	if (Cp.isString(position)) {
		if (undefined == this._labels[position]) {
			throw new Error('Label ' + position + ' is not defined');
		}
		position = this._labels[position];
	}

	this._ticker.stop();

	if (Cp.isNull(position)) {
		position = this._playTime;
	}

	this._playTime = position || 0;

	this._ticker.play(position || 0, this._tickHandler.bind(this));
	return this;
};

CpTimeline.prototype.isActive = function() {
	return this._ticker.isTicking() || this._endless;
};

CpTimeline.prototype.endless = function(endless) {
	this._endless = endless;
};

CpTimeline.prototype.restart = function() {
	return this.play(0);
};

CpTimeline.prototype.stop = function(position) {
	this._ticker.stop();
	Cp.each(this._timeline, function(i, v) {
		Cp.each(v, function(i2, v2) {
			v2.stop();
		});
	}.bind(this));
	this._playTime = 0;
	return this;
};

CpTimeline.prototype.pause = function(position) {
	Cp.each(this._timeline, function(i, v) {
		Cp.each(v, function(i2, v2) {
			v2.pause();
		});
	}.bind(this));
	this._ticker.stop();
	return this;
};

CpTimeline.prototype.paused = function() {
	return this;
};

CpTimeline.prototype.add = function(value, position) {
	if (Cp.isString(position)) {
		position = this._labels[position];
	}

	if (position === undefined) {
		position = this._duration;
	}

	this._timeline[position] = this._timeline[position] || [];

	if (!(value instanceof CpTweenDelay)) {
		this._timeline[position].push(value);
	}

	this._duration = Math.max(this._duration, position + value.duration());
	return this;
};

CpTimeline.prototype.duration = function() {
	return this._duration;
};

CpTimeline.prototype.call = function(callback, params, scope, position) {
	return this.add(new CpTweenCall(0, callback, params, scope), position);
};

CpTimeline.prototype.to = function(target, duration, vars, position) {
	return this.add(new CpTween(target, duration, vars), position);
};

CpTimeline.prototype.set = function(target, vars, position) {
	return this.add(new CpTween(target, 0, vars), position);
};

CpTimeline.prototype.loop = function(position) {
	this._onComplete = function() {
		this.play(0);
	}.bind(this);
};

CpTimeline.prototype.addLabel = function(label, position) {
	this._labels[label] = position || this._duration;
	return this;
};

CpTimeline.prototype.resolveLabel = function(label) {
	return this._labels[label];
};

function CpTween(target, duration, vars) {
	this._target = target;
	this._duration = duration || 0;
	this._vars = vars || {};

	this._playTime = 0;
	this._ticker = new CpTicker();
	this._oldCSS = {};
}

CpTween.prototype._tickHandler = function(time) {
	var progress = time / this._duration;
	this._playTime = time;

	if (progress > 1) {
		this._setState(1);
		this._ticker.stop();
		return;
	}

	this._setState(progress);
};

CpTween.prototype._setState = function(progress) {
	var unit = {
		left : 'px'
	};

	Cp.each(this._vars, function(i, v) {
		var newValue = this._oldCSS[i] + progress * (this._vars[i] - this._oldCSS[i]);
		$(this._target).css(i, newValue + (unit[i] || ''));
	}.bind(this));
};

CpTween.prototype.play = function(time) {
	this._oldCSS = {};
	Cp.each(this._vars, function(i, v) {
		this._oldCSS[i] = parseInt($(this._target).css(i));
	}.bind(this));

	if (Cp.isNull(time)) {
		time = this._playTime;
	}

	if (time < 0) {
		throw new Error('CpTween negative time in play');
	}

	if (this._duration == 0) {
		this._setState(1);
	} else {
		this._ticker.play(time, this._tickHandler.bind(this));
	}
};

CpTween.prototype.stop = function() {
	this._playTime = 0;
	this._ticker.stop();
};

CpTween.prototype.pause = function() {
	this._ticker.stop();
};

CpTween.prototype.duration = function() {
	return this._duration;
};

function CpTweenCall(delay, callback, params, scope) {
	this._callback = callback;
	this._delay = delay || 0;
	this._params = params;
	this._scope = scope;
}

CpTweenCall.prototype.play = function() {
	if (this._delay > 0) {
		/**
		 * @todo Wywalić setTimeout. Niebezpieczne!
		 */
		window.clearTimeout(this._timeout);
		this._timeout = window.setTimeout(function() {
			this._callback.apply(this._scope, this._params);
		}.bind(this), this._delay);
	} else {
		this._callback.apply(this._scope, this._params);
	}

};

CpTweenCall.prototype.stop = function() {
	window.clearTimeout(this._timeout);
};

CpTweenCall.prototype.pause = function() {
	window.clearTimeout(this._timeout);
};

CpTweenCall.prototype.duration = function() {
	return this._delay;
};

function CpTweenDelay(delay) {
	this._delay = delay || 0;
}

CpTweenDelay.prototype.play = function() {
};

CpTweenDelay.prototype.stop = function() {
};

CpTweenDelay.prototype.pause = function() {
};

CpTweenDelay.prototype.duration = function() {
	return this._delay;
};

function CpWebsocket(endpoint) {
	this._endpoint = endpoint;
	this._evm = new CpEventManager();
}

CpLogger.create(CpWebsocket);

CpWebsocket.prototype.ready = function(callback) {
	if (this._ready) {
		callback();
	} else {
		this._evm.on('ready', callback);
		this._connect();
	}
};

CpWebsocket.prototype._connect = function() {
	if (this._ws) {
		return;
	}
	this._ws = new WebSocket(this._endpoint);

	// Open handler
	this._ws.onopen = function() {
		this.constructor.logger.debug('Websocket connected to ' + this._endpoint);
		this._evm.trigger('ready');
	}.bind(this);

	// Close handler
	this._ws.onclose = function() {
		this._ws = null;
		this._evm.trigger('disconnect');
		this.constructor.logger.debug('Websocket disconnected from ' + this._endpoint);
	}.bind(this);

	// Message handler
	this._ws.onmessage = function(event) {
		var data = null;
		try {
			data = JSON.parse(event.data);
		} catch (e) {
			this.constructor.logger.debug('Unable to parse JSON from ' + this._endpoint, event.data);
			this._evm.trigger('error', e);
			return;
		}

		if (data.error || data.stack) {
			this.constructor.logger.error('Error from ' + this._endpoint, data.error, data.stack);
			this._evm.trigger('error', data.error);
			return;
		}

		this.constructor.logger.debug('Got message from ' + this._endpoint);
		this._evm.trigger('message', data);

	}.bind(this);

	// Error handler
	this._ws.onerror = function() {
		this.constructor.logger.debug('Error when connecting to ' + this._endpoint);
		this._evm.trigger('error');
	}.bind(this);
};

CpWebsocket.prototype.send = function(data) {
	if (!this._ws) {
		throw new Error("Disconnected");
	}
	this.constructor.logger.debug('Sending message to ' + this._endpoint);
	this._ws.send(JSON.stringify(data));
	return this;
};

CpWebsocket.prototype.onDisconnect = function(callback) {
	this._evm.on('disconnect', callback);
};

CpWebsocket.prototype.onMessage = function(callback) {
	this._evm.on('message', callback);
};

CpWebsocket.prototype.onError = function(callback) {
	this._evm.on('error', callback);
};

CpWebsocket.prototype.close = function(callback) {
	this._ws.onclose = function() {
	};
	this._ws.close();
};

function CpWebsocketTickService(websocket, tickDelay) {
	if (!(websocket instanceof CpWebsocket)) {
		throw new TypeError();
	}

	this._ws = websocket;
	this._tickDelay = tickDelay || 5000;
}

CpLogger.create(CpWebsocketTickService);

CpWebsocketTickService.prototype.enable = function() {
	window.clearInterval(this._interval)
	this._interval = window.setInterval(function() {
		this.constructor.logger.debug('Tick message');
		this._ws.send({
			'method' : 'tick'
		});
	}.bind(this), this._tickDelay);

	this._ws.onDisconnect(function() {
		this.disable();
	}.bind(this));
	return this;
};

CpWebsocketTickService.prototype.disable = function() {
	window.clearInterval(this._interval)
	return this;
};


function CpGame() {
}

CpGame.prototype.$ = jQuery;
CpGame.prototype._init = Cp.noop;

CpGame.prototype.init = function() {
	this._init();
};

CpGame.prototype.getAvatar = function(playerId) {
	return './images/avatars/' + parseInt(playerId % 4 + 1) + '.png';
}

function CpGameSketch(container, endpoint) {
	this._container = this.$(container);
	this._endpoint = endpoint;
}

Cp.inherits(CpGameSketch, CpGame);

CpGameSketch.prototype._initCanvas = function() {
	this._canvas = new fabric.Canvas(this._container.find('.sketch-board')[0], {
		isDrawingMode : true
	});
	var canvas = this._canvas;

	canvas.on("after:render", function() {
		canvas.calcOffset()
	});

	fabric.Object.prototype.transparentCorners = false;

	var $ = this.$;

	var clearEl = this._container.find('.clear-canvas');

	this._container.find('.clear-canvas').click(function() {
		canvas.clear()
	});

	this._container.find('.set-drawing-line-width').click(function() {
		canvas.freeDrawingBrush.width = $(this).data('width');
		$(this).addClass('active').siblings().removeClass('active');
	}).first().trigger('click');

	this._container.find('.set-drawing-line-color').click(function() {
		canvas.freeDrawingBrush.color = $(this).data('color');
		$(this).addClass('active').siblings().removeClass('active');
	}).first().trigger('click');
};

CpGameSketch.prototype._initWS = function() {
	if (this._ws) {
		this._ws.close();
	}
	this._ws = new CpWebsocket(this._endpoint);

	this._container.find('.sketch-screen, .write-screen, .results-screen').hide();

	var context = this;
	context._ws.ready(function() {
		context._ws.onMessage(function(message) {
			var f = CpGameSketch.prototype['_handle' + CpString.ucfirst(message.type)];
			if (!Cp.isFunction(f)) {
				throw new TypeError('Missing handler for type : ' + message.type);
			}

			f.call(context, message);
		});

		context._ws.onError(function() {

		});

		context._ws.send({
			'method' : 'clients',
		});

		context._ws.send({
			'method' : 'state',
			'name' : null
		});
	});

	this._container.find('.ready-btn').one('click', function() {
		context._container.find('.wait-message').show();
		context._ws.send({
			'method' : 'state',
			'ready' : true
		});
	});

	this._tickService = new CpWebsocketTickService(context._ws);
	this._tickService.enable();
}

CpGameSketch.prototype._init = function() {
	this._container.find('.sketch-screen, .write-screen, .results-screen').hide();

	this._initWS();
	this._initCanvas();
};

CpGameSketch.prototype._handleClientList = function(message) {
	var c = this._container.find('.clients');
	c.html('');

	Cp.each(message.clients, function(i, client) {
		var avatar = this.$('<img></img>', {
			src : this.getAvatar(client.player_id),
			alt : client.name || 'Nieznany',
			title : client.name || 'Nieznany',
			class : 'avatar'
		});

		var avatarContainer = this.$('<div></div>', {
			class : client.ready ? 'ready' : ''
		});

		c.append(avatarContainer.append(avatar));
	}.bind(this));
};

CpGameSketch.prototype._handleClientDescription = function(message) {
	this._clientDesc = message;
	this._container.find('.name').text(message.name);
};

CpGameSketch.prototype._handleSketchTurn = function(message) {
	this._container.find('.wait-message').hide();
	this._container.find('.welcome-screen, .write-screen').hide();
	var c = this._container.find('.sketch-screen, .content__previous').show();

	this._canvas.clear();

	var context = this;
	console.warn(message);
	c.find('.word').text(this._container.find('[data-chain-id=' + message.queue_id + '] *').eq(message.num).text());
	c.find('.complete-btn').one('click', function() {
		context._container.find('.wait-message').show();
		context._ws.send({
			'method' : 'saveResponse',
			'data' : context._container.find('canvas')[0].toDataURL()
		});
	})
};

CpGameSketch.prototype._handleWriteTurn = function(message) {
	this._container.find('.wait-message').hide();
	this._container.find('.welcome-screen, .sketch-screen').hide();
	var c = this._container.find('.write-screen, .content__previous').show();

	var image = c.find('img');
	var image2 = this._container.find('[data-chain-id=' + message.queue_id + '] *').eq(message.num);
	image.attr('src', image2.attr('src'));

	c.find('input').val('')

	var context = this;
	c.find('.complete-btn').one('click', function() {
		context._container.find('.wait-message').show();
		context._ws.send({
			'method' : 'saveResponse',
			'data' : c.find('input').val()
		});
	})
};

CpGameSketch.prototype._handleSketchDataShare = function(message) {
	var c = this._container.find('.results-screen .results');
	var row1 = c.children('[data-chain-id=' + message.queue_id + ']');
	if (!row1.length) {
		row1 = this.$('<div></div>', {
			'data-chain-id' : message.queue_id,
			'class' : 'answers-chain'
		});
		c.append(row1);
	}

	if (message.is_sketch_turn) {
		row1.append(this.$('<img />', {
			'src' : message.data,
			'data-player_id' : message.player_id,
			'data-turn' : message.turn
		}));
	} else {
		row1.append(this.$('<span />', {
			'data-player_id' : message.player_id,
			'data-turn' : message.turn
		}).text(message.data));
	}
};

CpGameSketch.prototype._handleSketchFinish = function(message) {
	this._container.find('.wait-message, .content__previous').hide();
	this._container.find('.sketch-screen, .write-screen').hide();
	this._container.find('.results-screen').show();

	var context = this;
	this._container.find('.restart-btn').on('click', function() {
		context._container.find('.results-screen').hide();
		context._container.find('.welcome-screen').show();
		context._initWS();
		context._container.find('.results-screen .results').html('');
	});
};

CpGameSketch.prototype._handleHello = function(message) {
	var context = this;
	this._container.find('.player-avatar').attr('src', this.getAvatar(message.player_id));
};

function CpWatterfallWrapper(object, options) {
	if (!Cp.isObject(object) || !Cp.isFunction(object.constructor)) {
		throw new TypeError();
	}

	this._object = object;

	Cp.each(object.constructor.prototype, function(i, v) {
		this[i] = function() {
			return v.apply(this._object, arguments);
		};
	}.bind(this));

	Cp.initObject(this, options);
}

CpWatterfallWrapper.prototype.getBinded = function() {
	var args = Cp.toArray(arguments), f = this._object[args.shift()];
	if (!Cp.isFunction(f)) {
		throw new TypeError('Specified field is not a function');
	}
	args.unshift(this._object);
	return f.bind.apply(f, args);
};

CpWatterfallWrapper.prototype.getBindedSync = function() {
	var args = Cp.toArray(arguments), f = this._object[args.shift()];
	if (!Cp.isFunction(f)) {
		throw new TypeError('Specified field is not a function');
	}
	return function(callback) {
		f.apply(this._object, args);
		if (Cp.isFunction(callback)) {
			callback();
		}
	}.bind(this);
};