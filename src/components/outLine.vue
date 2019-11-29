
<template>
  <div style="width:100%;height:100%;">
    <div id="container"></div>
  </div>
</template>

<script>
  import * as Three from 'three'
  const OrbitControls = require('three-orbit-controls')(Three);
  import GLTFLoader from 'three-gltf-loader';
  import {RenderPass,EffectComposer,OutlinePass} from "three-outlinepass"

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
        compose:null,
        renderPass:null,
        outlinePass:null,
        selectedObjects:[]
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
        let textureCube = new Three.CubeTextureLoader()
          .setPath(`${this.publicPath}skybox/`)
          .load(['posx.jpg','negx.jpg','posy.jpg','negy.jpg','posz.jpg','negz.jpg'])
        this.scene.background = textureCube;

        //渲染
        this.renderer = new Three.WebGLRenderer({antialias: true,alpha:true}); //alpha为true可以去掉container默认背景
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMap.type = Three.PCFSoftShadowMap;
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);

        //添加辅助轴
        let axis = new Three.AxisHelper(10);
        this.scene.add(axis);

        this.compose = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene,this.camera);
        this.outlinePass = new OutlinePass(new Three.Vector2(container.clientWidth,container.clientHeight),this.scene,this.camera);
        this.outlinePass.renderToScreen = true;
        this.outlinePass.selectedObjects = this.selectedObjects;

        this.compose.addPass(this.renderPass);
        this.compose.addPass(this.outlinePass);

        let params = {
          edgeStrength: 2.0,
          edgeGlow: 0.4,
          edgeThickness: 1.0,
          pulsePeriod: 0,
          usePatternTexture: false
        };
        this.outlinePass.edgeStrength = params.edgeStrength;
        this.outlinePass.edgeGlow = params.edgeGlow;
        this.outlinePass.visibleEdgeColor.set(0x1381eb);
        this.outlinePass.hiddenEdgeColor.set(0xff00ff);
      },

      initControls:function(){
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
        this.scene.add(new Three.AmbientLight(0xeeeeee,0.9)); //环境光
        this.light =new Three.SpotLight(0xffffff,0.3);  //点光源
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
          obj.scene.position.set(x,y,z); //模型位置
          if(name==='camera.gltf'){
            obj.scene.scale.set(0.3,0.3,0.3);
            this.selectedObjects.push(obj.scene);
          }
          if(name==='closet.gltf'){
            this.selectedObjects.push(obj.scene);
          }
          if(rotY){ obj.scene.rotateY(rotY)}  //是否旋转模型
          that.scene.add(obj.scene);
          obj.scene.traverse(function (object) {
            if (object.isMesh) {
              object.castShadow = true;  //模型投射阴影
              object.receiveShadow = true; //模型表面接收其他模型的阴影
              // object.material.side = Three.DoubleSide;  //模型渲染成双面
              if(name==='wall.glb'){
                object.material.transparent = true;   //设置模型透明
                object.material.opacity = 0.1;   //模型透明强度，1为不透明
              }
            }
          });
        });
      },
      loadChair:function(){
        let axis = new Three.Vector3(0,1,0);
        for(let i = 0;i<13;i++){
          new GLTFLoader().load(`${this.publicPath}model/chair.gltf`,obj=>{
            if(i>0&&i<5){
              obj.scene.position.set(-46,0,12*i+3);
              obj.scene.rotateOnAxis(axis,-Math.PI/2)
            }else if(i===5){
              obj.scene.position.set(-68,0,0);
              obj.scene.rotateOnAxis(axis,-Math.PI);
            }else if(i>5&&i<10){
              obj.scene.position.set(-22,0,12*i-125);
              obj.scene.rotateOnAxis(axis,Math.PI/2);
            }else if(i>=10){
              obj.scene.position.set(10*i-120,0,-12);
              obj.scene.rotateOnAxis(axis,Math.PI);
            }
            this.scene.add(obj.scene);
            this.selectedObjects.push(obj.scene);
            obj.scene.traverse(object=>{
              if(object.isMesh){
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.side = Three.DoubleSide;
              }
            })

          })
        }
      },
      loadMesh:function(){
        //加载的外部模型,设置了位置和旋转等参数
        this.loadModel('asset.glb',0,0,0,null);
        this.loadModel('wall.glb',0,0,0,null);
        this.loadModel('closet.gltf',0,0,0,null);
        this.loadModel('closet.gltf',-50,0,0,null);
        this.loadModel('camera.gltf',-54,19,-35,Math.PI/4);
        this.loadModel('camera.gltf',54,19,-35,-Math.PI/4);
        this.loadModel('camera.gltf',-54,19,35,3*Math.PI/4);
        this.loadModel('camera.gltf',54,19,35,-3*Math.PI/4);
        this.loadChair();
      },
      initPlane:function(){
        //创建底部平面，默认是垂直于X轴平面的，需要旋转到平行于x轴平面
        let planeGeometry = new Three.PlaneGeometry(120,82);
        let planeMaterial = new Three.MeshLambertMaterial({color:0xafbac5,side:Three.DoubleSide});  //渲染双面
        let plane = new Three.Mesh(planeGeometry,planeMaterial);
        plane.rotation.x = -Math.PI/2;
        plane.receiveShadow = true;
        this.scene.add(plane);
        //添加网格
        let grid = new Three.GridHelper(160,40,0x222,0x222);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);
      },
      render:function(){
        this.clock = new Three.Clock();
        let time = this.clock.getDelta();
        requestAnimationFrame(this.render);

        if (this.mixer) {
          this.mixer.update(time);
        }
        this.controls.update(time);
        this.compose.render(time);
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
      this.initControls();
      this.initLight();
      this.loadMesh();
      this.render();
      this.initPlane();
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