from keras.preprocessing import image
import numpy as np
from keras.models import load_model
import base64
import sys

def decode(str):
    imgdata = base64.b64decode(str)
    filename = 'some_image.jpg'  
    with open(filename, 'wb') as f:
        f.write(imgdata)
    return filename

str = ""
for line in sys.stdin:
  str = str + line 
file = decode(str)

img = image.load_img(file,target_size=(224,224))
img = np.asarray(img)
img = np.expand_dims(img, axis=0)


saved_model = load_model("C:/Users\HP/ceng-407-408-2019-2020-Skin-Cancer-Detection-appDermis-/server/appDermis_vgg16.h5")
output = saved_model.predict(img)

if output==[1]:
    print("Risk grubundasınız.")
elif output==[0]:
    print("Risk grubunda degilsiniz.")
else:
    print("Lütfen tekrar deneyin.")
