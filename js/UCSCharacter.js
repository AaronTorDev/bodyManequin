/*
 * Copyright (c) 2014, Fashiontec (http://fashiontec.org)
 * Licensed under LGPL, Version 3
 */
THREE.prototype = function() {

	var scope = this;
	
	var mesh;

	this.scale = 1;

	this.root = new THREE.Object3D();
	
	this.numSkins;
	this.numMorphs;
	
	this.skins = [];
	this.materials = [];
	this.morphs = [];
    	this.morphslimit=[];
	this.morphslowlimit=[];
	this.morphshighlimit=[];
	this.onLoadComplete = function () {};
	
	this.loadCounter = 0;

	this.loadParts = function ( config ) {
		
		
		this.numMorphs = config.morphs.length;
	// Character geometry + number of skins
		this.loadCounter = 1 + config.skins.length;
		
		// SKINS
		this.skins = loadTextures( config.baseUrl + "skins/", config.skins );
		this.materials = createMaterials( this.skins );
		
		// MORPHS
		this.morphs = config.morphs;
		this.morphslimit=config.morphslimit;
		this.morphslowlimit=config.morphslowlimit;
		this.morphshighlimit=config.morphshighlimit;
		// CHARACTER
		var loader = new THREE.JSONLoader();
		
		console.log( config.baseUrl + config.character  );
		loader.load( config.baseUrl + config.character, function( geometry ) {
			
			geometry.computeBoundingBox();
			geometry.computeVertexNormals();
           
		
			mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial() );
			scope.root.add( mesh );
			
			var bb = geometry.boundingBox;
			scope.root.scale.set( config.s, config.s, config.s );
			scope.root.position.set( config.x, config.y - bb.min.y * config.s, config.z );

			mesh.castShadow = true;
			mesh.receiveShadow = true;
           
		
			scope.setSkin(0);
			
			scope.checkLoadComplete();
		} );
	
	};
	
	this.setSkin = function( index ) {
		if ( mesh && scope.materials ) {
			mesh.material = scope.materials[ index ];
		}
	};
	
	this.updateMorphs = function( influences ) {
	
		if ( mesh ) {
			for ( var i = 0; i < scope.numMorphs; i ++ ) {
			console.log(scope.numMorphs);
				mesh.morphTargetInfluences[ i ] = (influences[ scope.morphs[ i ] ]-scope.morphslimit[i]) / (scope.morphshighlimit[i]-scope.morphslowlimit[i]);
			}
		}
	};
	
	function loadTextures( baseUrl, textureUrls ) {
		var mapping = new THREE.UVMapping();
		var textures = [];

		for ( var i = 0; i < textureUrls.length; i ++ ) {

			textures[ i ] = THREE.ImageUtils.loadTexture( baseUrl + textureUrls[ i ], mapping, scope.checkLoadComplete );
			textures[ i ].name = textureUrls[ i ];

		}

		return textures;
	};

	function createMaterials( skins ) {
		var materials = [];
		
		for ( var i = 0; i < skins.length; i ++ ) {

			materials[ i ] = new THREE.MeshPhongMaterial( {
				color: 0xeeeeee,
				specular: 10.0,
				map: skins[ i ],
				skinning: false,
				morphTargets: true,
				wrapAround: true
			} );

		}
		
		return materials;
	}

	this.checkLoadComplete = function () {

		scope.loadCounter -= 1;

		if ( scope.loadCounter === 0 ) {

			scope.onLoadComplete();

		}

	}

}
