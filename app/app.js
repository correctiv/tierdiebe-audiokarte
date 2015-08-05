/* globals SC */

import Leaflet from './vendor/leaflet/dist/leaflet.js';
import geojsonData from './data.json';

var soundCloudSetUrl = 'https://soundcloud.com/correctiv_org/sets/tierdiebe-erfahrungsberichte';

var mapCenter = [53.064, 5.658];
var mapZoom = 8;
var minZoom = 5;
var bounds = new Leaflet.LatLngBounds(
  [50.12057809796008, -8.5703125], [65, 16.962890625]
);
var iframeID = 'iframe';
Leaflet.Icon.Default.imagePath = 'images/leaflet/';


var widget = SC.Widget(iframeID);
widget.load(soundCloudSetUrl, {
  show_user: false,
  show_artwork: false,
});


var map = Leaflet.map('map',{
  minZoom: minZoom,
  maxZoom: mapZoom,
  maxBounds: bounds,
  zoomControl: true,
  attributionControl: true
}).setView(mapCenter, 6);
window.Lmap = map;


Leaflet.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OSM contributors</a>'
}).addTo(map);


var i = 0;
var markerLayer = Leaflet.geoJson(geojsonData, {
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.title);
    layer.setOpacity(0.5);
    (function(i){
      layer.on('click', function(){
        widget.skip(i);
      });
    }(i));
    i += 1;
  }
});
markerLayer.addTo(map);


widget.bind(SC.Widget.Events.PLAY, function() {
  widget.getCurrentSound(function(data){
    var found = false;
    markerLayer.eachLayer(function(layer){
      layer.setOpacity(0.5);
      if (layer.feature.properties.permalink === data.permalink_url) {
        found = true;
        layer.openPopup();
        layer.setOpacity(1.0);
        map.setView(layer.getLatLng(), layer.feature.properties.zoom || mapZoom);
      } else {
        layer.closePopup();
      }
    });
    if (!found) {
      map.setView(mapCenter, minZoom);
    }
  });
});
