
import { _decorator, Component, Node,macro, Sprite, Material } from 'cc';
const { ccclass, property } = _decorator;


 
@ccclass('MainScene')
export class MainScene extends Component {

    private analyser:AnalyserNode = null;
    private dataArray:Uint8Array = null;
    private spriteMaterial: Material = null;
   
    @property({type:Sprite})
    starField:Sprite = null;

    start () {
        const spriteMaterial = this.starField.getMaterial(0);
        this.spriteMaterial = spriteMaterial;
        setTimeout(()=>{
            this.startRecord();
        },100)
    }

    init(){

    }

    startRecord(){
        const ac = new (window.AudioContext)();
        var analyser = ac.createAnalyser();
        analyser.fftSize = 2048;
        this.analyser = analyser;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        this.dataArray = dataArray;

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const source = ac.createMediaStreamSource(stream)
            // 绘制一个当前音频源的示波器
            const draw = ()=> {
                analyser.getByteFrequencyData(dataArray);
                let barHeight = 0;
                for (var i = 0; i < bufferLength; i++) {
                    if(dataArray[i]>barHeight){
                        barHeight = dataArray[i];
                    }
                }
                
                this.spriteMaterial.setProperty('soundFrequency',barHeight/300-.25);
            };

            this.schedule(draw,0,Infinity);

            source.connect(analyser)

        })
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.3/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.3/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.3/manual/en/scripting/life-cycle-callbacks.html
 */
