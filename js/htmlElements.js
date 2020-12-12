'use strict';
if (!window.prog)                       window.prog                      = {};
if (!window.prog.htmlElements)          window.prog.htmlElements         = {};
if (!window.prog.htmlElements.classes)  window.prog.htmlElements.classes = {};

/**
figure_runner circle or rect
{
	scale_color: '#444444',
	scale_border: '2px solid #CCCCCC',
	scale_width: 200,
	scale_height: 10,

	runner_color: '#22AA77',
	runner_border: '2px solid #444444',
	runner_width: 20,
	runner_height: 20,

	figure_runner: 'circle'
}
*/
window.prog.htmlElements.classes.Slider = function (params) {
	var _this = this;

	if (!params) params = {};

	if (!params.scale_width)   params.scale_width   = 200;
	if (!params.scale_height)  params.scale_height  = 10;
	if (!params.runner_width)  params.runner_width  = 20;
	if (!params.runner_height) params.runner_height = 20;

	_this.element = document.createElement('div');
	_this.scale     = document.createElement('div');
	
	var s = _this.scale.style;
	s.backgroundColor = params.scale_color ? params.scale_color : '#444444';
	s.scale_border    = params.scale_border ? params.scale_border : '2px solid #CCCCCC';
	s.width           = params.scale_width + 'px';
	s.height          = params.scale_height + 'px';
	s.position        = 'absolute';
	//s.marginTop      = (params.runner_height / 2 - params.scale_height / 2) + 'px';
	//s.clear           = 'both';

	_this.scale.width  = params.scale_width;
	_this.scale.height = params.scale_height;


	_this.runner = document.createElement('div');
	s = _this.runner.style;
	s.backgroundColor = params.runner_color ? params.runner_color : '#22AA77',
	s.scale_border    = params.runner_border ? params.runner_border : '2px solid #444444',
	s.width           = params.runner_width + 'px';
	s.height          = params.runner_height + 'px';
	s.position        = 'absolute';
	//s.top      		  = (params.scale_height / 2 - params.runner_height / 2) + 'px';
	
	_this.runner.width  = params.runner_width;
	_this.runner.height = params.runner_height;


	_this.element.appendChild (_this.scale);
	_this.element.appendChild (_this.runner);


	return this;
};