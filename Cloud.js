import * as THREE from 'three'
import { CustomMaterial } from './CustomMaterial';
import { GlobalsLanding } from './compaitable';
import gsap from 'gsap'

export class Cloud{
    material;
    _container;
    _menu;
    _chapters;
    _group = new THREE.Group()

    constructor(loadingManager,mainGroup,numOfChapters,menu){
        this._loadingManager = loadingManager;
        this._container = mainGroup;
        this._menu = menu;
        this._chapters  = numOfChapters;

        this.material = new CustomMaterial(
              {
                focusNear: 0.01,
                focusFar: 160,
                focusFadeOutLength: 28,
                maxBlur: 0.11,
                minBlur: 0.05,
                minOpacity: 0,
                maxOpacity: 0.28,
              },
              this._menu,
              "ClusterCloud"
        )

        this._container.add(this._group)
        this._loadingManager._addLoadItem(
            {
               path: '/model/ship2.glb' ,
               name: 'cluster',
               format:"glb",
               doneCallBack: this._setupGeometry()
            }
        )

    }


    _setupGeometry(geometry){
     let cluster;
     let spacing = 5078.0 / 10;

     for(let clusterIndex = 0;clusterIndex < this._chapters; clusterIndex++){
        let basePositionZ = (clusterIndex - 1) * GlobalsLanding.CHAPTER_DISTANCE;

        for (let clusterIndex = 0; clusterIndex < 3; clusterIndex++) {
            cluster = new THREE.Points(geometry,this.material)
            cluster.scale.set(0.1,0.1,0.1)
            cluster.position.set(0,0,basePositionZ + clusterIndex * spacing);

            gsap.to(cluster.rotation,{
                z: 2 * Math.PI,
                duration:200,
                repeat:-1,
                ease:"none"
            })

            gsap.to(cluster.position,{
                z: `-=${spacing}`,
                duration:100,
                repeat:-1,
                ease:"none"
            })

            this._group.add(cluster)
            
        }
     }
    }
}