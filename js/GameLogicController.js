function alertDialog(content, time, callback) {
    var $div = $('<div></div>');
    $div.css({
        'position': 'fixed',
        'top': 0,
        'left': 0,
        'width': '100%',
        'height': '100%',
        'z-index': '200',
        'background-color': 'rgba(0, 0, 0, 0.4)',
        // 'background-color':'#000',
    });

    var $contentDiv = $('<div>' + content + '</div>');
    $contentDiv.css({
        // 'text-align': 'center',
        'position': 'absolute',
        'top': '50%',
        'left': '45%',
        'right': '30%',
        'font-size': '20px',
        'padding': '50px 50px',
        'border-radius': '5px',
        'background-color': '#fff',
        'color': '#000'
    });
    $div.append($contentDiv);
    $('body').append($div);

     // 获取创建的大小
     var newWidth = (parseInt($contentDiv.css('width')) + 200) / 2;
     var newHeight = (parseInt($contentDiv.css('height')) + 100) / 2;
     $contentDiv.css({
         'margin-top': -newHeight + 'px',
         'margin-left': -newWidth + 'px',
     })
     setTimeout(function() {
         $div.remove();
         if (callback) {
            callback(); //回调函数    
         }
     }, time);
}