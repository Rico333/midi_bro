'use strict';
if (!window.prog)                   window.prog                  = {};
if (!window.prog.graphics)          window.prog.graphics         = {};
if (!window.prog.graphics.classes)  window.prog.graphics.classes = {};

prog.graphics.classes.Drawable = function () {
	this.draw = function (ctx) {};
}
prog.graphics.classes.Image = function (imagee, xsrcc, ysrcc, wsrcc, hsrcc, xx, yy, ww, hh) {
	var _this = this;
	_this.image = imagee;
	_this.x = xx ? xx : 0; _this.y = yy ? yy : 0; _this.width = ww ? ww : 0; _this.height = hh ? hh : 0;
	_this.x_global = 0; _this.y_global = 0;
	_this.x_src = xsrcc ? xsrcc : 0; _this.y_src = ysrcc ? ysrcc : 0; _this.width_src = wsrcc ? wsrcc : 0; _this.height_src = hsrcc ? hsrcc : 0;
	_this.draw = function (ctx) {
		ctx.drawImage (_this.image, _this.x_src, _this.y_src, _this.width_src, _this.height_src, _this.x + _this.x_global, _this.y + _this.y_global, _this.width, _this.height);
	};
}
prog.graphics.classes.Container = function (xx, yy) {
	var _this = this;
	_this.children = [];
	_this.x = xx ? xx : 0; _this.y = yy ? yy : 0;
	_this.x_global = 0; _this.y_global = 0;
	_this.draw = function (ctx) {
		var __this = _this;
		var i = 0, l = __this.children.length, b;
		while (i < l) {
			b = __this.children[i];
			b.x_global = __this.x + __this.x_global; b.y_global = __this.y + __this.y_global;
			b.draw(ctx);
			++i;
		}
	};
}
prog.graphics.classes.Stage = function () {
	var _this = this;
	_this.children = [];
	_this.background_color = "#DDDDDD";
	_this.x = 0; _this.y = 0;
	_this.x_global = 0; _this.y_global = 0;
	_this.draw = function (ctx) {
		var __this = _this;
		ctx.fillStyle = __this.background_color;
        ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
		__this.x = __this.y = __this.x_global = __this.y_global = 0;
		var i = 0, l = __this.children.length, b;
		while (i < l) {
			b = __this.children[i];
			b.x_global = 0; b.y_global = 0;
			b.draw(ctx);
			++i;
		}
	};
}

prog.graphics.canvas = document.createElement('canvas');
prog.graphics.ctx    = prog.graphics.canvas.getContext('2d');
prog.graphics.stage  = new prog.graphics.classes.Stage();


