import * as THREE from 'three'
import { DracoLoader } from '@loaders.gl/draco';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { load } from '@loaders.gl/core'

export class AssetManager extends THREE.Loader {
  constructor(onComplete) {
    super();

    // Variables and State
    this.allChapters = [];
    this.loadItems = new Map();
    this.currentlyLoaded = 0;
    this.additionalLoads = 0;
    this.additionalLoadsCompleted = 0;
    this.loadedPaths = [];
    this.loadDoneCallback = onComplete;

    // Configuration for DracoLoader tasks
    this.taskConfig = {
      attributes :{
        position: 'POSITION',
        color: 'COLOR_0',
        uv: 'TEXCOORD_0',
        size: "GENERIC"
      }
    };


    // Setup the loaders
    this.gltfLoader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader()

    this._setupLoaders();
  }

  // Setup the loaders
  async _setupLoaders () {
    this.dracoLoader.setDecoderPath("jsm/libs/draco/")
    this.dracoLoader.setDecoderConfig({
      type: "js"
    })

    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  _loadTexture(path) {

    this.additionalLoads++;
    return new THREE.TextureLoader().load(
      path,
      (texture) => {
        this.additionalLoadsCompleted++;
        this._checkIfLoadDone();
        return texture;
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );
  }

  // Set chapters and prepare for loading
  _setChapters(listOfAllChapters) {
    this.allChapters = listOfAllChapters;
    this.allChapters.forEach(chapter => {
        chapter._getLoadItems().forEach(item => {
            const [path, name , format] = item;
            const loadDetails = { path, name,format, doneCallback:(geometry,path,name) => chapter._loadedItem(geometry,path,name) };

            if (this.loadItems.has(path)) {
                this.loadItems.get(path).push(loadDetails);
            } else {
                this.loadItems.set(path, [loadDetails]);
            }
        });
    });
  }


  // Add individual items to the loading queue
  _addLoadItem(loadItem) {
    const { path } = loadItem;
    if (this.loadItems.has(path)) {
      this.loadItems.get(path).push(loadItem);
    } else {
      this.loadItems.set(path, [loadItem]);
    }
  }

  // Load GLTF model
  _loadGLTF(path, doneCallback ) {
    this.additionalLoads++;
    this.gltfLoader.load(
      path,
      (gltf) => {
        this.additionalLoadsCompleted++;
        this._checkIfLoadDone();
        doneCallback( gltf);
      },
      function(t){},
      (error) => {
        console.error("Error loading GLTF:", error);
      }
    );
  }

  // Load Draco-compressed geometry
  _loadDraco(path, onSuccess, onProgress, onError) {
    const fileLoader = new THREE.FileLoader(this.manager);
    fileLoader.setResponseType("arraybuffer");
    fileLoader.setRequestHeader(this.requestHeader);
    fileLoader.setWithCredentials(this.withCredentials);

    fileLoader.load(
      path,
      (data) => {
         if (data.byteLength === 0) {
            console.error("File loaded but is empty or detached.");
         } else {
          const clonedData = data.slice(0);
          this._DracoLoadData(clonedData).then(loadedData => {
            const geometry = this._getDracoGeometry(loadedData);
            return geometry
            
          }).then(onSuccess).catch(onError)
        }
      },
      onProgress,
      (error) => {
         console.error("Error loading the file:", error);
      }
   )
}

  async _DracoLoadData(url) {
  const loadedData = await load(url, DracoLoader, {
       draco:{
         attributeNameEntry : {
          ...this.taskConfig.attributes
        }
       }
    
   });
  return loadedData;
  }

  _getDracoGeometry(loadedData) {
    

    
    const positionArray = loadedData.attributes.POSITION ?loadedData.attributes.POSITION.value : null;
    const colorArray = loadedData.attributes.COLOR ? loadedData.attributes.COLOR.value : null;
    const uvArray = loadedData.attributes.TEX_COORD ? loadedData.attributes.TEX_COORD.value : null;
    const sizeArray = loadedData.attributes.GENERIC ? loadedData.attributes.GENERIC.value : null;

  


    const geometry = new THREE.BufferGeometry()
    if(positionArray) geometry.setAttribute("position",new THREE.BufferAttribute(positionArray,3))
    if(colorArray)  geometry.setAttribute("customColor",new THREE.BufferAttribute(colorArray,3))
    geometry.deleteAttribute("color")
    if(uvArray ) geometry.setAttribute("uv",new THREE.BufferAttribute(uvArray,2))
    if(sizeArray) geometry.setAttribute("size",new THREE.BufferAttribute(sizeArray,1))


    if (loadedData.indices) {
      geometry.setIndex(new THREE.BufferAttribute(loadedData.indices.value, 1));
    }
  
    return geometry;
  }
  

  // Start loading all assets
  _startLoading() {
    this.loadItems.forEach((items, path) => {
      if (items[0].format === "drc") { // Check if the file is DRACO (.drc)
        this._loadDraco(
          items[0].path,
          (geometry)=>{
               this._onItemLoaded(geometry,items)
          },
          function (progressFn) {},
          function (onError){
            console.log("An error happened",onError)
          }
        )
    
      } 
    });
  }

  // Increment load counter
  _onItemLoaded(geometry,items) {
    this.currentlyLoaded++;
    
    items.forEach((item) => {
      if (typeof item.doneCallback === 'function') {
        geometry.name = item.name
        item.doneCallback(geometry, item.path, item.name);
      } else {
        console.error('doneCallback is not a function for item:', item);
      }
    });
    
    this._checkIfLoadDone();
  }

  // Check if all assets have been loaded
  _checkIfLoadDone() {
    const totalItems = this.loadItems.size + this.additionalLoads;
    const loadedItems = this.currentlyLoaded + this.additionalLoadsCompleted;
    if (totalItems - 1 === loadedItems) {
      console.log("this has been done")
      this._finallyItsDone();
    }
  }

  // Final callback when loading is complete // here we will set the loading screen to false on the main page
  _finallyItsDone() {
    this.dracoLoader.dispose();
    if (this.loadDoneCallback) {
      this.loadDoneCallback();
    }
  }


}
