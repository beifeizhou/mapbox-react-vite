import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css'
import './MapUtils.less'


const measure = (lat1, lon1, lat2, lon2) => {
    // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 * Math.PI) / 180 - (lat1 * Math.PI) / 180;
    var dLon = (lon2 * Math.PI) / 180 - (lon1 * Math.PI) / 180;
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000; // meters
}

export const runScript = (setShowReqForm, setBbox, setImgSize) => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;
    const [lng, lat] = [-121.403732, 40.492392]
    const zoom = 10
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [lng, lat],
        zoom: zoom
    });

    // Add the control to the map.
    map.addControl(
        new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl
        }), 'top-left'
    );

    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(new mapboxgl.GeolocateControl(), 'bottom-right');
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        'Construction on the Washington Monument began in 1848.'
    );

    const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

    // Get bbox of map
    map.on('moveend', () => {
        let bound = map.getBounds();
        let top = bound._ne.lat;
        let bottom = bound._sw.lat;
        let left = bound._sw.lng;
        let right = bound._ne.lng;
        const coord = bound.getCenter();
        console.log('center', coord);
        console.log('bbox', bound)

        let imgWidth = document.querySelector("#map").clientWidth;
        let imgHeight = document.querySelector("#map").clientHeight;

        imgHeight = Math.round(measure(top, 1, bottom, 1));
        imgWidth = Math.round(measure(1, left, 1, right));
        setBbox([left, bottom, right, top]);
        setImgSize([imgWidth, imgHeight]);
        console.log(map.getZoom())
    })

    const el = document.createElement('div');
    el.className = 'custom-marker';

    const customMarker = new mapboxgl.Marker({ draggable: true, element: el })

    map.on('contextmenu', (e) => {
        console.log(e.lngLat);
        customMarker.setLngLat(e.lngLat).addTo(map);
    })

    map.on('load', () => {
        map.addSource('national-park', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': [
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Polygon',
                            'coordinates': [
                                [
                                    [-121.353637, 40.584978],
                                    [-121.284551, 40.584758],
                                    [-121.275349, 40.541646],
                                    [-121.246768, 40.541017],
                                    [-121.251343, 40.423383],
                                    [-121.32687, 40.423768],
                                    [-121.360619, 40.43479],
                                    [-121.363694, 40.409124],
                                    [-121.439713, 40.409197],
                                    [-121.439711, 40.423791],
                                    [-121.572133, 40.423548],
                                    [-121.577415, 40.550766],
                                    [-121.539486, 40.558107],
                                    [-121.520284, 40.572459],
                                    [-121.487219, 40.550822],
                                    [-121.446951, 40.56319],
                                    [-121.370644, 40.563267],
                                    [-121.353637, 40.584978]
                                ]
                            ]
                        }
                    },
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-121.415061, 40.506229]
                        }
                    },
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-121.505184, 40.488084]
                        }
                    },
                    {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [-121.354465, 40.488737]
                        }
                    }
                ]
            }
        });
        map.addLayer({
            'id': 'layer-0',
            'type': 'fill',
            'source': 'national-park',
            'paint': {
                'fill-color': '#888888',
                'fill-opacity': 0.4
            },
            'filter': ['==', '$type', 'Polygon'],
            "layout": {
                "visibility": "none"
            },
        });

        map.addLayer({
            'id': 'layer-1',
            'type': 'circle',
            'source': 'national-park',
            'paint': {
                'circle-radius': 6,
                'circle-color': '#B42222'
            },
            'filter': ['==', '$type', 'Point'],
            "layout": {
                "visibility": "none"
            },
        });
    });

    const layers = ['layer-0', 'layer-1'];
    layers.forEach(layerId => {
        document.getElementById(layerId).addEventListener('click', (e) => {
            console.log(e.target.id)
            const visibility = map.getLayoutProperty(layerId, 'visibility');
            console.log(visibility)
            if (visibility === 'visible') {
                map.setLayoutProperty(layerId, 'visibility', 'none');
            } else {
                map.setLayoutProperty(layerId, 'visibility', 'visible');
            }
        })
    })

    el.addEventListener('click', (e) => {
        setShowReqForm(true)
    })
}