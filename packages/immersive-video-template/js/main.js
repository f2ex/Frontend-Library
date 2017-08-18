jQuery(document).ready(function($){
	var immersiveVideoWrapper = $('.cd-immersive-video');
	var transitionSupported = ( $('.csstransitions').length > 0 );
	var transitionEnd = transitionSupported
		? 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend'
		: 'noTransitions';

	var animationIteration = 'webkitAnimationIteration oanimationiteration oAnimationIteration msAnimationIteration animationiteration';

	var resizing = false;

	if( immersiveVideoWrapper.length > 0 ) {
		var productPreview = immersiveVideoWrapper.find('.product-preview'),
			productVideoWrapper = productPreview.find('.video-wrapper'),
			productVideo = immersiveVideoWrapper.find('.product-video'),
			productIntro = immersiveVideoWrapper.find('.product-intro');

		var loader = $('.cd-loader');

		var body = $('body');

		var windowHeight = $(window).height(),
			windowWidth = $(window).width();
		
		if( productVideo.is(':visible') && productVideo.find('video').length == 0 ) {
			// if visible - we are not on a mobile device 
			var	video = $('<video><source src="'+productVideo.data('video')+'" type="video/mp4" />Sorry, your browser does not support HTML5 video.</video>');
			
			//check if the canplaythrough event occurs - video is ready to be played
			video.on('canplaythrough', function() {
				video.off('canplaythrough').trigger('readyToPlay');
			});
			// if video is in cache 'canplaythrough' won't be triggered 
			if (video.get(0).readyState > 3) {
				video.off('canplaythrough').trigger('readyToPlay');
			}

			video.on('readyToPlay', function(){
				//video id ready to play
				video.appendTo(productVideo.find('.video-wrapper'));

				//wait for the end of an animation iteraction and reveal the video
				loader.one(animationIteration, function() {
			        loader.addClass('no-animation').off(animationIteration);
			        void loader.get(0).offsetWidth; //makes sure the transition is applied (when using the scale-down class)
			        loader.addClass('scale-down');
			        loader.on(transitionEnd, function(){
			        	loader.off(transitionEnd);
			        	immersiveVideoWrapper.trigger('startAnimation');
			        });
			    });
			});
			
			immersiveVideoWrapper.on('startAnimation', function(){
				var	previewWidth = productPreview.innerWidth(),
					previewHeight = productPreview.innerHeight(),
					videoPreviewWidth = productVideoWrapper.innerWidth(),
					videoPreviewHeight = productVideoWrapper.innerHeight();

				var immersiveVideoWrapperPaddingRight = Number(immersiveVideoWrapper.css('padding-right').replace('px', ''));

				var scaleX = windowWidth/videoPreviewHeight,
					scaleY = windowHeight/videoPreviewWidth;


				var scale = ( scaleX > scaleY ) ? scaleX : scaleY;

				//scale up video to cover the entire viewport (no transition)
				transform(productPreview, 'translateX('+ (windowWidth/2 - previewWidth/2) +'px) translateY('+ (windowHeight/2 - previewHeight/2) +'px) scale('+scale+') rotate(90deg)');
				body.addClass('cd-overflow-hidden');

				//reveal content and play video
				immersiveVideoWrapper.addClass('video-is-loaded').find('video').get(0).play();
				productVideo.addClass('has-bg-color');
				
				setTimeout(function(){
					productPreview.removeClass('no-transition');
					//scale down the video
					transform(productPreview, 'translateX('+ (windowWidth/2 - previewWidth/2) +'px) translateY('+ (windowHeight/2 - previewHeight/2) +'px) scale(1)');

					productPreview.one(transitionEnd, function(){
						//wait for the end of the scale animation to change the video transition duation
						productPreview.addClass('video-zoomed-out');
						
						setTimeout(function(){
							productPreview.off(transitionEnd);
							//move video to the right
							transform(productPreview, 'translateX('+ (windowWidth - previewWidth - immersiveVideoWrapperPaddingRight) +'px) translateY('+ (windowHeight/2 - previewHeight/2) +'px)');
							//animate product into
							productIntro.addClass('animate-content');
							productPreview.one(transitionEnd, function(){
								productPreview.addClass('no-transition').off(transitionEnd);
								body.removeClass('cd-overflow-hidden');
							});
							//if browser does not support transitions
							if(!transitionSupported) productPreview.trigger(transitionEnd);
						}, 400);
					});
					//if browser does not support transitions
					if(!transitionSupported) productPreview.trigger(transitionEnd);
				}, 1900);
			});
		}

		//on window resize - reset video position
		$(window).on('resize', function(){
			if( !resizing ) {
				resizing = true;
				(!window.requestAnimationFrame) ? setTimeout(checkResize, 300) : window.requestAnimationFrame(checkResize);
			}
		});
	}

	function checkResize() {
		if( productVideo.is(':visible') ) {
			//we are on desktop
			immersiveVideoWrapper.addClass('video-is-loaded');
			transform(productPreview, 'translateX('+ ($(window).width() - productPreview.innerWidth() - Number(immersiveVideoWrapper.css('padding-right').replace('px', ''))) +'px) translateY('+ ($(window).height()/2 - productPreview.innerHeight()/2) +'px)');
			productIntro.addClass('animate-content');
		} else {
			//we are on mobile
			productPreview.attr('style', '');
			body.removeClass('cd-overflow-hidden');
		}

		resizing = false;
	}

	function transform(element, value) {
		element.css({
		    '-moz-transform': value,
		    '-webkit-transform': value,
			'-ms-transform': value,
			'-o-transform': value,
			'transform': value
		});
	}
});