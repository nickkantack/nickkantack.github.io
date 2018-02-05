function letterSurfaces(lowerLeftCorner, height, normalVector, letter, color, yob, XFOVangle, YFOVangle){
	
	//Create principal vertices
	var surfaces = [];
	switch (letter){
		case "A":
			var vertices = [[0, 0, 0], [0.4, 0, 1], [0.6, 0, 1], [1, 0, 0], [0.86, 0, 0], [0.7, 0, 0.4], [0.3, 0, 0.4], [0.33, 0, 0.5], [0.65, 0, 0.5], [0.5, 0, 0.9], [0.14, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "B":
			var vertices = [[0, 0, 0], [0, 0, 1], [0.8, 0, 1], [0.9, 0, 0.9], [0.9, 0, 0.6], [1, 0, 0.5], [1, 0, 0.1], [0.9, 0, 0], [0.19, 0, 0], [0.19, 0, 0.2], [0.8, 0, 0.2], [0.8, 0, 0.4], [0.19, 0, 0.4], [0.19, 0, 0.6], [0.7, 0, 0.6], [0.7, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "C":
			var vertices = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0.2], [1, 0, 0.2], [1, 0, 0], [0, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "D":
			var vertices = [[0, 0, 0], [0, 0, 1], [0.70, 0, 1], [1, 0, 0.70], [1, 0, 0.3], [0.70, 0, 0], [0.19, 0, 0], [0.19, 0, 0.2], [0.70, 0, 0.2], [0.8, 0, 0.3], [0.8, 0, 0.70], [0.70, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "E":
			var vertices = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0.6], [0.6, 0, 0.6], [0.6, 0, 0.4], [0.2, 0, 0.4], [0.2, 0, 0.2], [1, 0, 0.2], [1, 0, 0], [0, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "F":
			var vertices = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0.6], [0.6, 0, 0.6], [0.6, 0, 0.4], [0.2, 0, 0.4], [0.2, 0, 0], [0, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "G":
			var vertices = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0.2], [0.7, 0, 0.2], [0.8, 0, 0.3], [0.8, 0, 0.4], [0.6, 0, 0.4], [0.6, 0, 0.6], [1, 0, 0.6], [1, 0, 0], [0.8, 0, 0], [0.8, 0, 0.1], [0.7, 0, 0], [0, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "H":
		
		break;
		case "I":
		
		break;
		case "J":
		
		break;
		case "K":
		
		break;
		case "L":
		
		break;
		case "M":
		
		break;
		case "N":
			var vertices = [[0, 0, 0], [0, 0, 1], [0.2, 0, 1], [0.8, 0, 0.3], [0.8, 0, 1], [1, 0, 1], [1, 0, 0], [0.8, 0, 0], [0.2, 0, 0.7], [0.2, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "O":
			var vertices = [[0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0], [0.19, 0, 0], [0.19, 0, 0.2], [0.8, 0, 0.2], [0.8, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "P":
			var vertices = [[0, 0, 0], [0, 0, 1], [0.9, 0, 1], [1, 0, 0.9], [1, 0, 0.5], [0.9, 0, 0.4], [0.19, 0, 0.4], [0.19, 0, 0.6], [0.9, 0, 0.6], [0.9, 0, 0.8], [0.2, 0, 0.8], [0.2, 0, 0]];
			var surface = createSurface(vertices, color);
			surfaces.push(surface);
		break;
		case "Q":
		
		break;
		case "R":
		
		break;
		case "S":
		
		break;
		case "T":
		
		break;
		case "U":
		
		break;
		case "V":
		
		break;
		case "W":
		
		break;
		case "X":
		
		break;
		case "Y":
		
		break;
		case "Z":
		
		break;
		case "0":
		
		break;
		case "1":
		
		break;
		case "2":
		
		break;
		case "3":
		
		break;
		case "4":
		
		break;
		case "5":
		
		break;
		case "6":
		
		break;
		case "7":
		
		break;
		case "8":
		
		break;
		case "9":
		
		break;
	}

	//scale letter
	for (var i = 0; i < surfaces.length; i++){
		for (var j = 0; j < surfaces[i].vertices.length; j++){
			for (var k = 0; k < 3; k++){
				surfaces[i].vertices[j][k] *= height;
			}
		}
	}
	
	//slide letter
	for (var i = 0; i < surfaces.length; i++){
		for (var j = 0; j < surfaces[i].vertices.length; j++){
			for (var k = 0; k < 3; k++){
				surfaces[i].vertices[j][k] += lowerLeftCorner[k];
			}
		}
	}
	
	//Rotate letter
	var defaultNormalVector = [0, 1, 0];
	var rotationAxisPoint = lowerLeftCorner;
	var rotationAxisDirection = CP(defaultNormalVector, normalVector);
	var angle = angleBetween(defaultNormalVector, normalVector);
	
	if (mag(rotationAxisDirection) > 0){//If the default normal vector happens to be the desired normal vector, do not rotate
		for (var i = 0; i < surfaces.length; i++){
			surfaces[i] = rotateSurface(surfaces[i], rotationAxisPoint, rotationAxisDirection, angle);
		}
	}
	
	return surfaces;
	
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------