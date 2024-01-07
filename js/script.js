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
                // ladeanzeige entfernen, wenn die anfrage abgeschlossen ist
                $('.berufe .spinner-border').remove();
            }
        });
    }

// funktion zum abrufen der klassen basierend auf dem ausgewählten beruf
function getKlassen(berufId) {
    // anzeige des Ladeindikators
    $('.klassen h2').after('<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Lade...</span></div>');
    
    // parameter für die api anfrage
    var params = {
        beruf_id: berufId
    };

    // ajax anfrage an die api für klasseninformationen
    $.ajax({
        url: apiKlassen,
        method: 'GET',
        dataType: 'json',
        data: params,
        success: function (data) {
            // leeren des dropdowns für klassen
            $('#klassen').empty();

            // hinzufügen jeder schulklasse im dropdown
            data.forEach(schulKlasse => {
                $('#klassen').append('<option value="' + schulKlasse.klasse_id + '">' + schulKlasse.klasse_name + ', ' + schulKlasse.klasse_longname + '</option>');
            });

            // überprüfen ob die klasse lokal gespeichert wurde
            let gespeicherteSchulKlasse = localStorage.getItem('schulKlasse');
            if (gespeicherteSchulKlasse) {
                $('#klassen').val(gespeicherteSchulKlasse);
                // aktualisieren  der tabelle basierend auf der gespeicherten schulklasse und der aktuellen woche
                getTabelle(gespeicherteSchulKlasse, getAktuelleWoche());
            }
        },
        error: function (xhr, status, error) {
            console.error('Error:', status, error);
        },
        complete: function () {
            // entfernen des ladeindikators nach abschluss der anfrage
            $('.klassen .spinner-border').remove();
        }
    });
}


// funktion zum abrufen der stundenplantabelle für eine bestimmte schulklasse und woche
function getTabelle(schulKlasse, woche = getAktuelleWoche()) {
    // überprüfen, ob eine schulklasse angegeben ist
    if (!schulKlasse) {
        return;
    }

    // anzeige des ladeindikators
    $('.table h2').after('<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>');

    // parameter für die api anfragen
    var params = {
        klasse_id: schulKlasse,
        woche: woche
    };

    // ajax anfrage an die api für stundenplaninformationen
    $.ajax({
        url: apiTabellen,
        method: 'GET',
        dataType: 'json',
        data: params,
        success: function (data) {
            // ausgewähltes lokal speichern
            localStorage.setItem('schulKlasse', schulKlasse);

            // leeren der tabelle, bevor neue daten hinzugefügt werden
            $('#table').empty();

            // hinzufügen jeder Zeile in der tabelle basierend auf den erhaltenen daten
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
            // entfernen des ladeindikators nach abschluss der anfrage
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

    // Event-Listener für dropdown berufe

    $('#berufe').on('change', function () {
        getKlassen(this.value);
    });
    // Event-Listener für dropdown klassen

    $('#klassen').on('change', function () {
        getTabelle(this.value, getAktuelleWoche());
    });
    // Event-Listener für button letzte woche

    $('#wochealt').on('click', function () {
        wochenZaehler -= 1;
        $('#wocheaktuell').text(getAktuelleWoche());
        getTabelle($('#klassen').val(), getAktuelleWoche());
    });
    // Event-Listener für button nächste woche

    $('#wocheneu').on('click', function () {
        wochenZaehler += 1;
        $('#wocheaktuell').text(getAktuelleWoche());
        getTabelle($('#klassen').val(), getAktuelleWoche());
    });
    // setzen des initialen texts für die aktuelle woche

    $('#wocheaktuell').text(getAktuelleWoche());
    // aufruf der funktion, um die berufe zu erhalten
    getBerufe();
});
