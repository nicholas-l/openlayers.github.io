var raster = new ol.layer.Tile({
  style: 'Aerial',
  source: new ol.source.MapQuest({
    layer: 'sat'
  })
});

var styleFunction = (function() {
  var styles = {};
  var image = new ol.style.Circle({
    radius: 5,
    fill: null,
    stroke: new ol.style.Stroke({color: 'orange', width: 2})
  });
  styles['Point'] = [new ol.style.Style({image: image})];
  styles['Polygon'] = [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'blue',
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(0, 0, 255, 0.1)'
    })
  })];
  styles['MultiLinestring'] = [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'green',
      width: 3
    })
  })];
  styles['MultiPolygon'] = [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'yellow',
      width: 1
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 255, 0, 0.1)'
    })
  })];
  styles['default'] = [new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'red',
      width: 3
    }),
    fill: new ol.style.Fill({
      color: 'rgba(255, 0, 0, 0.1)'
    }),
    image: image
  })];
  return function(feature, resolution) {
    return styles[feature.getGeometry().getType()] || styles['default'];
  };
})();

var testDataSource = new ol.source.GeoJSON(
    /** @type {olx.source.GeoJSONOptions} */ ({
      object: {
        'type': 'FeatureCollection',
        'crs': {
          'type': 'name',
          'properties': {
            'name': 'EPSG:3857'
          }
        },
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [0, 0]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'MultiPoint',
              'coordinates': [[-2e6, 0], [0, -2e6]]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [[4e6, -2e6], [8e6, 2e6], [9e6, 2e6]]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': [[4e6, -2e6], [8e6, 2e6], [8e6, 3e6]]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': [[[-5e6, -1e6], [-4e6, 1e6],
                  [-3e6, -1e6], [-5e6, -1e6]], [[-4.5e6, -0.5e6],
                  [-3.5e6, -0.5e6], [-4e6, 0.5e6], [-4.5e6, -0.5e6]]]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'MultiLineString',
              'coordinates': [
                [[-1e6, -7.5e5], [-1e6, 7.5e5]],
                [[1e6, -7.5e5], [1e6, 7.5e5]],
                [[-7.5e5, -1e6], [7.5e5, -1e6]],
                [[-7.5e5, 1e6], [7.5e5, 1e6]]
              ]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'MultiPolygon',
              'coordinates': [
                [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6],
                    [-3e6, 6e6], [-5e6, 6e6]]],
                [[[-2e6, 6e6], [-2e6, 8e6], [0e6, 8e6],
                    [0e6, 6e6], [-2e6, 6e6]]],
                [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6],
                    [3e6, 6e6], [1e6, 6e6]]]
              ]
            }
          },
          {
            'type': 'Feature',
            'geometry': {
              'type': 'GeometryCollection',
              'geometries': [
                {
                  'type': 'LineString',
                  'coordinates': [[-5e6, -5e6], [0e6, -5e6]]
                },
                {
                  'type': 'Point',
                  'coordinates': [4e6, -5e6]
                },
                {
                  'type': 'Polygon',
                  'coordinates': [
                    [[1e6, -6e6], [2e6, -4e6], [3e6, -6e6], [1e6, -6e6]]
                  ]
                }
              ]
            }
          }
        ]
      }
    }));

var testDataLayer = new ol.layer.Vector({
  source: testDataSource,
  style: styleFunction
});

var realDataSource = new ol.source.GeoJSON({
  projection: 'EPSG:3857',
  url: 'data/geojson/countries.geojson'
});

var realDataLayer = new ol.layer.Vector({
  source: realDataSource,
  style: styleFunction
});

var overlayStyle = (function() {
  var styles = {};
  styles['Polygon'] = [
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: [255, 255, 255, 0.5]
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles['MultiPolygon'] = styles['Polygon'];

  styles['LineString'] = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [255, 255, 255, 1],
        width: 5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];
  styles['MultiLineString'] = styles['LineString'];

  styles['Point'] = [
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: [0, 153, 255, 1]
        }),
        stroke: new ol.style.Stroke({
          color: [255, 255, 255, 0.75],
          width: 1.5
        })
      }),
      zIndex: 100000
    })
  ];
  styles['MultiPoint'] = styles['Point'];

  styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);

  return function(feature, resolution) {
    return styles[feature.getGeometry().getType()];
  };
})();

var select = new ol.interaction.Select({
  style: overlayStyle
});

var modify = new ol.interaction.Modify({
  features: select.getFeatures(),
  style: overlayStyle
});

var map = new ol.Map({
  interactions: ol.interaction.defaults().extend([select, modify]),
  layers: [raster, testDataLayer, realDataLayer],
  renderer: 'canvas',
  target: 'map',
  view: new ol.View2D({
    center: [0, 0],
    zoom: 2
  })
});

$('#layer-select').change(function() {
  select.getFeatures().clear();
  var index = $(this).children().index($(this).find(':selected'));
  var layers = [testDataLayer, realDataLayer];
  var i, ii;
  for (i = 0, ii = layers.length; i < ii; ++i) {
    layers[i].setVisible(index == i);
  }
});
$('#layer-select').trigger('change');
