function createBlock(vertices, color){
	
	//Now create the surfaces
	var surfaces = [];
	
	//Calculate the surfaces
	var surf1vertices = [vertices[0], vertices[3], vertices[2], vertices[1]]; //bottom
	var surf2vertices = [vertices[4], vertices[5], vertices[6], vertices[7]]; //top
	var surf3vertices = [vertices[0], vertices[1], vertices[5], vertices[4]]; //back
	var surf4vertices = [vertices[2], vertices[3], vertices[7], vertices[6]]; //front
	var surf5vertices = [vertices[1], vertices[2], vertices[6], vertices[5]]; //left
	var surf6vertices = [vertices[3], vertices[0], vertices[4], vertices[7]]; //right
	var surface1 = createSurface(surf1vertices, color);
	var surface2 = createSurface(surf2vertices, color);
	var surface3 = createSurface(surf3vertices, color);
	var surface4 = createSurface(surf4vertices, color);
	var surface5 = createSurface(surf5vertices, color);
	var surface6 = createSurface(surf6vertices, color);
	surfaces[0] = surface1;
	surfaces[1] = surface2;
	surfaces[2] = surface3;
	surfaces[3] = surface4;
	surfaces[4] = surface5;
	surfaces[5] = surface6;
	
	//Now we will assign the attributes to the block
	var block = {
		vertices: vertices,
		color: color,
		surfaces: surfaces
	};
	
	return block;
}
//--------------------------------------------------------------------------
function paintBlock(ctx, block, yob, XFOVangle, YFOVangle){
	//Depth order the surfaces first so we can paint them in order
	var outOfOrder = true;
	var madeAChange = false;
	var references = [];
	for (var i = 0; i < block.vertices.length; i++){
		references[i] = i;
	}
	var depths = [];
	for (var i = 0; i < block.surfaces.length; i++){
		depths[i] = getSurfaceDepth(block.surfaces[i]);
	}
	while(outOfOrder){
		madeAChange = false;
		for (var i = 0; i < references.length - 1; i++){
			if (depths[i] > depths[i + 1]){
				var buffer = references[i + 1];
				references[i + 1] = references[i];
				references[i] = buffer;
				buffer = depths[i + 1];
				depths[i + 1] = depths[i];
				depths[i] = buffer;
				madeAChange = true;
			}
		}
		if (!madeAChange){outOfOrder = false;}
	}
	//Now that the surfaces are depth ordered we can paint them.
	for (var i = 0; i < block.surfaces.length; i++){
		paintSurface(ctx, block.surfaces[references[i]], yob, XFOVangle, YFOVangle);
	}
}
//--------------------------------------------------------------------------
function rotateBlock(block, rotationAxisPoint, rotationAxisVector, angle){
	var newVertices = [];
	for (var i = 0; i < block.vertices.length; i++){
		newVertices[i] = rotate3D(block.vertices[i], rotationAxisPoint, rotationAxisVector, angle);
	}
	return createBlock(newVertices, block.color);
}
//--------------------------------------------------------------------------
function generateBlockVertices(origin, width, length, height){
	
	var vertices = [];
	
	//Initially, we will set every vertex of the block at the origin
	for (var i = 0; i < 8; i++){
		var points = [];
		for (var j = 0; j < 3; j++){
			points[j] = origin[j];
		}
		vertices[i] = points;
	}
	
	//Now we will slide each vertex to its correct location.
	vertices[1][0] += width;
	vertices[2][0] += width;
	vertices[2][1] += length;
	vertices[3][1] += length;
	vertices[4][2] += height;
	vertices[5][2] += height;
		vertices[5][0] += width;
	vertices[6][2] += height;
		vertices[6][0] += width;
		vertices[6][1] += length;
	vertices[7][2] += height;
		vertices[7][1] += length;
		
	return vertices;
		
}
//--------------------------------------------------------------------------
function generateBlockSurfaces(vertices, color){
	
	var surfaces = [];
	
	//Calculate the surfaces
	var surf1vertices = [vertices[0], vertices[3], vertices[2], vertices[1]]; //bottom
	var surf2vertices = [vertices[4], vertices[5], vertices[6], vertices[7]]; //top
	var surf3vertices = [vertices[0], vertices[1], vertices[5], vertices[4]]; //back
	var surf4vertices = [vertices[2], vertices[3], vertices[7], vertices[6]]; //front
	var surf5vertices = [vertices[1], vertices[2], vertices[6], vertices[5]]; //left
	var surf6vertices = [vertices[3], vertices[0], vertices[4], vertices[7]]; //right
	var surface1 = createSurface(surf1vertices, color);
	var surface2 = createSurface(surf2vertices, color);
	var surface3 = createSurface(surf3vertices, color);
	var surface4 = createSurface(surf4vertices, color);
	var surface5 = createSurface(surf5vertices, color);
	var surface6 = createSurface(surf6vertices, color);
	surfaces[0] = surface1;
	surfaces[1] = surface2;
	surfaces[2] = surface3;
	surfaces[3] = surface4;
	surfaces[4] = surface5;
	surfaces[5] = surface6;
	
	return surfaces;
	
}
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------
//--------------------------------------------------------------------------