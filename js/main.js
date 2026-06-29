$(document).ready(function(){
	$(".shares li > a").click(function(){
		if ($(this).attr('data-social')) {
			$.post('/social.php', {data: $(this).data('social')});
			if ($(this).is('#shares_post > li > a')) {
				$counter = $(this).find('span');
				if ($counter.length) $counter.text(parseInt($counter.text()) + 1);
			}
			window.open($(this).attr('href'),'share post','width=668,height=266');
		}
		return false;
	});
		
	$(".like").click(function(){
		post_id = $(this).parent("div").attr("id");
		jQuery.ajax({
			type:"POST",
			url:'/vote.php',
			data:"pid="+post_id+"&rate=1",
			cache:false,
			success:function(data){
				if (data=="1") $("#c"+post_id).html(parseInt($("#c"+post_id).html())+1);
			}
		});
		return false;
	});
	$(".dislike").click(function(){
		post_id = $(this).parent("div").attr("id");
		jQuery.ajax({
			type:"POST",
			url:'/vote.php',
			data:"pid="+post_id+"&rate=-1",
			cache:false,
			success:function(data){
				if (data=="1") $("#c"+post_id).html(parseInt($("#c"+post_id).html())-1);
			}
		});
		return false;
	});
});