$(document).ready(function() {

	var controller = new ScrollMagic(),
		vWidth = $("body").width(),
		scrHeight = vWidth*0.2325,
		// mbpWidth = vWidth*0.29333333333,
		screenSlide = scrHeight/1.8,
		slideSpeed = .5,
		fHeight = ($(".features .container").height())-scrHeight*1.8;

		// $(".features .mbp ").height(mbpWidth);
		// alert(scrWidth)

	var scrSlideAnim = {width:"100%", height:"auto", opacity:1, ease: Linear.easeOut};

	var topbar = new ScrollScene(
					{	
						triggerElement: ".quote"
					})
	    			.setTween(TweenMax.to(".topbar", .3, {top : 0, opacity : 1, ease: Linear.easeOut}))
	                .setPin(".topbar"),

		mbp = new ScrollScene(
					{	
						duration: fHeight,
						offset: scrHeight/2,
						triggerElement: ".feature"
					})
	                .setPin(".mbp"),

	    addComment = new ScrollScene(
	    	{
	    		triggerElement: ".add.feature"
	    	})
	    	.setTween(
	    		TweenMax.to(".mbp .add", slideSpeed, scrSlideAnim)
	    		),

		reorder = new ScrollScene(
			{
				triggerElement: ".reorder.feature"
			})
			.setTween(
				TweenMax.to(".mbp .reo", slideSpeed, scrSlideAnim)
				),

		edit = new ScrollScene(
			{
				triggerElement: ".edit.feature"
			})
			.setTween(
				TweenMax.to(".mbp .rea", slideSpeed, scrSlideAnim)
				),

		update = new ScrollScene(
			{
				triggerElement: ".update.feature"
			})
			.setTween(
				TweenMax.to(".mbp .rel", slideSpeed, scrSlideAnim)
				),

		del =  new ScrollScene(
			{
				triggerElement: ".delete.feature"
			})
			.setTween(
				TweenMax.to(".mbp .del", slideSpeed, scrSlideAnim)
				),

		tog =  new ScrollScene(
			{
				triggerElement: ".toggle.feature"
			})
			.setTween(
				TweenMax.to(".mbp .tog", slideSpeed, scrSlideAnim)
				);


	controller.addScene([
	    topbar,
	    mbp,
	    addComment,
	    reorder,
	    edit,
	    update,
	    del,
	    tog
	]);

});