(function () {
  'use strict';
  function htmlCollectionMap(collection, cb) {
    var transformed = new Array(collection.length);
    for (var i = 0; i < collection.length; i++) {
      transformed[i] = cb(collection.item(i), i);
    }
    return transformed;
  }
  function maxOnTrack(segments, cb) {
    return segments.reduce(function (max, segment) {
      return Math.max(max, segment.reduce(function (max, point) {
        return Math.max(max, cb(point));
      }, Number.NEGATIVE_INFINITY));
    }, Number.NEGATIVE_INFINITY);
  }
  function minOnTrack(segments, cb) {
    return segments.reduce(function (min, segment) {
      return Math.min(min, segment.reduce(function (min, point) {
        return Math.min(min, cb(point));
      }, Number.POSITIVE_INFINITY));
    }, Number.POSITIVE_INFINITY);
  }
  function formatDuration(time) {
    var durations = [];
    var hours = Math.floor(time / 3600);
    if (hours > 0) {
      time -= 3600 * hours;
      durations.push(hours + 'h');
    }
    var minutes = Math.floor(time / 60);
    if (minutes > 0) {
      time -= minutes * 60;
      durations.push(minutes + 'm');
    }
    var seconds = Math.floor(time);
    if (hours === 0 && seconds > 0) {
      durations.push(seconds + 's');
    }
    return durations.join('');
  }
  function getDurationTicks(max) {
    var ideal = max / 10;
    // Round to human sensible durations
    var closest = [5 * 60, 10 * 60, 15 * 60, 30 * 60, 60 * 60].reduce(function (candidate, value) {
      if (Math.abs(candidate - ideal) > Math.abs(value - ideal)) {
        return value;
      } else {
        return candidate;
      }
    }, 60);
    var ticks = [];
    for (var i = 0; i <= Math.floor(max / closest); i++) {
      ticks.push(closest * i);
    }
    return ticks;
  }
  function formatDistance(meters) {
    if (meters < 1000) {
      return Math.floor(meters) + ' m';
    } else {
      var kms = Math.floor(meters / 1000);
      var hundreds = Math.floor((meters - (1000 * kms)) / 100);
      if (kms > 10 || hundreds === 0) {
        return kms + ' km';
      } else {
        return kms + '.' + hundreds + ' km';
      }
    }
  }
  function averageWindow(points, isInWindow) {
    return points.reduce(function (acc, point) {
      while (acc.idx < points.length && isInWindow(point.time, points[acc.idx].time)) {
        acc.window.push(points[acc.idx]);
        acc.sum += points[acc.idx].speed;
        acc.idx++;
      }
      while (acc.window.length > 0 && !isInWindow(point.time, acc.window[0].time)) {
        acc.sum -= acc.window.shift().speed;
      }
      if (acc.window.length > 0) {
        acc.values.push({ time : point.time, speed : acc.sum / acc.window.length });
      }
      return acc;
    }, { values : [], window : [], sum : 0, idx : 0 }).values;
  }

   /**
             * inits slider and a small play/pause button
             */
  function init_slider(torqueLayer) {
    var torqueTime = $('#torque-time');
    $("#torque-slider").slider({
      min: 0,
      max: torqueLayer.options.steps,
      value: 0,
      step: 1,
      slide: function(event, ui){
        var step = ui.value;
        torqueLayer.setStep(step);
      }
    });
    // each time time changes, move the slider
    torqueLayer.on('change:time', function(changes) {
      $("#torque-slider" ).slider({ value: changes.step });
      var month_year = changes.time.toString().substr(4).split(' ');
      torqueTime.text(month_year[0] + " - " + month_year[2]);
      console.log(torqueLayer.getTime());
    });
    // play-pause toggle
    $("#torque-pause").click(function(){
      torqueLayer.toggle();
      $(this).toggleClass('playing');
    });
  };

   /**
             * inits slider and a small play/pause button
             */
  function init_slider(torqueLayer) {
    var torqueTime = $('#torque-time');
    $("#torque-slider").slider({
      min: 0,
      max: torqueLayer.options.steps,
      value: 0,
      step: 1,
      slide: function(event, ui){
        var step = ui.value;
        torqueLayer.setStep(step);
      }
    });
    // each time time changes, move the slider
    torqueLayer.on('change:time', function(changes) {
      $("#torque-slider" ).slider({ value: changes.step });
      var month_year = changes.time.toString().substr(4).split(' ');
      torqueTime.text(month_year[0] + " - " + month_year[2]);
      console.log(torqueLayer.getTime());
    });
    // play-pause toggle
    $("#torque-pause").click(function(){
      torqueLayer.toggle();
      $(this).toggleClass('playing');
    });
  };
     /**
               * inits slider and a small play/pause button
               */
  function init_slider(torqueLayer) {
    var torqueTime = $('#torque-time');
    $("#torque-slider").slider({
      min: 0,
      max: torqueLayer.options.steps,
      value: 0,
      step: 1,
      slide: function(event, ui){
        var step = ui.value;
        torqueLayer.setStep(step);
      }
    });

    // each time time changes, move the slider
    torqueLayer.on('change:time', function(changes) {
      $("#torque-slider" ).slider({ value: changes.step });
      var month_year = changes.time.toString().substr(4).split(' ');
      torqueTime.text(month_year[0] + " - " + month_year[2]);
      console.log(torqueLayer.getTime());
    });
    // play-pause toggle
    $("#torque-pause").click(function(){
      torqueLayer.toggle();
      $(this).toggleClass('playing');
    });

  };

  var gpxSource = document.getElementById('gpx-source').textContent;
  var parser = new DOMParser();
  var gpx = parser.parseFromString(gpxSource, 'text/xml');
  var track = htmlCollectionMap(gpx.getElementsByTagName('trkseg'), function (seg) {
    return htmlCollectionMap(seg.getElementsByTagName('trkpt'), function (pt) {
      var point = {
        lat : parseFloat(pt.getAttribute('lat')),
        lon : parseFloat(pt.getAttribute('lon'))
      };
      var ele = pt.getElementsByTagName('ele');
      if (ele.length > 0) {
        point.ele = parseFloat(ele.item(0).textContent);
      }
      var time = pt.getElementsByTagName('time');
      if (time.length > 0) {
        point.time = Date.parse(time.item(0).textContent) / 1000;
      }
      return point;
    });
  });

  var metadata = gpx.getElementsByTagName('metadata');
  console.log(metadata);
  var carto_tablename = htmlCollectionMap(gpx.getElementsByTagName('metadata'), function(metadata) {
    var tablename = metadata.getElementsByTagName('cartotable').item(0).textContent;
    return tablename;
  });
  /*
  var cartotable = metadata.getElementsByTagName('time');
  var carto_tablename = cartotable.item(0).textContent;
  console.log(carto_tablename);
*/

  var colors = ['red', 'blue', 'green', 'purple', 'yellow', 'orange'];
/*
  var bounds;
  var map = L.map('map');
  track.forEach(function (segment, idx) {
    var points = segment.map(function (point) { return [point.lat, point.lon]; });
    bounds = bounds ? bounds.extend(points) : new L.LatLngBounds(points);
    L.polyline(points, { color: colors[idx % colors.length] }).addTo(map);
  });
  map.fitBounds(bounds);

  var map = new L.Map('map', {
    zoomControl: true,
    zoom: 3
  });

  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ©CartoDB',
    maxZoom: 18
  }).addTo(map);
*/
  var map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(12.894620, 77.592582),
    zoom: 17,
    mapTypeId:google.maps.MapTypeId.TERRAIN,
    mapTypeControl:false,
    minZoom:1,
    scaleControl: false,
    streetViewControl: false,
    overviewMapControl: false,
  });
/*
  var bounds;
  track.forEach(function (segment, idx) {
    var points = segment.map(function (point) { return [point.lat, point.lon]; });
    bounds = bounds ? bounds.extend(points) : new google.maps.LatLngBounds(points);
    google.maps.polyline(points, { color: colors[idx % colors.length] }).addTo(map);
  });
  map.fitBounds(bounds);
*/
  var map_style = {};
  map_style.google_maps_customization_style = [
    {
/*
      stylers:[
        { invert_lightness:true },
        { weight:1 },
        { saturation:-100 },
        { lightness:-40 }
      ]
    },
    { */
      elementType:"labels",
      stylers:[
        { visibility:"simplified" }
      ]
    }
  ];
//  map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  map.setOptions({styles:map_style.google_maps_customization_style});
  var torqueLayer = new torque.GMapsTorqueLayer({
    provider   : 'sql_api',
    sql_api_port: '443',
    user       : 'thayumanavar77',
/*    query      : 'https://thayumanavar77.carto.com:443/api/v2/sql?q=select * from public.table_11_11_2016_runkeeper_run',*/
    table      : carto_tablename,
    column     : 'time',
    countby    : 'count(cartodb_id)',
    resolution: 10,
    steps: 1000,
    blendmode  : 'lighter',
    animationDuration: 50,
    loop: false,
    trails: true,
    map: map

  });
  var CARTOCSS = [
    'Map {',
    '-torque-time-attribute: "cartodb_id";',
    '-torque-aggregation-function: "1";',
    '-torque-frame-count: 500;',
    '-torque-animation-duration: 50;',
    '-torque-resolution: 1;',
    '-torque-data-aggregation:"cumulative";',
    '}',
    '#layer {',
    '  marker-type: ellipse;',
    '  marker-fill-opacity: 1.0;',
    '  stroke-width: 1',
    '  marker-fill: #F62817; ',
    '  marker-line-width: 6;',
    '  marker-line-opacity: 0.9;',
    '  marker-line-color: #E42217;',
    '  marker-width: 2;',
    '  marker-height: 2;',
    '  marker-allow-overlap: true',
    '  marker-placement: point',
    '}'
  ].join('\n');
  torqueLayer.setCartoCSS(CARTOCSS);
/*
  var torqueLayer = new L.TorqueLayer({
    user       : 'thayumanavar77',
    table      : 'table_11_11_2016_runkeeper_run',
    cartocss: CARTOCSS
  });
*/
  torqueLayer.error(function(err){
    for(error in err){
      console.warn(err[error]);
    }
  });
  torqueLayer.setMap(map);

/*  init_slider(torqueLayer); */
  torqueLayer.play();

  torqueLayer.on('change:steps', function(step) {
    // do something with step
    console.log('Current step is ' + step);
  });

  var timedTrack = track.map(function (segment) {
    return segment.filter(function (point) { return point.time > 0; });
  }).filter(function (segment) {
    return segment.length > 0;
  });
  var width = 1000;
  var height = 500;
  var margins = { top : 20, right : 20, bottom : 20, left : 80 };
  if (timedTrack.length > 0) {
    var start = minOnTrack(timedTrack, function (point) { return point.time; });
    var totalDuration = maxOnTrack(timedTrack, function (point) { return point.time; }) - start;
    var timeScale = d3.scaleLinear()
      .range([margins.left, width - margins.right])
      .domain([0, totalDuration]);
    var timeAxis = d3.axisBottom()
      .tickFormat(formatDuration)
      .tickValues(getDurationTicks(totalDuration))
      .tickSizeInner(-height)
      .tickSizeOuter(0)
      .scale(timeScale);
    var speedTrack = timedTrack.map(function (segment) {
      var speeds = [];
      var distanceToPrev = L.latLng(segment[0].lat, segment[0].lon).distanceTo(L.latLng(segment[1].lat, segment[1].lon));
      for (var i = 1; i < segment.length - 1; i++) {
        var duration = segment[i + 1].time - segment[i - 1].time;
        var distanceToNext = L.latLng(segment[i].lat, segment[i].lon).distanceTo(L.latLng(segment[i + 1].lat, segment[i + 1].lon));
        var distance = distanceToPrev + distanceToNext;
        var speed = (distance * 3600) / (duration * 1000);
        if (speed > 70) {
          console.log(speed, segment[i]);
        }
        speeds.push({ time : segment[i].time, speed : speed });
        distanceToPrev = distanceToNext;
      }
      return speeds;
    }).map(function (segment) {
      return averageWindow(segment, function (t1, t2) { return Math.abs(t1 - t2) < 15; });
    });
    var speedScale = d3.scaleLinear()
      .range([height - margins.top, margins.bottom])
      .domain([0, maxOnTrack(speedTrack, function (point) { return point.speed; })]);
    var speedAxis = d3.axisLeft()
      .tickSizeInner(-width)
      .tickSizeOuter(0)
      .tickFormat(function (speed) { return speed + ' km/h'; })
      .scale(speedScale);
    var speedGen = d3.line()
      .x(function(d) { return timeScale(d.time - start); })
      .y(function(d) { return speedScale(d.speed); });
    var speed = d3.select('#speed');
    speed.attr('viewBox', '0 0 ' + width + ' ' + height);
    speed.append('svg:g')
      .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
      .call(timeAxis);
    speed.append('svg:g')
      .attr('transform', 'translate(' + (margins.left) + ',0)')
      .call(speedAxis);
    speedTrack.forEach(function (segment, idx) {
      speed.append('svg:path')
        .attr('d', speedGen(segment))
        .attr('stroke', colors[idx % colors.length])
        .attr('stroke-width', 1)
        .attr('fill', 'none');
    });
    var elevationTrack = track.map(function (segment) {
      return segment.filter(function (point) { return typeof point.ele != 'undefined'; });
    }).filter(function (segment) {
      return segment.length > 0;
    });
    if (elevationTrack.length > 0) {
      var elevationScale = d3.scaleLinear()
        .range([height - margins.top, margins.bottom])
        .domain([minOnTrack(timedTrack, function (point) { return point.ele; }), maxOnTrack(timedTrack, function (point) { return point.ele; })]);
      var elevationAxis = d3.axisLeft()
        .tickSizeInner(-width)
        .tickSizeOuter(0)
        .tickFormat(function (elevation) { return elevation + ' m'; })
        .scale(elevationScale);
      var elevationGen = d3.line()
        .x(function(d) { return timeScale(d.time - start); })
        .y(function(d) { return elevationScale(d.ele); });
      var elevation = d3.select('#elevation');
      elevation.attr('viewBox', '0 0 ' + width + ' ' + height);
      elevation.append('svg:g')
        .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
        .call(timeAxis);
      elevation.append('svg:g')
        .attr('transform', 'translate(' + (margins.left) + ',0)')
        .call(elevationAxis);
      elevationTrack.forEach(function (elevations, idx) {
        elevation.append('svg:path')
          .attr('d', elevationGen(elevations))
          .attr('stroke', colors[idx % colors.length])
          .attr('stroke-width', 1)
          .attr('fill', 'none');
      });
    }
  } else {
    var elevationDistanceTrack = track.reduce(function (acc, segment) {
      var s = segment.reduce(function (acc, point) {
        var pt = L.latLng(point.lat, point.lon);
        acc.distance += pt.distanceTo(acc.prev);
        acc.prev = pt;
        if (typeof point.ele != 'undefined') {
          acc.points.push({ ele : point.ele, distance : acc.distance });
        }
        return acc;
      }, { distance : acc.distance, prev : L.latLng(segment[0].lat, segment[0].lon), points : [] });
      if (s.points.length > 0) {
        acc.segments.push(s.points);
      }
      acc.distance = s.distance;
      return acc;
    }, { distance : 0, segments : [] }).segments
    if (elevationDistanceTrack.length > 0) {
      var elevationDistanceScale = d3.scaleLinear()
        .range([height - margins.top, margins.bottom])
        .domain([minOnTrack(elevationDistanceTrack, function (point) { return point.ele; }), maxOnTrack(elevationDistanceTrack, function (point) { return point.ele; })]);
      var distanceScale = d3.scaleLinear()
        .range([margins.left, width - margins.right])
        .domain([0, maxOnTrack(elevationDistanceTrack, function (point) { return point.distance; })]);
      var elevationDistanceAxis = d3.axisLeft()
        .tickFormat(function (elevation) { return elevation + ' m'; })
        .tickSizeInner(-width)
        .tickSizeOuter(0)
        .scale(elevationDistanceScale);
      var distanceAxis = d3.axisBottom()
        .tickSizeInner(-height)
        .tickSizeOuter(0)
        .tickFormat(formatDistance)
        .scale(distanceScale);
      var elevationDistanceGen = d3.line()
        .x(function(d) { return distanceScale(d.distance); })
        .y(function(d) { return elevationDistanceScale(d.ele); });
      var elevation = d3.select('#elevation');
      elevation.attr('viewBox', '0 0 ' + width + ' ' + height);
      elevation.append('svg:g')
        .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
        .call(distanceAxis);
      elevation.append('svg:g')
        .attr('transform', 'translate(' + (margins.left) + ',0)')
        .call(elevationDistanceAxis);
      elevationDistanceTrack.forEach(function (elevations, idx) {
        elevation.append('svg:path')
          .attr('d', elevationDistanceGen(elevations))
          .attr('stroke', colors[idx % colors.length])
          .attr('stroke-width', 1)
          .attr('fill', 'none');
      });
    }
  }
})();
