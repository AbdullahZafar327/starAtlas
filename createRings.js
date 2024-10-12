import * as THREE from 'three'
import { CustomMaterial } from './CustomMaterial';


export class CreateRings{
    geometry = new THREE.BufferGeometry()
    material;
    points;


    constructor(chapterWrapper3DObject,radius = 0.01,numOfPoints = 8,startAngle = 0,endAngle = 2 * Math.PI,menu,type = "ring",color = new THREE.Color(0x524802),customMaterial = null,sharedMaterial = null, identifierName){

      this._buildGeometry(
             radius,
             numOfPoints,
             startAngle,
             endAngle,
             color
          )

          this.material = sharedMaterial || new CustomMaterial(
            type === "poi ring"
              ? {
                  focusNear: 10,
                  focusFar: 40,
                  focusFadeOutLength: 50,
                  minBlur: 0.07,
                  minOpacity: 0,
                  maxOpacity: 0.8,
                  maxBlur: 0.2,
                }
              : customMaterial || {
                  focusNear: 30,
                  focusFar: 60,
                  focusFadeOutLength: 50,
                  minBlur: 0.1,
                  minOpacity: 0,
                  maxOpacity: 0.55,
                  maxBlur: 0.11,
                },
            menu,
            type
          );

          this.points = new THREE.Points(this.geometry,this.material)
          this.points.name = identifierName
          chapterWrapper3DObject.add(this.points)
    }

    _buildGeometry(radius,numOfPoints,startAngle,endAngle,color){
       numOfPoints = Math.max(3,numOfPoints)
       const positions = []
       const colors = []
       const sizes = new Float32Array(numOfPoints)

       const tempVector = new THREE.Vector3()

       for (let i = 0; i < numOfPoints; i++) {
        const angle = startAngle + ( i  / numOfPoints) * endAngle;
        tempVector.x = radius * Math.cos(angle)
        tempVector.y = radius * Math.sin(angle)
        
        positions.push(tempVector.x , tempVector.y , tempVector.z)
        colors.push(color.r,color.g,color.b)
        sizes[i] = 50
        
       }

       this.geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
       this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
       this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
     
       this.geometry.computeBoundingSphere();
    }
}