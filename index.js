function login() {
    var email = $("#email").val();
    var password = $("#password").val();
    
    if (!email) {
        $(".toast-body").text('Please enter email');
        $(".toast").toast("show");
        return;
    }
    if (!password) {
        $(".toast-body").text('Please enter password');
        $(".toast").toast("show");
        return;
    }

    var users = JSON.parse(localStorage.getItem('users'));

    if (users && users.find(el => el.email == email && el.password == password)) {
        localStorage.setItem('currentUser', email)
        $(".toast-body").text('Login successful');
        $(".toast").toast("show");
        window.location.replace("inbox.html");
    } else {
        $(".toast-body").text('Invalid credentials');
        $(".toast").toast("show");
    }
}