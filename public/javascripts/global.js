var coinListData = [];

$(document).ready(function () {
    populateTable();
    $('#btnAddUser').on('click', addCoin);
});

function populateTable() {

    var tableContent = '';

    $.getJSON('/coins/list', function (data) {
        $.each(data, function () {
            console.log(this.name);
            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.name + '">' + this.name + '</a></td>';
            tableContent += '<td>' + this.ticker + '</td>';
            tableContent += '<td>' + this.address + '</td>';
            tableContent += '<td>' + this.price + '</td>';
            tableContent += '<td>' + this.balance + '</td>';
            tableContent += '</tr>';
        });

        $('#coinList table tbody').html(tableContent);
    });
}

function addCoin(event) {
    event.preventDefault();

    var errorCount = 0;
    $('#addCoin input').each(function (index, val) {
        if ($(this).val() === '') { errorCount++; }
    });

    if (errorCount === 0) {
        var newCoin = {
            'name': $('#addCoin fieldset input#inputCoinName').val().toUpperCase(),
            'ticker': $('#addCoin fieldset input#inputCoinTicker').val().toUpperCase(),
            'address': $('#addCoin fieldset input#inputCoinAddress').val(),
            'explorer': $('#addCoin fieldset input#inputCoinExplorer').val(),
            'pool': $('#addCoin fieldset input#inputCoinPool').val(),
            'exchange': $('#addCoin fieldset input#inputCoinExchange').val()
        };

        $.ajax({
            type: 'POST',
            data: newCoin,
            url: '/coins/add',
            dataType: 'JSON'
        }).done(function (response) {
            if (response.msg === '') {
                $('#addCoin fieldset input').val('');

                populateTable();
            } else {
                alert('Error: ' + response.msg);
            }
        });
    } else {
        alert('Please fill in all fields');
        return false;
    }
}