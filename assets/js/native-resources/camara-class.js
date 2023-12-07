class Camera{
  constructor(node){
    this.node = node;
  }
  powerOn(){
    navigator.mediaDevices.getUserMedia({
      audio:false,
      video: {width:300, height: 300},
    })
    .then((stream)=>{
      this.node.srcObject = stream;
      this.stream = stream;
    });
  }
  powerOff(){
    this.node.pause();
    if (this.stream) this.stream.getTracks()[0].stop();
  }
  takeAPhoto(){
    let canvas = document.createElement('canvas');
    canvas.setAttribute('width',300);
    canvas.setAttribute('height',300);
    let context = canvas.getContext('2d');
    context.drawImage(this.node, 0,0, canvas.width, canvas.height);
    this.photo = context.canvas.toDataURL();
    canvas = null;
    context = null;
    return this.photo;
  }
}