$(window).load(function () {

    var winHeight = $(window).height();
    $('.tablecontainer').css('height', winHeight - 100);
    $('.tablecontainer').css('overflow', 'auto');

    $('.remove').click(function () {
        $('#myModal ').modal('show');
    });

    var loginheight = $('#loginPage').height();
    var tbmargin = ((winHeight - loginheight)/2);


    $('#loginPage').css('margin-top', tbmargin-30);
 
});