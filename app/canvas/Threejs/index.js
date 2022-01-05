import * as THREE from 'three'
import gsap from 'gsap'

import vertex from 'shaders/vertex.glsl'
import fragment from 'shaders/fragment.glsl'

export default class {
    constructor() {

        this.clock = new THREE.Clock()

        this.threejsCanvas = document.querySelector('.threejs__canvas__container')
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000)
        this.camera.position.set(0, 0, 4)

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.threejsCanvas.appendChild(this.renderer.domElement)

        const geometry = new THREE.SphereBufferGeometry(1, 50, 50)
        // console.log(geometry)

        const count = geometry.attributes.position.count //number of vertices in the geometry
        const randoms = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            randoms[i] = Math.random()
        }
        // console.log(randoms)

        geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

        this.material = new THREE.ShaderMaterial({
            vertexShader: vertex,
            fragmentShader: fragment,
            uniforms: {
                uTime: { value: 0 },
                uHoverState: { value: 0 },
                uColor: { value: new THREE.Color(0x31c48D) },
                uColor1: { value: new THREE.Color(0x6C63FF) },
            }
        })

        this.object = new THREE.Mesh(geometry, this.material)

        this.scene.add(this.object)

        this.raycaster = new THREE.Raycaster()

        this.mouse = new THREE.Vector2()
    }

    onMouseDown(event) {

       
    }

    onMouseUp(event) {
        
    }

    onMouseMove(event) {

        this.mouse.x = (event.clientX / this.width) * 2 - 1
        this.mouse.y = - (event.clientY / this.height) * 2 + 1

        this.raycaster.setFromCamera(this.mouse, this.camera)

        const objects = [this.object]
        this.intersects = this.raycaster.intersectObjects(objects)

        if (this.intersects.length > 0) {
            console.log('intersect')
            gsap.to(this.material.uniforms.uHoverState, {
                value: 1,
                ease: 'expo.inOut'
            })
        } else {
            gsap.to(this.material.uniforms.uHoverState, {
                value: 0,
                ease: 'expo.inOut'
            })
            
        }

    }

    update() {
        this.renderer.render(this.scene, this.camera)

        this.object.rotation.x += 0.01;
        this.object.rotation.y += 0.01;

        const elapsedTime = this.clock.getElapsedTime()
        this.material.uniforms.uTime.value = elapsedTime
    }


    onResize() {
        this.width = this.threejsCanvas.offsetWidth
        this.height = this.threejsCanvas.offsetHeight

        this.renderer.setSize(this.width, this.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

    }

    /**
     * Destroy.
     */
    destroy() {
        this.destroyThreejs(this.scene)
    }

    destroyThreejs(obj) {
        while (obj.children.length > 0) {
            this.destroyThreejs(obj.children[0]);
            obj.remove(obj.children[0]);
        }
        if (obj.geometry) obj.geometry.dispose();

        if (obj.material) {
            //in case of map, bumpMap, normalMap, envMap ...
            Object.keys(obj.material).forEach(prop => {
                if (!obj.material[prop])
                    return;
                if (obj.material[prop] !== null && typeof obj.material[prop].dispose === 'function')
                    obj.material[prop].dispose();
            })
            // obj.material.dispose();
        }
    }
}