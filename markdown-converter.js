document.addEventListener('DOMContentLoaded', function() {
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js';
  script.onload = function() {
    var converter = new showdown.Converter();
    var post = document.querySelector('.post-body');
    post.innerHTML = converter.makeHtml(post.textContent);
  };
  document.head.appendChild(script);
});
