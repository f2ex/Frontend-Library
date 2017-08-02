var flkty = new Flickity('.parallax__carousel');

var paraBG = document.querySelector('.parallax__layer--bg');
var paraFG = document.querySelector('.parallax__layer--fg');
var cellRatio = 1;
var bgRatio = 0.75;
var fgRatio = 2;

flkty.on( 'scroll', function( progress ) {
  paraBG.style.left = ( 0.5 - ( 0.5 + progress * 4 ) * cellRatio * bgRatio ) * 100 + '%';
  paraFG.style.left = ( 0.5 - ( 0.5 + progress * 4 ) * cellRatio * fgRatio ) * 100 + '%';
});

flkty.reposition();