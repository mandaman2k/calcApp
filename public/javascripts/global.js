var coinListData = [];

$(document).ready(function () {
    populateTable();
    $('#btnAddUser').on('click', addCoin);
});

function populateTable() {

    var tableContent = '';
    var count = 1;
    $.getJSON('/coins/list', function (data) {

        $.each(data, function () {
            if (isEven(count)) {
                tableContent += '<tr>';
                tableContent += '<td class="tg-6k2t"><a href="#" class="linkshowuser" rel="' + this.name + '">' + this.name + '</a></td>';
                tableContent += '<td class="tg-6k2t">' + this.ticker + '</td>';
                tableContent += '<td class="tg-6k2t">' + this.address + '</td>';
                tableContent += '<td class="tg-6k2t">' + this.price + '</td>';
                tableContent += '<td class="tg-6k2t">' + this.balance + '</td>';
                tableContent += '</tr>';
                count++;
            } else {
                tableContent += '<tr>';
                tableContent += '<td class="tg-yw4l"><a href="#" class="linkshowuser" rel="' + this.name + '">' + this.name + '</a></td>';
                tableContent += '<td class="tg-yw4l">' + this.ticker + '</td>';
                tableContent += '<td class="tg-yw4l">' + this.address + '</td>';
                tableContent += '<td class="tg-yw4l">' + this.price + '</td>';
                tableContent += '<td class="tg-yw4l">' + this.balance + '</td>';
                tableContent += '</tr>';
                count++;
            }
        });

        $('#coinList table tbody').html(tableContent);
    });
}

function isEven(value) {
    if (value % 2 == 0)
        return true;
    else
        return false;
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