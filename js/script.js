$(document).ready(function () {
    //api aufruf
    const apiBerufe = "http://sandbox.gibm.ch/berufe.php";
    const apiKlassen = "http://sandbox.gibm.ch/klassen.php";
    const apiTabellen = "http://sandbox.gibm.ch/tafel.php";
    //array für wochentage erstellen, weekcounter
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    let wochenZaehler = 0;

    // funktion zum abrufen der berufe und befüllen des dropdowns
    function getBerufe() {
        // ladeanzeige für den Berufe-Abruf anzeigen
        $('.berufe h2').after('<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div>');

        // AJAX anfrage an die berufe url
        $.ajax({
            url: apiBerufe,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                // daten durchgehen und dropdown befüllen
                data.forEach(beruf => {
                    $('#berufe').append('<option value="' + beruf.beruf_id + '">' + beruf.beruf_name + '</option>');
                });

                // gespeicherten beruf auswählen, falls vorhanden
                let gespeicherteBerufe = localStorage.getItem('berufe');
                if (gespeicherteBerufe) {
                    $('#berufe').val(gespeicherteBerufe);
                    // klassen für den ausgewählten beruf laden
                    getKlassen(gespeicherteBerufe);
                }
            },
            error: function (xhr, status, error) {
                console.error('Fehler:', status, error);
            },
            complete: function () {
                // ladeanzeige entfernen, wenn die Anfrage abgeschlossen ist
                $('.berufe .spinner-border').remove();
            }
        });
    }


    function getKlassen(berufe) {

        $('.klassen h2').after('<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div>');
        var params = {
            beruf_id: berufe
        };
        $.ajax({
            url: apiKlassen,
            method: 'GET',
            dataType: 'json',
            data: params,
            success: function (data) {
                $('#klassen').empty();
                data.forEach(schulKlasse => {
                    $('#klassen').append('<option value="' + schulKlasse.klasse_id + '">' + schulKlasse.klasse_name + ', ' + schulKlasse.klasse_longname + '</option>');
                });
                let gespeicherteSchulKlasse = localStorage.getItem('schulKlasse');
                if (gespeicherteSchulKlasse) {
                    $('#klassen').val(gespeicherteSchulKlasse);
                    getTabelle(gespeicherteSchulKlasse, getAktuelleWoche());
                }
            },
            error: function (xhr, status, error) {
                console.error('Error:', status, error);
            },
            complete: function () {
                $('.classes .spinner-border').remove();
            }
        });
    }

    function getTabelle(schulKlasse, woche = getAktuelleWoche()) {
        if (!schulKlasse) {
            return;
        }
        $('.table h2').after('<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>');
        var params = {
            klasse_id: schulKlasse,
            woche: woche
        };
        $.ajax({
            url: apiTabellen,
            method: 'GET',
            dataType: 'json',
            data: params,
            success: function (data) {
                localStorage.setItem('schulKlasse', schulKlasse);
                $('#table').empty();
                data.forEach(table => {
                    $('#table').append('<tr>' +
                        '<td>' + table.tafel_datum + '</td>' +
                        '<td>' + wochentage[table.tafel_wochentag] + '</td>' +
                        '<td>' + table.tafel_von.slice(0, -3) + '</td>' +
                        '<td>' + table.tafel_bis.slice(0, -3) + '</td>' +
                        '<td>' + table.tafel_lehrer + '</td>' +
                        '<td>' + table.tafel_longfach + '</td>' +
                        '<td>' + table.tafel_raum + '</td>' +
                        '</tr>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error:', status, error);
            },
            complete: function () {
                $('.table .spinner-border').remove();
            }
        });
    }

// funktion um aktuelle woche zu berechnen
function getAktuelleWoche() {
    const jetzt = new Date();
    const jahresbeginn = new Date(jetzt.getFullYear(), 0, 0);
    const tageSeitBeginn = (jetzt - jahresbeginn) / (24 * 60 * 60 * 1000);
    const aktuelleWoche = Math.ceil((tageSeitBeginn + jahresbeginn.getDay() + 1) / 7);
    return ((aktuelleWoche + wochenZaehler) + '-' + jetzt.getFullYear());
}


    $('#berufe').on('change', function () {
        getKlassen(this.value);
    });

    $('#klassen').on('change', function () {
        getTabelle(this.value, getAktuelleWoche());
    });

    $('#wochealt').on('click', function () {
        wochenZaehler -= 1;
        $('#wocheaktuell').text(getAktuelleWoche());
        getTabelle($('#klassen').val(), getAktuelleWoche());
    });

    $('#wocheneu').on('click', function () {
        wochenZaehler += 1;
        $('#wocheaktuell').text(getAktuelleWoche());
        getTabelle($('#klassen').val(), getAktuelleWoche());
    });

    $('#wocheaktuell').text(getAktuelleWoche());

    getBerufe();
});
