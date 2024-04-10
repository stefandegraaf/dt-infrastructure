import * as THREE from 'three';


export class FlightPath {

    private curve: THREE.CatmullRomCurve3;
    private time: number;
	private deltaTime: number;
    private speed: number;

    constructor(points: Array<THREE.Vector3>, speed: number) {
        this.curve = new THREE.CatmullRomCurve3(points);
        this.time = performance.now();
		this.deltaTime = 0;
        this.speed = speed ?? 0.0001;
    }

   // public getPoint(): THREE.Vector3 {
    //    return this.curve.getPoint(this.time % 1);
    //}

    public getTangent(): THREE.Vector3 {
        return this.curve.getTangent(this.deltaTime % 1);
    }

    public updateCamera(camera: THREE.PerspectiveCamera): void {
		let currentTime = performance.now();
		let deltaTime = (currentTime - this.time);
        this.time = currentTime; // Update the time to the current time
    	this.deltaTime += deltaTime * this.speed 
        const position = this.curve.getPoint(this.deltaTime % 1);
        camera.position.copy(position);
        const lookAt = position.clone().add(this.getTangent());
        camera.lookAt(lookAt);
    }
}

export class FlightPathCenter {

    private curve: THREE.CatmullRomCurve3;
    private time: number;
	private deltaTime: number;
    private speed: number;

    constructor(points: Array<THREE.Vector3>, speed: number) {
        this.curve = new THREE.CatmullRomCurve3(points);
        this.time = performance.now();
		this.deltaTime = 0;
        this.speed = speed ?? 0.0001;
    }

   // public getPoint(): THREE.Vector3 {
    //    return this.curve.getPoint(this.time % 1);
    //}

    public getTangent(): THREE.Vector3 {
        return this.curve.getTangent(this.deltaTime % 1);
    }

    public updateCamera(camera: THREE.PerspectiveCamera): void {
		let currentTime = performance.now();
		let deltaTime = (currentTime - this.time);
        this.time = currentTime; // Update the time to the current time
    	this.deltaTime += deltaTime * this.speed 
        const position = this.curve.getPoint(this.deltaTime % 1);
        camera.position.copy(position);
        //const lookAt = position.clone().add(this.getTangent());
        camera.lookAt(0, 2, 0);
    }

	public getCurrentPosition(): THREE.Vector3 {
		return this.curve.getPoint(this.deltaTime % 1);
	}
}

