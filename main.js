let orig_scale = 1, scale = 1;
let global_submit_event = null;
document.getElementById('zoom_out').addEventListener('click',(e)=>{
    scale-=0.05
    document.getElementById("output").style.transform = `scale(${scale})`;
})
document.getElementById('zoom_in').addEventListener('click',(e)=>{
    scale+=0.05
    document.getElementById("output").style.transform = `scale(${scale})`;
});
document.getElementById('zoom_reset').addEventListener('click',(e)=>{
    scale=orig_scale
    document.getElementById("output").style.transform = `scale(${scale})`;
});
let header_height = document.getElementById("header").offsetHeight;
document.getElementById("output").style.marginTop = `${header_height}px`;

window.addEventListener('resize',()=>{
    let header_height = document.getElementById("header").offsetHeight;
    document.getElementById("output").style.marginTop = `${header_height}px`;
    if(global_submit_event){
        convert_image(global_submit_event);
    }

})
const get_character = (gray,type)=>{
    // const mappings = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'.";
    
    const mappings = " .:-=+*#%@";
    let t = gray/255;
    switch (type) {
        case 0:
            t = gray/255;
            break;
        case 1:
            t = 1- gray/255;
            break;
        default:
            break;
    }
    t *= mappings.length-1;
    return mappings[Math.floor(t)];
}

const to_grayScale = (r,g,b)=>(0.299*r + 0.587*g + 0.114*b);
const output_text = (output_string, bg_type)=>{
    let bg_color, font_color;
    switch (bg_type) {
        case 0:
            bg_color = "#000";
            font_color = "#fff";
            break;
        case 1:
            bg_color = "#fff";
            font_color = "#000";
            break;
        default:
            break;
    }

    document.getElementById("output").style.color = font_color;
    document.getElementById("output").style.backgroundColor = bg_color;
    let new_width = Math.max(Math.round(0.6*window.innerWidth), 500);
    new_width = Math.min(new_width, window.innerWidth);
    document.getElementById("output").innerText = output_string;
    let abs_width = parseInt(document.getElementById("output").offsetWidth);
    console.log(new_width, abs_width);
    orig_scale = new_width/abs_width;
    scale = new_width/abs_width;
    document.getElementById("output").style.transform = `scale(${new_width/abs_width})`;
    
    
}
const convert_image_helper = (file, img_width, bg_type)=>{
    const url = URL.createObjectURL(file);
    let img = new Image();
    console.log(window.innerHeight, window.innerWidth);
    img.onload = (e)=>{
        let c = document.createElement('canvas');
        width = Math.min(img_width, img.width);
        height = Math.floor((img.height/img.width)*width);
        c.width = width;
        c.height = height;
        let ctx = c.getContext("2d");
        ctx.drawImage(img,0,0,width, height);
        let imgData = ctx.getImageData(0,0,c.width, c.height);
        let output_string = "";
        let z = 0;
        for(let i = 0; i<imgData.data.length; i+=4){
            z++;
            const r = imgData.data[i];
            const g = imgData.data[i + 1];
            const b = imgData.data[i + 2];
            const a = imgData.data[i + 3];
            let gray = to_grayScale(r,g,b);
            imgData.data[i] = gray;
            imgData.data[i + 1] = gray;
            imgData.data[i + 2] = gray;
            output_string += get_character(gray, bg_type);
            if(z%width==0){
                output_string+="\n";
                z=0;
            }  
        }
        ctx.putImageData(imgData,0,0);
        output_text(output_string, bg_type);
        console.log(window.innerHeight, window.innerWidth);
    }
    img.src = url;
    
};

function convert_image(e){
    e.preventDefault();
    global_submit_event = e;
    let image_file = e.target.children[0].files[0];
    let image_width = parseInt(e.target.children[1].children[0].value);
    let image_bg_type = parseInt(e.target.children[2].children[0].value);
    convert_image_helper(image_file, image_width, image_bg_type);
    return false;
};

