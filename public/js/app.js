import { OpenStreetMapProvider } from 'leaflet-geosearch';
import asistencia from './asistencia';
import eliminarComentario from './elimina-comentario'

const geocodeService = L.esri.Geocoding.geocodeService();

let map;
let markers;
let marker;

document.addEventListener('DOMContentLoaded', () => {
    const divmap = document.querySelector('#mapa');

    if (divmap) {
        const lat = document.querySelector('#lat').value || 18.4482414;
        const lng = document.querySelector('#lng').value || -95.2123539;
        const direccion = document.querySelector('#direccion').value || '';

        map = L.map('mapa').setView([lat, lng], 18);
        markers = new L.FeatureGroup().addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        if (direccion) {
            marker = new L.Marker([lat, lng], {
                draggable: true,
                autoPan: true
            })
            .addTo(map)
            .bindPopup(direccion)
            .openPopup();
            
            markers.addLayer(marker);
            marker.on('moveend', function (e) {
                marker = e.target;
                const position = marker.getLatLng();
                map.panTo(new L.LatLng(position.lat, position.lng));
                geocodeService.reverse().latlng([position.lat, position.lng]).run(function (error, result) { 
                    marker.bindPopup(result.address.Match_addr).openPopup();
                    llenaFormulario(result);
                });
            });
        }

        const buscador = document.querySelector('#formbuscador');
        buscador.addEventListener('input', buscarDireccion);
    }
});

function buscarDireccion(e) {
    if (e.target.value.length > 8) {
        markers.clearLayers();

        const provider = new OpenStreetMapProvider();
        provider.search({ query: e.target.value }).then((searchResult) => {
            geocodeService.reverse().latlng([searchResult[0].y, searchResult[0].x]).run(function (error, result) {
                llenaFormulario(result);
                map.setView([searchResult[0].y, searchResult[0].x], 18);
                marker = new L.Marker([searchResult[0].y, searchResult[0].x], {
                    draggable: true,
                    autoPan: true
                })
                .addTo(map)
                .bindPopup(searchResult[0].label)
                .openPopup();
                
                markers.addLayer(marker);
                marker.on('moveend', function (e) {
                    marker = e.target;
                    const position = marker.getLatLng();
                    map.panTo(new L.LatLng(position.lat, position.lng));
                    geocodeService.reverse().latlng([position.lat, position.lng]).run(function (error, result) { 
                        marker.bindPopup(result.address.Match_addr).openPopup();
                        llenaFormulario(result);
                    });
                });

                L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
            });
        });
    }
}

function llenaFormulario(resultado) {
    document.querySelector('#direccion').value = resultado.address.Address || '';
    document.querySelector('#ciudad').value = resultado.address.City || '';
    document.querySelector('#estado').value = resultado.address.Region || '';
    document.querySelector('#pais').value = resultado.address.CountryCode || '';
    document.querySelector('#lat').value = resultado.latlng.lat || '';
    document.querySelector('#lng').value = resultado.latlng.lng || '';
}