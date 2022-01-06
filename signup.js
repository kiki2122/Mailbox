function signup(){
    var email = $("#email").val();
    var name = $("#name").val();
    var password = $("#password").val();
    var confirmPassword = $("#confirmPassword").val();
    
    if (!email) {
        $(".toast-body").text('Please enter email');
        $(".toast").toast("show");
        return;
    }
    if (!name) {
        $(".toast-body").text('Please enter name');
        $(".toast").toast("show");
        return;
    }
    if (!password) {
        $(".toast-body").text('Please enter password');
        $(".toast").toast("show");
        return;
    }
    if (password != confirmPassword) {
        $(".toast-body").text('Passwords do not match');
        $(".toast").toast("show");
        return;
    }

    var newUser = { email: email, name: name, password: password };
    var users = JSON.parse(localStorage.getItem('users'));

    if (users) {
        if (users.findIndex(el => el.email == email) > -1) {
            $(".toast-body").text('Email already exists');
            $(".toast").toast("show");
            return;
        } else {
            localStorage.setItem('users', JSON.stringify(users.push(newUser)));
        }
    } else {
        localStorage.setItem('users', JSON.stringify([newUser]));
    }
    
    var inbox = JSON.parse(localStorage.getItem('inbox'));
    var outbox = JSON.parse(localStorage.getItem('outbox'));

    if (!inbox) {
        inbox = {};
    }
    if (!outbox) {
        outbox = {};
    }

    inbox[email] = [];
    outbox[email] = [];

    localStorage.setItem('inbox', JSON.stringify(inbox));
    localStorage.setItem('outbox', JSON.stringify(outbox));
    localStorage.setItem('currentUser', email);
    window.location.replace("inbox.html");
}