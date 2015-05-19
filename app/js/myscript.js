$(window).load(function () {

    var winHeight = $(window).height();
    $('.tablecontainer').css('height', winHeight - 100);
    $('.tablecontainer').css('overflow', 'auto');
    $('#main-container').css('min-height', winHeight);
    $('.remove').click(function () {
        $('#myModal ').modal('show');
    });

    var loginheight = $('#loginPage').height();
    var tbmargin = ((winHeight - loginheight) / 2);
  
    $('body').click(function () {
        $('.autochoose').css('display','none');
    });

    $('.openautochoose').click(function (event) {
        $('.autochoose').toggle();
        event.stopPropagation();

    });

   

    //    $('#loginPage').css('margin-top', tbmargin - 30);
    //    $(".rotateonclick").on("click", function () {
    //        $("#accordion a.rotateonclick").each(function (index, item) {
    //              $($(item).children("span")[0]).removeClass("openPanelrotate");
    //          });
    //            $($(this).children("span")[0]).addClass("openPanelrotate");
    //    });

});
    