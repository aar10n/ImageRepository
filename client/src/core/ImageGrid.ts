// class ImageGrid {

//   constructor(gridBasis: number) {
//     this.gridBasis = gridBasis;
//     this.className = className;
//   }

//   buildGrid(images, attachTo, gridBasis=this.gridBasis, className=this.className) {
//     images.forEach(function(image) {
//       let img = new Image();
//       img.onload = function() {
//         // We'll be using the ratio to shrink each image
//         let ratio = this.width / this.height;

//         // Create our image wrapper
//         let elm = document.createElement('div');
//         elm.className = `${className}__element`;

//         // This is the basis for our object.
//         elm.style.flexBasis = gridBasis*ratio + 'px';

//         /**
//          * We'll then let each element grow dependent on it's width/height
//          * ratio.
//          */
//         elm.style.flexGrow = ratio;

//         // We'll add a hover effect to our images
//         let hover = document.createElement('div');
//         hover.className = `${className}__title`;
//         hover.innerHTML = '<p>'+image.title+'</p>';

//         /**
//          * Append the image and hover element to our element and then the
//          * parent
//          */
//         elm.appendChild(img);
//         elm.appendChild(hover);

//         attachTo.appendChild(elm);
//       };

//       /**
//        * Since flickr only gives us small image sizes we'll replace it.
//        * This is a hack and could potentially break in the future.
//        */
//       img.src = image.media.m.replace('_m.jpg', '_b.jpg');
//     });
//   }
// }

// // /**
// //  * We'll pull images from flickr but we could use any source.
// //  * Using flickr makes it easy to reload and see the effect on different sized
// //  * images.
// //  *
// //  * Our buildGrid algorithm could easily be implemented on the back end as well
// //  * The only thing we need for each image is it's width / height ratio.
// //  */
// //  const flickrAPI = 'https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?';

// // $.getJSON(flickrAPI, {
// //   tags: 'sunrise',
// //   tagmode: 'any',
// //   format: 'json'
// // }, function(data) {
// //   // Create a new Image grid
// //   const grid = new ImageGrid();
// //   const attachTo = document.getElementById('grid');
// //   // Append all images to #grid
// //   grid.buildGrid(data.items, attachTo);
// // });
export {};
