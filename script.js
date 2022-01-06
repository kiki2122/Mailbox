function expand() {
    var expand = $("#expanded-menu");

    if (expand.css('display') == "none") {
        expand.css('display', "block");
        $("#header-list").css('marginLeft', "8%");
        $("#compose-btn").css('width', "100%");
        $("#nav-list").css('left', "15%");
    } else {
        expand.css('display', "none");
        $("#header-list").css('marginLeft', "1%");
        $("#compose-btn").css('width', "150%");
        $("#nav-list").css('left', "7%");
    }
}

function composeMail() {
    $("#compose-mail").css('display', "block");
}

function sendMail() {
    var toEmail = $("#toEmail").val();
    var ccEmail = $("#ccEmail").val();
    var subject = $("#subject").val();
    var message = $("#message").val();
    
    if (!toEmail) {
        $(".toast-body").text('Please enter to email');
        $(".toast").toast("show");
        return;
    }
    if (!message) {
        $(".toast-body").text('Please enter message');
        $(".toast").toast("show");
        return;
    }

    var users = JSON.parse(localStorage.getItem('users'));

    if (users.findIndex(el => el.email == toEmail) < 0) {
        $(".toast-body").text('To email does not exist');
        $(".toast").toast("show");
        return;
    }
    if (ccEmail && users.findIndex(el => el.email == ccEmail) < 0) {
        $(".toast-body").text('CC email does not exist');
        $(".toast").toast("show");
        return;
    }
    
    var fromEmail = localStorage.getItem('currentUser');

    let mail = {
        toEmail: toEmail,
        fromEmail: fromEmail,
        ccEmail: ccEmail,
        subject: subject,
        message: message,
        date: new Date()
    };

    var inbox = JSON.parse(localStorage.getItem('inbox'));
    var sent = JSON.parse(localStorage.getItem('sent'));

    inbox[toEmail].unshift({ id: uniqueID(), ...mail });
    sent[fromEmail].unshift({ id: uniqueID(), ...mail });

    localStorage.setItem('inbox', JSON.stringify(inbox));
    localStorage.setItem('sent', JSON.stringify(sent));
    $(".toast-body").text('Mail sent successfully');
    $(".toast").toast("show");
    closeCompose();
}

function closeCompose() {
    $("#toEmail").val('');
    $("#ccEmail").val('');
    $("#subject").val('');
    $("#message").val('');
    $("#compose-mail").css('display', "none");
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.replace('index.html');
}

function uniqueID() {
    var random = Math.floor(Math.random() * 100);
    random = random < 10 ? ('0' + random) : random.toString();
    var id = (new Date()).getTime() + random;

    return id;
}

var subjectMessage = params => {
    var finalValue = '';
    finalValue += params.data.subject ? (params.data.subject + ' - ') : '';
    finalValue += params.data.message ? ('<span style="font-weight: 400;">' + params.data.message + '</span>') : '';

    return finalValue;
};

const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear();
}

var date = params => {
    var finaldate = new Date(params.data.date);
    var finalDateValue = '';

    if (isToday(finaldate)) {
        var hours = finaldate.getHours();
        var minutes = finaldate.getMinutes();
        minutes = minutes < 10 ? ('0' + minutes) : minutes.toString();
        finalDateValue = (hours == 0 ? '12' : (hours <= 12 ? hours : (hours - 12))) + ':' + minutes + (hours < 12 ? ' AM' : ' PM');
    } else {
        finalDateValue = finaldate.toLocaleString('default', { month: 'short' }) + ' ' + finaldate.getDate();
    }

    return finalDateValue;
};

var columnDefs = [
    {field: "name", maxWidth: 150, checkboxSelection: true},
    {cellRenderer: subjectMessage},
    {cellRenderer: date, cellStyle: {textAlign: 'right'}, maxWidth: 100}
];
        
var gridOptions = {
    rowSelection: 'multiple',
    suppressCellSelection: true,
    suppressRowClickSelection: true,
    columnDefs: columnDefs,
    getRowStyle: params => {
        if (params.data.seen) {
            return { background: '#f1f3f4' };
        } else {
            return { fontWeight: 'bold' };
        }
    },
    overlayNoRowsTemplate: '<span>No mails to show</span>',
    paginationAutoPageSize: true,
    pagination: true,
    onRowClicked: (event) => {
        navigate('mail.html?id=' + event.data.id);
    }
};

function getData() {
    var type = localStorage.getItem('type');
    var inboxData = JSON.parse(localStorage.getItem('inbox'))[localStorage.getItem('currentUser')];
    var rowData = JSON.parse(localStorage.getItem(type))[localStorage.getItem('currentUser')];
    var users = JSON.parse(localStorage.getItem('users'));

    if (type == 'inbox') {
        rowData.forEach(mail => {
          mail['name'] = users.find(user => user.email == mail.fromEmail)['name'];
        });
    } else {
        rowData.forEach(mail => {
          mail['name'] = 'To: ' + users.find(user => user.email == mail.toEmail)['name'];
        });
    }

    var total = rowData.length;
    var inboxTotal = inboxData.length;
    var unseen = inboxData.filter(row => !row.seen).length;
    $('#total').text(total.toString());

    if (unseen > 0) {
        $('.notifications .fa-envelope').addClass('display');
        $('.notifications .fa-envelope').attr('data-content', unseen.toString());
    } else {
        $('.notifications .fa-envelope').removeClass('display');
    }

    if (inboxTotal > 0) {
        $('.nav ul li .fa-inbox').addClass('display');
        $('.nav ul li .fa-inbox').attr('data-content', inboxTotal.toString());
    } else {
        $('.nav ul li .fa-inbox').removeClass('display');
    }

    return rowData;
}

function grid(type) {
    localStorage.setItem('type', type);

    document.addEventListener('DOMContentLoaded', function() {
        gridOptions['rowData'] = getData();
        var gridDiv = document.querySelector('#myGrid');
        new agGrid.Grid(gridDiv, gridOptions);
        gridOptions.api.sizeColumnsToFit();
        $('.ag-header').css('display', 'none');
        $('.ag-paging-panel').css('display', 'none');
        setTimeout(() => {
            $('.pagination li span').html($('.ag-paging-row-summary-panel').html().replace('>to<', '>-<'));
        }, 100)
    });
}

function refresh() {
    gridOptions.api.setRowData(getData());
    $('.pagination li span').html($('.ag-paging-row-summary-panel').html().replace('>to<', '>-<'));
}

function remove() {
    var selectedNodes = gridOptions.api.getSelectedNodes();
	var selectedId = selectedNodes.map(node => node.data.id);
    var user = localStorage.getItem('currentUser');
    var type = localStorage.getItem('type');
    
    var removeData = JSON.parse(localStorage.getItem(type));
    removeData[user] = removeData[user].filter(data => !selectedId.includes(data.id));

    localStorage.setItem(type, JSON.stringify(removeData));
    refresh();
}

function read() {
    var selectedNodes = gridOptions.api.getSelectedNodes();
	var selectedId = selectedNodes.map(node => node.data.id);
    var user = localStorage.getItem('currentUser');
    var type = localStorage.getItem('type');
    
    var readData = JSON.parse(localStorage.getItem(type));
    readData[user].forEach(data => {
        if (selectedId.includes(data.id)) {
            data.seen = !data.seen;
        }
    });

    localStorage.setItem(type, JSON.stringify(readData));
    refresh();
}

function next() {
    gridOptions.api.paginationGoToNextPage();
    $('.pagination li span').html($('.ag-paging-row-summary-panel').html().replace('>to<', '>-<'));
}

function previous() {
    gridOptions.api.paginationGoToPreviousPage();
    $('.pagination li span').html($('.ag-paging-row-summary-panel').html().replace('>to<', '>-<'));
}

function navigate(location) {
    window.location.href = location;
}

function mail() {
    seenOne();
    var id = new URL(window.location.href).searchParams.get('id');
    var type = localStorage.getItem('type');
    var inboxData = JSON.parse(localStorage.getItem('inbox'))[localStorage.getItem('currentUser')];
    var rowData = JSON.parse(localStorage.getItem(type))[localStorage.getItem('currentUser')];
    var users = JSON.parse(localStorage.getItem('users'));
    var mail = rowData.find(mail => mail.id === id);

    if (mail) {
        mail['mail'] = type == 'inbox' ? mail.fromEmail : mail.toEmail;
        mail['name'] = users.find(user => user.email == mail['mail'])['name'];

        $('#name').text(mail['name']);
        $('#mail').text('<' + mail['mail'] + '>');
        $('#subject').text(mail['subject']);
        $('#message').text(mail['message']);

        var inboxTotal = inboxData.length;
        var unseen = inboxData.filter(row => !row.seen).length;
    
        if (unseen > 0) {
            $('.notifications .fa-envelope').addClass('display');
            $('.notifications .fa-envelope').attr('data-content', unseen.toString());
        } else {
            $('.notifications .fa-envelope').removeClass('display');
        }
    
        if (inboxTotal > 0) {
            $('.nav ul li .fa-inbox').addClass('display');
            $('.nav ul li .fa-inbox').attr('data-content', inboxTotal.toString());
        } else {
            $('.nav ul li .fa-inbox').removeClass('display');
        }
    } else {
        history.back();
    }
}

function removeOne() {
    var id = new URL(window.location.href).searchParams.get('id');
    var type = localStorage.getItem('type');
    var user = localStorage.getItem('currentUser');

    var rowData = JSON.parse(localStorage.getItem(type));
    rowData[user] = rowData[user].filter(mail => mail.id != id);

    localStorage.setItem(type, JSON.stringify(rowData));
    history.back();
}

function seenOne() {
    var id = new URL(window.location.href).searchParams.get('id');
    var type = localStorage.getItem('type');
    var user = localStorage.getItem('currentUser');

    var rowData = JSON.parse(localStorage.getItem(type));
    rowData[user].forEach(mail => {
        if (mail.id == id) {
            mail.seen = true;
        }
    });

    localStorage.setItem(type, JSON.stringify(rowData));
}