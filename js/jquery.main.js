function setCookie(name, value, days, path, domain, secure) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();		
        var curCookie = name + "=" + escape(value) + expires + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + ((secure) ? "; secure" : "");
        document.cookie = curCookie;
}

var winW = 100, winH = 800;
$(function () {
	$(window).scroll(function () {
		if (($(this).scrollTop() > 500) && (winW>1200))
			$('a#move_up').fadeIn();
		else
			$('a#move_up').fadeOut(400);
		if ($('#wall').width()<500)
		{
			position = $("#wall").offset();
			if ($(this).scrollTop() > position.top + $("#wall").height()+10) $("#target").css({position: "fixed", top: "12px", margin: "0 0 20px 10px"});
				else $("#target").css({position: "relative", margin: "0 0 20px 0"});
		}
		flag = false;
		$(".item").each(function (i) {
			position = $(".item#"+this.id).offset();
			if (position.top<$(window).scrollTop()+winH-500 && !flag)
			{
				position = $(".item#"+this.id+" section").offset();
				if ($(window).scrollTop() + winH < position.top + $(".item#"+this.id+" section").height() && $(".item#"+this.id+" section").height()>700)
				{
					$(".item#"+this.id+" footer").hide();
					$(".item#"+this.id+" footer").css({border: "1px solid #C6CDD7", position:"fixed", padding: "5px 9px", left: position.left-10});
					$(".item#"+this.id+" footer").fadeIn();
					flag = true;
				}
				else			
					$(".item#"+this.id+" footer").css({border: "0", position:"relative", padding: "0", left: ""});
			}	else
				$(".item#"+this.id+" footer").css({border: "0", position:"relative", padding: "0", left: ""});
		});		
	});
	$('a#move_up').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 200);
		return false;
	});
	$(".min").click(function(){post_id = $(this).parent("div").attr("id"); jQuery.ajax({type:"POST",url:'/vote.php',data:"pid="+post_id+"&rate=-1",cache:false,success:function(data){if (data=="1")$("#c"+post_id).html(parseInt($("#c"+post_id).html())-1);}}); return false;});
	$(".plu").click(function(){post_id = $(this).parent("div").attr("id"); jQuery.ajax({type:"POST",url:'/vote.php',data:"pid="+post_id+"&rate=1",cache:false,success:function(data){if (data=="1")$("#c"+post_id).html(parseInt($("#c"+post_id).html())+1);}}); return false;});		
	if (is_auth<=0)
	{
		$(".add").click(function(){return auth(1);});		
	}
	$(".sort .radio").each(function(){if ($(this).val()==location.pathname) $(this).prop('checked', true);});
	$(".menu a").each(function(){if (location.pathname.split('/')[1]!=null && $(this).attr("href")=='/'+location.pathname.split('/')[1]) $(this).css('color', '#F1DB13');});
	$('input.customCheckbox').customCheckbox();
	$('select.customSelect').customSelect();	
	$('input.customRadio').customRadio();
	$('.sort .radio').change(function(){document.location = this.value;});
	$(".minus").click(function(){ setCookie($(this).parent().parent().attr('id'), '1', 2000, '/'); $(this).parent().parent().fadeOut(); });
	$(".plus").click(function(){ $(".gradient").hide(); $(this).parent().parent().css("max-height", "1000px"); $(this).fadeOut(); });
	$(".rightselect").change(function() { location.href=this.value; });	
	$('.small').click(function(){$('.small').removeClass('hover'); $(this).addClass('hover'); $("#wall").html(""); VK.Widgets.Comments("wall", {limit: 10, pageUrl: "http://comicsbook.ru/wall", width: "627", attach: "graffiti,photo,audio,link,video"}, this.id); return false;});
});

function gif(a)
{
	if ($(a).parent().find('span.gif_over').is(':visible'))
	{
		$(a).parent().find('span.gif_over').fadeOut(); 
		$(a).parent().find('img.gif').attr('src', $(a).parent().find('img.gif').attr('src').replace(".jpg", ".gif"));
	} else
	{
		$(a).parent().find('span.gif_over').fadeIn(); 
		$(a).parent().find('img.gif').attr('src', $(a).parent().find('img.gif').attr('src').replace(".gif", ".jpg"));
	}
	return false;
}

function onBodyResize(){
winW = 100; winH = 800;
if (document.body && document.body.offsetWidth) {
 winW = document.body.offsetWidth;
 winH = document.body.offsetHeight;
}
if (document.compatMode=='CSS1Compat' &&
    document.documentElement &&
    document.documentElement.offsetWidth ) {
 winW = document.documentElement.offsetWidth;
 winH = document.documentElement.offsetHeight;
}
if (window.innerWidth && window.innerHeight) {
 winW = window.innerWidth;
 winH = window.innerHeight;
}
if (winW>1200)
{
	$('a#move_up').width(Math.round((winW-1040)/2));$('a#move_up').height(winH);
} else
{
	$('a#move_up').width(150);$('a#move_up').height(50);
}
}

jQuery.fn.customSelect = function(_options) {
var _options = jQuery.extend({
	selectStructure: '<div class="selectArea"><div class="selectIn"><div class="selectText"></div></div></div>',
	selectText: '.selectText',
	selectBtn: '.selectIn',
	selectDisabled: '.disabled',
	optStructure: '<div class="select-sub"><ul></ul></div>',
	optList: 'ul'
}, _options);
return this.each(function() {
	var select = jQuery(this);
	if(!select.hasClass('outtaHere')) {
		if(select.is(':visible')) {
			var replaced = jQuery(_options.selectStructure);
			var selectText = replaced.find(_options.selectText);
			var selectBtn = replaced.find(_options.selectBtn);
			var selectDisabled = replaced.find(_options.selectDisabled).hide();
			var optHolder = jQuery(_options.optStructure);
			var optList = optHolder.find(_options.optList);
			if(select.attr('disabled')) selectDisabled.show();
			select.find('option').each(function() {
				var selOpt = $(this);
				var _opt = jQuery('<li><a href="#">' + selOpt.html() + '</a></li>');
				if(selOpt.attr('selected')) {
					selectText.html(selOpt.html());
					_opt.addClass('selected');
				}
				_opt.children('a').click(function() {
					optList.find('li').removeClass('selected');
					$(this).parent().addClass('selected');
					
					selOpt.prop("selected", true);
					selectText.html(selOpt.html());
					select.change();
					optHolder.hide();
					return false;
				});
				optList.append(_opt);
			});
			if (select.attr('title')) selectText.html(select.attr('title'));
			replaced.width(select.outerWidth()+18);
			replaced.insertBefore(select);
			replaced.addClass(select.attr('class'));
				optHolder.css({
					width: select.outerWidth()+18,
					display: 'none',
					position: 'absolute',
					zIndex: 4000
				});
			$(window).resize(function(){
				if(select.hasClass('resize')){
					var temp = select.parents('form').outerWidth()-157;
					replaced.width(temp+18);
					optHolder.css({
						width: temp+18
					});
				}
			});
			optHolder.addClass(select.attr('class'));
			jQuery(document.body).append(optHolder);
			
			var optTimer;
			replaced.hover(function() {
				if(optTimer) clearTimeout(optTimer);
			}, function() {
				optTimer = setTimeout(function() {
					optHolder.hide();
				}, 200);
			});
			optHolder.hover(function(){
				if(optTimer) clearTimeout(optTimer);
			}, function() {
				optTimer = setTimeout(function() {
					optHolder.hide();
				}, 200);
			});
			selectBtn.click(function() {
				if(optHolder.is(':visible')) {
					optHolder.hide();
				}
				else{
					optHolder.children('ul').css({height:'auto', overflow:'hidden'});
					optHolder.css({
						top: replaced.offset().top + replaced.outerHeight() +2,
						left: replaced.offset().left,
						display: 'block'
					});
					//if(optHolder.children('ul').height() > 100) optHolder.children('ul').css({height:100, overflow:'auto'});
				}
				return false;
			});
			select.addClass('outtaHere');
		}
	}
});
}
jQuery.fn.customRadio = function(_options){
	var _options = jQuery.extend({
		radioStructure: '<span></span>',
		radioDisabled: 'disabled',
		radioDefault: 'radioArea',
		radioChecked: 'radioAreaChecked'
	}, _options);
	return this.each(function(){
		var radio = jQuery(this);
		if(!radio.hasClass('outtaHere') && radio.is(':radio')){
			var replaced = jQuery(_options.radioStructure);
			replaced.addClass(radio.attr('class'));
			this._replaced = replaced;
			if(radio.is(':disabled')) replaced.addClass(_options.radioDisabled);
			else if(radio.is(':checked')) replaced.addClass(_options.radioChecked);
			else replaced.addClass(_options.radioDefault);
			replaced.click(function(){
				if($(this).hasClass(_options.radioDefault)){
					radio.change();
					radio.attr('checked', 'checked');
					changeRadio(radio.get(0));
				}
			});
			radio.click(function(){
				changeRadio(this);
			});
			replaced.insertBefore(radio);
			radio.addClass('outtaHere');
		}
	});
	function changeRadio(_this){
		$('input:radio[name='+$(_this).attr("name")+']').not(_this).each(function(){
			if(this._replaced && !$(this).is(':disabled')) this._replaced.removeClass('radioAreaChecked').removeClass('radioArea').addClass(_options.radioDefault);
		});
		_this._replaced.removeClass('radioAreaChecked').removeClass('radioArea').addClass(_options.radioChecked);
	}
}
jQuery.fn.customCheckbox = function(_options){
	var _options = jQuery.extend({
		checkboxStructure: '<span></span>',
		checkboxDisabled: 'disabled',
		checkboxDefault: 'checkboxArea',
		checkboxChecked: 'checkboxAreaChecked'
	}, _options);
	return this.each(function(){
		var checkbox = jQuery(this);
		if(!checkbox.hasClass('outtaHere') && checkbox.is(':checkbox')){
			var replaced = jQuery(_options.checkboxStructure);
			replaced.addClass(checkbox.attr('class'));
			this._replaced = replaced;
			if(checkbox.is(':disabled')) replaced.addClass(_options.checkboxDisabled);
			else if(checkbox.is(':checked')) replaced.addClass(_options.checkboxChecked);
			else replaced.addClass(_options.checkboxDefault);
			
			replaced.click(function(){
				if(checkbox.is(':checked')) checkbox.removeAttr('checked');
				else checkbox.attr('checked', 'checked');
				checkbox.change();
				changeCheckbox(checkbox);
			});
			checkbox.click(function(){
				changeCheckbox(checkbox);				
			});
			replaced.insertBefore(checkbox);
			checkbox.addClass('outtaHere');
		}
	});
	function changeCheckbox(_this){
		if(_this.is(':checked')) _this.get(0)._replaced.removeClass('checkboxArea').removeClass('checkboxAreaChecked').addClass(_options.checkboxChecked);
		else _this.get(0)._replaced.removeClass('checkboxArea').removeClass('checkboxAreaChecked').addClass(_options.checkboxDefault);
	}
}

function auth(add)
{
	if (add==1) VK.Auth.login(function(response){ if (response.session) location.href="/add"; }, 1);
		else VK.Auth.login(function(response){ if (response.session) location.href=location.href; }, 1);
	return false;
}