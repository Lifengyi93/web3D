<template>
  <div style="width:100%;height:100%;">
    <div id="container"></div>
  </div>
</template>

<script>
  import * as Three from 'three'
  const OrbitControls = require('three-orbit-controls')(Three);
  import GLTFLoader from 'three-gltf-loader';
  // import {RenderPass,EffectComposer,OutlinePass} from "three-outlinepass"

  export default {
    name: 'ThreeTest',
    data() {
      return {
        camera: null,
        scene: null,
        renderer: null,
        light:null,
        controls:null,
        mixer:null,
        clock:null,
        publicPath: process.env.BASE_URL,
      }
    },
    methods: {
      init: function() {
        let container = document.getElementById('container');
        //相机
        this.camera = new Three.PerspectiveCamera(45, container.clientWidth/container.clientHeight, 0.1, 10000);
        this.camera.position.set(-80,80,80);
        this.camera.lookAt(new Three.Vector3(0,0,0));

        this.scene = new Three.Scene();
        //设置天空盒
        // let textureCube = new Three.CubeTextureLoader()
        //   .setPath(`${this.publicPath}skybox/`)
        //   .load(['posx.jpg','negx.jpg','posy.jpg','negy.jpg','posz.jpg','negz.jpg'])
        // this.scene.background = textureCube;
        //添加网格
        let grid = new Three.GridHelper(160,40,0x222,0x222);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);
        //渲染
        this.renderer = new Three.WebGLRenderer({antialias: true,alpha:true}); //alpha为true可以去掉container默认背景
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMap.type = Three.PCFSoftShadowMap;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
        //添加辅助轴
        let axis = new Three.AxisHelper(10);
        this.scene.add(axis);
        //场景控制
        this.controls = new OrbitControls(this.camera,this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableZoom = true;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 2000;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        //翻转最小，最大角
        this.controls.minPolarAngle = 0; // radians
        this.controls.maxPolarAngle = Math.PI/2; // radians
        //默认键盘控制上下左右的键
        this.controls.enableKeys = true;
        this.controls.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
      },
      //创建灯光
      initLight:function (){
        this.scene.add(new Three.AmbientLight(0xdddddd,0.9)); //环境光
        this.light =new Three.SpotLight(0xffffff,0.4);  //点光源
        this.light.position.set(-30,80,-20);
        this.light.castShadow = true;
        this.scene.add(this.light);
      },
      //创建模型的方法，参数表示（长,宽,高,模型在x,y,z轴位置,模型颜色,透明度）
      initMesh:function(a,b,c,x,y,z,hex,alpha){
        //添加物体
        let geometry = new Three.BoxGeometry(a, b, c);
        let material = new Three.MeshLambertMaterial({color:hex});
        let mesh = new Three.Mesh(geometry, material);
        mesh.position.set(x,y,z);
        mesh.material.transparent =true;
        mesh.material.opacity = alpha;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
      },
      //导入外部模型的方法，参数代表(模型文件名，模型在x,y,z轴位置，旋转角度)
      loadModel:function(name,x,y,z,rotY){
        let that = this;
        new GLTFLoader().load(`${that.publicPath}model/`+name, obj => {
          obj.scene.position.set(x,y,z);  //模型位置
          if(rotY){ obj.scene.rotateY(rotY)}  //是否旋转模型
          that.scene.add(obj.scene);
          obj.scene.traverse(function (object) {
            if (object.isMesh) {
              object.castShadow = true;  //模型投射阴影
              object.receiveShadow = true; //模型表面接收其他模型的阴影
              object.material.side = Three.DoubleSide;  //模型渲染成双面
              object.material.transparent = true;   //设置模型透明
              object.material.opacity = 0.9;   //模型透明强度，1为不透明
            }
          });
        });
      },
      loadMesh:function(){
        //多个颜色，位置，大小不同的几何体
        this.initMesh(10,10,10,10,5,-30,0xff0000,0.8);
        this.initMesh(6,10,6,-10,5,-30,0xffff00,0.8);
        this.initMesh(12,10,12,10,5,10,0xff00ff,0.8);
        this.initMesh(12,20,12,-20,14,-2,0x428da3,0.7);
        this.initMesh(6,10,6,-10,5,30,0xdddddd,0.5);
        this.initMesh(10,5,5,0,25,0,0xdd7e17,0.5);
        //加载的外部模型,设置了位置和旋转等参数
        this.loadModel('chair.gltf',14,0,24);
        this.loadModel('chair.gltf',44,9.8,36);
        this.loadModel('chair.gltf',24,0,16,Math.PI/6);
      },
      //创建底部平面，默认是垂直于X轴平面的，需要旋转到平行于x轴平面
      loadPlane:function(){
        let planeGeometry = new Three.PlaneGeometry(140,90);
        let planeMaterial = new Three.MeshLambertMaterial({color:0x808c98,side:Three.DoubleSide});  //渲染双面
        let plane = new Three.Mesh(planeGeometry,planeMaterial);
        plane.rotation.x = -Math.PI/2;
        plane.receiveShadow = true;
        this.scene.add(plane);
      },
      render:function(){
        let that = this;
        let clock = new Three.Clock();
        let time = clock.getDelta();
        if (that.mixer) {
          that.mixer.update(time);
        }
        this.controls.update();
      },
      animate: function() {
        requestAnimationFrame(this.animate);
        this.render();
        this.renderer.render(this.scene, this.camera);
      },
      //自适应窗口大小
      onWindowResize:function(){
        let container = document.getElementById('container');
        this.camera.aspect = container.clientWidth/container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth,container.clientHeight)
      }
    },
    mounted() {
      this.init();
      this.initLight();
      this.loadMesh();
      this.animate();
      this.loadPlane();
      window.addEventListener('resize',this.onWindowResize,false);
    }
  }
</script>
<style scoped>
  #container {
    width:100%;
    height:100%;
  }
</style>