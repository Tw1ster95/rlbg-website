var user = null;

async function getUserSessionInfo() {
  const userid = sessionStorage.getItem("id");
  if(userid) {
    var jsonUser = await fetchUserInfo('id', userid);
    if(jsonUser) {
      user = JSON.parse(jsonUser);
      if(user.error)
        user = null;
    }
    if(getCookie('cookies') === 'true')
      $('.cookies').addClass('hide');
  }
  else {
    if(getCookie('cookies') === 'true') {
      sessionStorage.setItem("cookies", "true");
      $('.cookies').addClass('hide');
      var cookieId = getCookie('id');
      if(cookieId !== '') {
        var jsonUser = await fetchUserInfo('id', cookieId);
        if(jsonUser) {
          user = JSON.parse(jsonUser);
          if(user.error)
            user = null;
        }
      }
    }
    else {
      sessionStorage.setItem("cookies", "false");
      $('#log-remember').attr("disabled", "true");
    }
  }
  
  if(user) {
    $('.nav-log').append("<li>Profile</li>", "<li>Logout</li>");
    generateProfilePage();
  }
  else
    $('.nav-log').append("<li>Login</li>", "<li>Register</li>");

  // nav menu page switch
  $('header li').click(function() {
    if(this.innerText.toLowerCase() == 'logout') {
      sessionStorage.removeItem("id");
      setCookie('id', '', 0);
      window.location.href = window.location;
    }
    else {
      const page = '.main-content > div#' + this.innerText.toLowerCase();
      changePage(page);
    }
  });
}
getUserSessionInfo();

function generateProfilePage() {
  $('#profile .content').append(
    '<div class="avatar"><img src="img/avatars/' + user.avatar + '"/></div>',
    '<div class="field right">Username:</div> <div class="field">' + user.username + '</div>',
    '<div class="field right">Email:</div> <div class="field">' + user.email + '</div>'
  );
}

// Logo link
$('.logo').click(function() {
  window.location.href = window.location;
});

// Contact form validation
$( "#contact-form" ).submit(async function( event ) {
  event.preventDefault();

  var subject = $( "#con-subject" ).val();
  var text = $( "#con-text" ).val();

  if(user) {
    var jsonData = await sendMail(subject, text);

    if(jsonData) {
      var fetchedData = JSON.parse(jsonData);
      if(fetchedData.error)
        showInfoBox("#contact-form", fetchedData.error, false);
      else
        showInfoBox("#contact-form", `An unknown error occured.`, false);
    }
    else {
      showInfoBox("#contact-form", `Email Successfuly sent.`, true);
      $( "#con-subject" ).val('');
      $( "#con-text" ).val('');
    }
  }
  else
    showInfoBox("#contact-form", `You need to be a registered user to use the form.`, false);
});

// Login form validation
$( "#login-form" ).submit(async function( event ) {
  event.preventDefault();

  var username = $( "#log-username" ).val();
  var password = $( "#log-password" ).val();

  var jsonUser = await fetchUserInfo('username', username);

  hideInfoBox( "#login-form" );

  if(jsonUser) {
    var fetchedUser = JSON.parse(jsonUser);
    var md5pwd = await fetchMD5(password);
    if(fetchedUser.error)
      showInfoBox("#login-form", fetchedUser.error, false);
    else if(fetchedUser.password !== md5pwd)
      showInfoBox("#login-form", `Wrong password.`, false);
    else {
      sessionStorage.setItem("id", fetchedUser.id);
      if($('#log-remember').is(':checked'))
        setCookie('id', fetchedUser.id, 30);
      window.location.href = window.location;
    }
  }
  else
    showInfoBox("#login-form", `An unknown error occured.`, false);
});

// Registration form validation
$( "#reg-form" ).submit(async function( event ) {
  event.preventDefault();

  var username = $( "#reg-username" ).val();
  var password = $( "#reg-password" ).val();
  var password2 = $( "#reg-password2" ).val();
  var email = $( "#reg-email" ).val();

  hideInfoBox( "#reg-form" );

  // Check username exists
  var fetchedData;
  var jsonData = await fetchUserInfo('username', username);
  if(jsonData) {
    fetchedData = JSON.parse(jsonData);
    if(!fetchedData.error) {
      showInfoBox("#reg-form", `User with username '${username}' already exists.`, false);
      return;
    }
  }

  // Check email exists
  jsonData = await fetchUserInfo('email', email);
  if(jsonData) {
    fetchedData = JSON.parse(jsonData);
    if(!fetchedData.error) {
      showInfoBox("#reg-form", `User with email '${email}' already exists.`, false);
      return;
    }
  }

  // Check passwords match
  if(password !== password2) {
    showInfoBox("#reg-form", `Passwords are not the same.`, false);
    return;
  }

  var md5pwd = await fetchMD5(password);

  // Register user
  jsonData = await insertUserInfo(username, md5pwd, email);
  if(jsonData) {
    fetchedData = JSON.parse(jsonData);
    if(fetchedData.error)
      showInfoBox("#reg-form", fetchedData.error, false);
  }
  else
    showInfoBox("#reg-form", `Registration successful.`, true);
});

function hideInfoBox(el) {
  $( `${el} .infobox` ).empty();;
  $( `${el} .infobox` ).addClass('hide');
}
function showInfoBox(el, text, valid) {
  $( `${el} .infobox` ).addClass(((valid == true) ? 'valid' : 'invalid'));
  $( `${el} .infobox` ).removeClass('hide');
  $( `${el} .infobox` ).append(text);
}

// Change to another page func
function changePage(page) {
  if($( page ).attr('data-visible') === 'false') {
    $('footer').addClass('hide');
    moveLastPageOut();
    $( page ).attr('data-visible', 'true');
    $( page ).removeClass('hide');
    $( page ).addClass('moveInAnim');
    $( page ).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
      $( this ).removeClass('moveInAnim');
      if(!$( page ).hasClass('moveOutAnim') && $( page ).has('data-visible') !== 'false') {
        $( this ).addClass('fix-section');
        $('footer').removeClass('hide');
      }
    });
  }
}

// Removes last page on page changed
function moveLastPageOut() {
  $('.main-content > div').each(function() {
    $( this ).removeClass('fix-section');
    if($( this ).attr('data-visible') == 'true') {
      $( this ).addClass('moveOutAnim');
      $( this ).one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        $( this ).removeClass('moveOutAnim');
        $( this ).addClass('hide');
        $( this ).attr('data-visible', 'false');
      });
    }
  });
}

// Responsive menu arrow button
$('.nav-icon').click(function() {
  if($('nav').hasClass('responsive')) {
    $('nav').removeClass('responsive');
    $('.nav-icon i').toggleClass('fa-angle-up fa-angle-down');
  }
  else {
    $('nav').attr('class', 'responsive');
    $('.nav-icon i').toggleClass('fa-angle-down fa-angle-up');
  }
});

// Display news items on home page
$.getJSON( "news.json", function( data ) {
  var items = [];
  $.each( data, function( key, val ) {
      items.unshift( `<div data-id="` + key + `" class="home-grid-item"><img src="` + val.image + `"/><div class="item-content"><p>` + val.title + `</p></div></div>` );
  });

  $('.home-grid').append(items.join( "" ));

  // On news item click
  $('.home-grid-item').click(async function() {
    var itemid = $( this ).attr('data-id');

    var itemInfo = await getJsonItemInfo("news.json", itemid);

    var title = $("<h1></h1>").text(itemInfo ? itemInfo.title : 'Error 404');
    var content = $("<p></p>").text(itemInfo ? itemInfo.content : 'Sorry but the page was not found.');

    $('#extra_page').empty();

    $('#extra_page').append(title, content);

    changePage('#extra_page');
  });
});

$('.cookies button').click(function() {
  sessionStorage.setItem("cookies", "true");
  $('#log-remember').attr("disabled", "false");
  setCookie('cookies', 'true', 9999);
  $('.cookies').addClass('hide');
});

// Get item from json file
async function getJsonItemInfo(file, id) {
  return ((await $.getJSON(file))[id]);
}

// Fetch user info from mysql
async function fetchUserInfo(type, val) {
  return await $.ajax({
    url: 'inc/fetch_user.php',
    type: 'GET',
    data: {
      type: type,
      val: val
    }
  });
}

// Insert user info in mysql
async function insertUserInfo(username, password, email) {
  return await $.ajax({
    url: 'inc/register_user.php',
    type: 'GET',
    data: {
      username: username,
      password: password,
      email: email
    }
  });
}

// Fetch MD5
async function fetchMD5(pwd) {
  return await $.ajax({
    url: 'inc/fetch_md5.php',
    type: 'GET',
    data: {
      pwd: pwd
    }
  });
}

// PHP send mail
async function sendMail(subject, text) {
  return await $.ajax({
    url: 'inc/send_mail.php',
    type: 'GET',
    data: {
      username: user.username,
      email: user.email,
      subject: subject,
      text: text
    }
  });
}

// Cookies stuff
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}