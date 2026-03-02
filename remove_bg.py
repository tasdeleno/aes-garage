from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=240):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        r, g, b, a = item
        if r > tolerance and g > tolerance and b > tolerance:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")
    print(f"Background removed and saved to {output_path}")

remove_white_bg("C:/Users/X/.gemini/antigravity/brain/8e58fc64-8fc6-48b5-b2f3-a6c788f7cfe4/red_bmw_e36_topdown_1772489145573.png", "c:/Users/X/Desktop/aes_garage/frontend/src/assets/car-topdown.png")
