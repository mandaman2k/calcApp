var coinListData = [];

$(document).ready(function () {
    populateTable();
    $('#btnAddUser').on('click', addCoin);
    $('#btnActualizar').on('click', updateCoin);

    // Delete User link click
    $('#coinList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

function populateTable() {

    $.getJSON('/coins/list', function (data) {
        var tableContent = '';
        var count = 1;
        $.each(data, function () {
            if (this.ticker != 'MXN' && this.ticker != 'USD' && this.ticker != 'BTC') {
                tableContent += '<tr>';
                tableContent += '<td class="tg-6k2t"><b>' + this.name + '</b<</td>';
                tableContent += '<td class="tg-6k2t">' + this.ticker + '</td>';
                tableContent += '<td class="tg-6k2t">' + this.address + '</td>';
                tableContent += '<td class="tg-6k2t">' + Number(this.price).toFixed(8) + '</td>';
                tableContent += '<td class="tg-6k2t">' + this.balance + '</td>';
                tableContent += '<td class="tg-6k2t"><a href="' + this.explorer + '" target="_blank">Explorer</a></td>';
                tableContent += '<td class="tg-6k2t"><a href="' + this.pool + '" target="_blank">Pool</a></td>';
                tableContent += '<td class="tg-6k2t"><a href="#" class="linkdeleteuser" rel="' + this._id + '">Borrar</a></td>';
                tableContent += '</tr>';
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
    /*     $('#addCoin input').each(function (index, val) {
            if ($(this).val() === '') { errorCount++; }
        }); */

    if (errorCount === 0) {
        var newCoin = {
            'name': $('#addCoin fieldset input#inputCoinName').val().toUpperCase(),
            'ticker': $('#addCoin fieldset input#inputCoinTicker').val().toUpperCase(),
            'address': $('#addCoin fieldset input#inputCoinAddress').val(),
            'explorer': $('#addCoin fieldset input#inputCoinExplorer').val(),
            'pool': $('#addCoin fieldset input#inputCoinPool').val(),
            'exchange': $('#addCoin fieldset input#inputCoinExchange').val(),
            'api': $('#addCoin fieldset input#inputCoinApi').val()
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

// Delete User
function deleteUser(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('¿Seguro?');

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/coins/delete/' + $(this).attr('rel')
        }).done(function (response) {

            // Check for a successful (blank) response
            if (response.msg === '') {
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;

    }

};

function updateCoin(event) {
    event.preventDefault();

    var errorCount = 0;
    $('#updateCoin input').each(function (index, val) {
        if ($(this).val() === '') { errorCount++; }
    });

    if (errorCount === 0) {
        var coin = {
            'name': $('#updateCoin fieldset input#inputCoinName').val().toUpperCase(),
            'balance': $('#updateCoin fieldset input#inputCoinBalance').val()
        };

        $.ajax({
            type: 'PUT',
            data: coin,
            url: '/coins/update/' + 'BTC',
            dataType: 'JSON'
        }).done(function (response) {
            if (response.msg === '') {
                $('#updateCoin fieldset input#inputBalance').val('');
                alert('Actualizado');
                location.reload(true);
            } else {
                alert('Error: ' + response.msg);
            }
        });
    } else {
        alert('Please fill in all fields');
        return false;
    }
}