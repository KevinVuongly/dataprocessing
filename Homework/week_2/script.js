// Name: Kevin Vuong
// Student number: 10730141

var xhr = new XMLHttpRequest();

xhr.open('GET', 'https://kevinvuongly.github.io/DataProcessing/Homework/week_2/data/KNMI.csv', true);
xhr.send();

xhr.onreadystatechange = function(){
  // if retrieving the data goes correctly
  if (xhr.readyState == 4 && xhr.status == 200){
    // get hold of the data
    var rawdata = xhr.responseText;

    // put the rawdata in the html file
    document.getElementById('rawdata').innerHTML = rawdata;

    var dataStruct = document.getElementById('rawdata');
    var rawdata = dataStruct.value;

    // hide the data
    if (dataStruct.style.display == 'none'){
      dataStruct.style.display = 'block';
    }
    else {
      dataStruct.style.display = 'none';
    }

    // constructing data in lists
    rawdata = rawdata.split("\n");
    rawdata.splice(rawdata.length-1, 1);

    var date = [];
    var temperature = [];

    date, temperature = splitElement(date, temperature, rawdata);

    date = removeSpaces(date);
    temperature = removeSpaces(temperature);

    var days = date.length;
    var info = 2;
    var data = createMatrix(days, info);

    // put relevant data in a matrix
    for (var i = 0; i < date.length; i++){
      data[i][0] = date[i];
      data[i][0] = data[i][0].slice(0, 4) + '/' + data[i][0].slice(4, 6) +
                    '/' + data[i][0].slice(6, 8);
      data[i][0] = new Date(data[i][0]);

      data[i][1] = Number(temperature[i]);
    }

    // constructing range of screen and data respectively
    var rangeTemp = [0, 400];
    var domainTemp = [Math.min.apply(0, temperature),
                      Math.max.apply(0, temperature)];

    // get hold of the canvas
    var canvas = document.getElementById('myCanvas');

    // add padding to the canvas
    var padding = 160;

    // this is the width and height of the plot
    var plotWidth = 2 * days;
    var plotHeight = rangeTemp[1] - rangeTemp[0];

    // plotsize plus padding
    canvas.width = plotWidth + padding;
    canvas.height = plotHeight + 2 * padding;

    // object representing two-dimensional rendering context
    var ctx = canvas.getContext('2d');

    // calculate y-position of data for the plot
    var position = createTransform(domainTemp, rangeTemp);

    // initialize title of graph
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('Average temperature in De Bilt(NL)',
                  canvas.width / 2, 50);

    ctx.font = '24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('november 9th 2014 - november 9th 2015',
                  canvas.width / 2, 80 );

    // draw y-axis
    drawLine(ctx, padding / 2, padding / 2,
             position(300) + padding, position(-50) + padding);

    for (var i = 0; i < 8; i++){
      var yAxisPositionX = padding / 2;
      var yAxisPositionY = position(-50 + 50 * i) + padding;
      if (-50 + 50 * i != 0){
        drawLine(ctx, yAxisPositionX, yAxisPositionX + 10,
                 yAxisPositionY, yAxisPositionY);
        ctx.save()
        ctx.lineWidth=0.09;
        drawLine(ctx, yAxisPositionX, canvas.width - padding / 2,
                 yAxisPositionY, yAxisPositionY);
        ctx.restore();
      }
      ctx.font = '12px serif';
      ctx.textAlign = 'left';
      ctx.fillText(-5 + 5 * i, padding / 2 - 20, yAxisPositionY);
    }

    // y-axis information
    ctx.save();
    ctx.translate(padding / 4, canvas.height / 2);
    ctx.rotate(270 * Math.PI / 180);
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    var degree = 176;
    ctx.fillText('Temperature in Celsius (' +
                  String.fromCharCode(degree) + 'C)', 0, 0);
    ctx.restore()

    // draw x-axis
    drawLine(ctx, padding / 2, canvas.width - padding / 2,
             position(0) + padding, position(0) + padding);

    var months = ['9th nov', '9th dec', '9th jan', '9th feb', '9th mar',
                  '9th apr', '9th may', '9th jun', '9th jul','9th aug',
                  '9th sept', '9th oct', '9th nov'];

    for (var i = 0, amountOfMonths = 12; i <= amountOfMonths; i++){
      var xAxisPositionX = padding / 2 + (plotWidth / amountOfMonths) * i;
      var xAxisPositionY = position(0) + padding;
      if ( i > 0){
        drawLine(ctx, xAxisPositionX, xAxisPositionX,
                 xAxisPositionY, xAxisPositionY - 10);
      }

      ctx.save();
      ctx.translate(xAxisPositionX, xAxisPositionY + 30);
      ctx.rotate(45 * Math.PI / 180);
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText(months[i], 0, 0);
      ctx.restore();
    }

    // day 53 is when it's 2015
    var yearSwitch = 53;

    // draw line to split graph in 2014 and 2015
    drawLine(ctx, padding / 2 + 2 * yearSwitch, padding / 2 + 2 * yearSwitch,
             position(0) + padding, position(-50) + padding);

    // add 2014 text
    ctx.save();
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.fillText('2014', padding / 2 + yearSwitch, position(-50) + padding);
    ctx.restore()

    // add 2015 text
    ctx.save();
    ctx.font = '30px serif';
    ctx.textAlign = 'center';
    ctx.fillText('2015', (plotWidth / amountOfMonths) * 2 + 2 * yearSwitch,
                  position(-50) + padding);
    ctx.restore()

    // drawing the data in graph
    var yStart = position(data[0][1]);

    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(padding / 2, yStart + padding);
    for (var i = 1; i < data.length; i++){
      var y = position(data[i][1]);
      ctx.lineTo(padding / 2 + plotWidth / data.length * i,
                 y + padding);
    }
    ctx.stroke();
  }
  // if getting hold of the data file fails
  else if (xhr.readyState == 4 && xhr.status >= 404){
     alert('Couldn\'t find the file.');
  }
}

/////////////////////////////////////////////////////////

// initialize a matrix
function createMatrix(rows, columns){
  var matrix = [];

  for(var i=0; i < rows; i++) {
    matrix[i] = new Array(columns);
  }

  return matrix;
}

// splits a string in two element when it sees an ','
function splitElement(part1, part2, data){
  for (var i = 0; i < data.length; i++){
    var split = data[i].split(',');
    part1.push(split[0]);
    part2.push(split[1]);
  }

  return part1, part2;
}

// removes blank space in every string element in a list
function removeSpaces(array){

  for (var i = 0; i < array.length; i++)
  {
    array[i] = array[i].replace(/ /g, '');
  }

  return array;
}

// draws a line
function drawLine(context, xOld, xNew, yOld, yNew){
  context.beginPath();
  context.moveTo(xOld, yOld);
  context.lineTo(xNew, yNew);
  context.stroke();
}

// calculates y-position in the plot for the data
function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domainMin, domainMax]
	// range is a two-element array of the screen bounds [rangeMin, rangeMax]
	// this gives you two equations to solve:
	// rangeMin = alpha * domainMin + beta
	// rangeMax = alpha * domainMax + beta
 		// a solution would be:

    var domainMin = domain[0]
    var domainMax = domain[1]
    var rangeMin = range[0]
    var rangeMax = range[1]

    // formulas to calculate the alpha and the beta
   	var alpha = (rangeMax - rangeMin) / (domainMax - domainMin)
    var beta = rangeMax - alpha * domainMax

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return rangeMax - (alpha * x + beta);
    }
}
